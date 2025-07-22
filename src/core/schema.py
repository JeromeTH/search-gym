from typing import List, Optional, Union, Literal
from src.core.interface import StoredConfig
from pydantic import BaseModel, model_validator, ConfigDict
from enum import Enum
from pymilvus import DataType
from typing import Any, Dict, Type, Self
from src.core.util import deterministic_get_id
import json
from datetime import datetime

class StaticBaseModel(BaseModel): 
    model_config = ConfigDict(frozen=True)

class EntryType(str, Enum):
    STRING = "str"
    INTEGER = "int"
    FLOAT = "float"
    BOOLEAN = "bool"

    def default_value(self):
        return {
            "str": "",
            "int": 0,
            "float": 0.0,
            "bool": False
        }[self.value]

    def to_python_type(self):
        return {
            "str": str,
            "int": int,
            "float": float,
            "bool": bool
        }[self.value]

    def to_milvus_type(self):
        return {
            "str": DataType.VARCHAR,
            "int": DataType.INT64,
            "float": DataType.FLOAT,
            "bool": DataType.BOOL
        }[self.value]

class EntryMeta(StaticBaseModel):
    """
    Metadata for a field in a document, used to define its type and constraints.
    
    Attributes:
        name (str): The name of the field.
        type (EntryType): The type of the field, such as STRING, INTEGER, etc.
        max_length (Optional[int]): Maximum length for string fields.
        is_required (bool): Whether this field is required.
    """
    name: str
    type: EntryType
    max_length: int
    is_required: bool = True

# --- Field object used in both content and metadata ---
class Entry(StaticBaseModel):
    """
    A representation of a field in a document, used in both content and metadata.

    Attributes:
        name (str): The name of the field (e.g., "title", "abstract").
        contents (List[Any]): The values contained in the field (e.g., token list, raw strings).
        max_len (int): The maximum length constraint for this field (used for truncation or padding).
        type (FieldType): The type of the field, such as TEXT, KEYWORD, or TITLE.
    """
    meta: EntryMeta
    contents: List[Any] = []


class Filter(StaticBaseModel): 
    name: str
    filter_type: Literal["filter", "must"]
    
# ---------------- Dataset Configs ----------------
class DatasetConfig(StoredConfig):
    # id: str # Already provided by StoredConfig
    name: str
    description: Optional[str] = None
    root: str
    format: Literal["json"]
    metadata: List[EntryMeta] = []
    channels: List[EntryMeta] = []  # List of channel names, e.g.,
    filters: List[Filter] = []  # List of filters for the dataset
    created_by: Optional[str] = None

    @model_validator(mode="after")
    def check_filter_names(self) -> Self: 
        if not any(f.name == "id" for f in self.filters): 
            raise ValueError("Dataset must have an 'id' filter.")
        for f in self.filters: 
            if f.name != "id" and f.name not in [m.name for m in self.metadata]: 
                raise ValueError(f"Filter {f.name} not found in metadata fields.")
        return self
    
    def get_entry(self, name: str) -> EntryMeta:
        for entry in self.metadata + self.channels:
            if entry.name == name:
                return entry
        raise KeyError(f"Entry '{name}' not found in dataset schema.")

    def get_filter(self, name: str) -> Filter:
        for f in self.filters:
            if f.name == name:
                return f
        raise KeyError(f"Filter '{name}' not found in dataset filters.")
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "DatasetConfig":
        if "id" not in data:
            # Remove unstable fields like `created_by`
            stable_data = {k: v for k, v in data.items() if k != "created_by"}
            stable_str = json.dumps(stable_data, sort_keys=True)
            data["id"] = deterministic_get_id(stable_str)
        return cls(**data)

# ---------------- Router and Reranker ----------------

class RouterConfig(StaticBaseModel):
    type: Literal["simple"]

class RerankerConfig(StaticBaseModel):
    type: Literal["identity", "auto_model"]

# ---------------- Embedder ----------------

class AutoModelEmbedderConfig(StaticBaseModel):
    type: Literal["auto_model"]
    embedding_type: Literal["dense"]
    model_name: str

class BGEEmbedderConfig(StaticBaseModel):
    type: Literal["bge"]
    embedding_type: Literal["sparse"]
    model_name: str

EmbedderConfig = Union[AutoModelEmbedderConfig, BGEEmbedderConfig]

# ---------------- Chunker ----------------
class LengthChunkerConfig(StaticBaseModel):
    type: Literal["length_chunker"]
    chunk_size: int = 512
    overlap: int = 50

class SentenceChunkerConfig(StaticBaseModel):
    type: Literal["sentence_chunker"]
    language: Literal["en", "zh"]

ChunkerConfig = Union[LengthChunkerConfig, SentenceChunkerConfig]

# ---------------- VectorSet ----------------
class VectorSetConfig(StoredConfig):
    # id: str # Already provided by StoredConfig
    root: str
    dataset: DatasetConfig
    channel: str
    chunker: ChunkerConfig
    embedder: EmbedderConfig

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "VectorSetConfig":
        """
        Assumes:
        - `dataset` is already a DatasetConfig.
        - All fields are valid.
        - `id` is deterministically generated from core fields.
        """

        if "id" not in data:
            key_data = {
                "root": data["root"],
                "channel": data["channel"],
                "chunker": data["chunker"],
                "embedder": data["embedder"],
                "dataset_id": data["dataset"].id,
            }
            data["id"] = deterministic_get_id(str(key_data))
        return cls(**data)

# ---------------- Search Engine Configs ----------------

class MilvusConfig(StaticBaseModel):
    type: Literal["milvus"]
    vector_set: VectorSetConfig
    def get_dataset(self) -> DatasetConfig:
        return self.vector_set.dataset

class HybridMilvusConfig(StaticBaseModel):
    type: Literal["hybrid_milvus"]
    sparse_vector_set: VectorSetConfig
    dense_vector_set: VectorSetConfig
    alpha: float = 0.5  # Weight for sparse vs dense scores

    @model_validator(mode="after")
    def check_vector_sets(self) -> Self:
        if self.sparse_vector_set.embedder.embedding_type != "sparse":
            raise ValueError("Sparse vector set must use a sparse embedder.")
        if self.dense_vector_set.embedder.embedding_type != "dense":
            raise ValueError("Dense vector set must use a dense embedder.")
        if self.sparse_vector_set.dataset != self.dense_vector_set.dataset:
            raise ValueError("Sparse and dense vector sets must belong to the same dataset.")
        if self.sparse_vector_set.channel != self.dense_vector_set.channel:
            raise ValueError("Sparse and dense vector sets must have the same channel.")
        if self.sparse_vector_set.chunker != self.dense_vector_set.chunker:
            raise ValueError("Sparse and dense vector sets must have the same chunker.")
        return self
    
    def get_dataset(self) -> DatasetConfig:
        return self.dense_vector_set.dataset

class ElasticSearchConfig(StaticBaseModel):
    type: Literal["elasticsearch"]
    dataset: DatasetConfig
    es_host: str
    es_index: str

    def get_dataset(self) -> DatasetConfig:
        return self.dataset


class SequentialConfig(StaticBaseModel):
    type: Literal["sequential"]
    engines: List[Union[MilvusConfig, ElasticSearchConfig, HybridMilvusConfig]]

    @model_validator(mode="after")
    def check_engines(self) -> Self:
        if not self.engines:
            raise ValueError("SequentialConfig must have at least one engine.")
        dataset = self.engines[0].get_dataset()
        for engine in self.engines:
            if engine.get_dataset() != dataset:
                raise ValueError("All engines in SequentialConfig must belong to the same dataset.")
        return self
    
    def get_dataset(self) -> DatasetConfig:
        if not self.engines:
            raise ValueError("SequentialConfig must have at least one engine.")
        return self.engines[0].get_dataset()

SearchEngineConfig = Union[
    MilvusConfig, 
    ElasticSearchConfig, 
    HybridMilvusConfig, 
    SequentialConfig
]


# ---------------- App Config ----------------

class AppConfig(StoredConfig):
    '''
    A image of an existing app that is ready to be activated. 
    Front-end form data has to be enriched by backend with weave urls, ids, timestamps, and vector store roots to reach this stage. 
    '''
    # id: str # Already provided by StoredConfig
    name: str
    description: Optional[str] = None

    search_engines: List[SearchEngineConfig]
    router: RouterConfig
    reranker: RerankerConfig
    max_files: int = 1000000  # For memory safety, default to 1 million

    weave_url: Optional[str] = None
    created_by: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "AppConfig":
        """
        Construct a validated AppConfig object from a raw dict. Inject ID if not present.
        All nested objects (e.g., vector set, search engine, etc.) should already be valid dicts.
        Requires: All nested search engine configs are already pydantic models. 
        """
        if "id" not in data:
            # Create a deterministic ID from name + search_engines + router + reranker (exclude timestamps)
            id_source = {
                "name": data["name"],
                "search_engines": data["search_engines"],
                "router": data["router"],
                "reranker": data["reranker"],
            }
            data["id"] = deterministic_get_id(str(id_source))

        # Inject timestamps if not provided
        now_str = datetime.now().isoformat()
        data.setdefault("created_at", now_str)
        data.setdefault("updated_at", now_str)
        return cls(**data)