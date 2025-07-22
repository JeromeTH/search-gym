from typing import List, Optional, Dict, Type, Tuple, Union, Any
from src.core.document import Document, EntryType
from src.core.embedder import BaseEmbedder, SparseEmbedder, DenseEmbedder
from src.core.collection import FieldConfig, IndexConfig, CollectionConfig, CollectionOperator, CollectionBuilder
from src.core.elastic import ElasticIndexBuilder, ElasticIndexConfig
from src.core.vector_set import BaseVectorSet
from src.core.schema import SearchEngineConfig, MilvusConfig, HybridMilvusConfig, ElasticSearchConfig, SequentialConfig, DatasetConfig
from src.core.util import get 
from functools import reduce
from typing import List
from pymilvus import (
    DataType,
    Collection,
)
from pymilvus.client.abstract import Hits, Hit
from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk
from pydantic import BaseModel
import yaml
import logging
from scipy.sparse import csr_array, vstack
from src.core.util import coalesce
from abc import ABC, abstractmethod

logger = logging.getLogger('taihu')
model_config = yaml.safe_load(open("config/model.yml", "r"))
class SearchSpec(BaseModel):
    '''
    Description of the strengths and weaknesses of a search engine, used by router to determine which search engine to use.
    '''
    name: str
    optimal_for: Optional[str] = None # e.g., "strong", "weak" filters 
    

class SearchEngine(ABC): 
    '''
    Highest level class that inserts documents and retrieves answers based on natural language queries and metadata filters. 
    '''
    @abstractmethod
    def setup(self) -> None:
        """
        Sets up the database connection and initializes necessary components.
        This method should be called before any other operations.
        """
        pass

    @abstractmethod    
    def insert(self, docs: List[Document]) -> None:
        """
        Inserts a list of documents into the database.
        :param docs: A list of Document objects to be inserted.
        """
        pass 

    @abstractmethod
    def search(self, query: str, filter: Dict[str, List[str]], limit: Optional[int]) -> List[str]:
        """
        Searches for documents based on a natural language query and optional metadata filters.
        :param query: The natural language query to search for.
        :param filter: Optional metadata filters to apply to the search.
        :param limit: The maximum number of documents to return.
        :return: A list of document IDs that match the search criteria.
        """
        pass

    @abstractmethod    
    def config(self) -> SearchEngineConfig:
        """
        Returns the configuration of the search engine.
        :return: An instance of SearchEngineConfig containing the search engine parameters.
        """
        pass
    
    @classmethod
    def from_config(cls, config: SearchEngineConfig) -> 'SearchEngine':
        """
        Factory method to create a SearchEngine instance from a configuration.
        :param config: Configuration object containing search engine parameters.
        :return: An instance of SearchEngine.
        """
        if isinstance(config, MilvusConfig):
            return MilvusSearchEngine(config)
        elif isinstance(config, HybridMilvusConfig):
            return HybridMilvusSearchEngine(config)
        elif isinstance(config, ElasticSearchConfig):
            return ElasticSearchEngine(config)
        elif isinstance(config, SequentialConfig):
            return Sequential(config)
        else:
            raise ValueError(f"Unknown search engine type: {config.type}. Supported types: 'milvus', 'hybrid_milvus', 'elastic_search', 'sequential'.")
        
    @abstractmethod
    def spec(self) -> SearchSpec: 
        pass
class Sequential(SearchEngine):
    """
    A compositional search engine where each engine refines the result of the previous.
    The first engine runs unconstrained; all others receive a filtered ID set.
    """
    def __init__(self, config: SequentialConfig):
        self.engine_config = config
        self.engines: List[SearchEngine] = [SearchEngine.from_config(engine_cfg) for engine_cfg in config.engines]

    @classmethod
    def from_config(cls, config: SequentialConfig) -> 'Sequential':
        """
        Factory method to create a Sequential instance from a configuration.
        :param config: Configuration object containing sequential search engine parameters.
        :return: An instance of Sequential.
        """
        engines = [SearchEngine.from_config(engine_cfg) for engine_cfg in config.engines]
        return cls(engines=engines)

    def setup(self):
        for engine in self.engines:
            engine.setup()

    def insert(self, docs: List[Document]):
        for engine in self.engines:
            engine.insert(docs)

    def search(self, query: str, filter: Dict[str, List[str]], limit: int = 10) -> List[str]:
        current_filter = filter
        for i, engine in enumerate(self.engines):
            subset_ids = engine.search(query, current_filter, limit=limit)
            # Feed filtered results to the next stage
            if i < len(self.engines) - 1:
                assert "id" in current_filter, "Sequential search requires 'id' in filter for subsequent engines"
                current_filter = current_filter.update({"id": subset_ids})
        return subset_ids
    
    def config(self) -> SearchEngineConfig:
        """
        Returns the configuration of the sequential search engine.
        :return: An instance of SearchEngineConfig containing the sequential search engine parameters.
        """
        return self.engine_config.model_copy()

    def spec(self) -> SearchSpec:
        names = " → ".join(e.spec().name for e in self.engines)
        return SearchSpec(name=f"sequential({names})", optimal_for="cascaded")

class BaseMilvus(ABC):
    def _get_metadata_fields(self, dataset: DatasetConfig) -> List[FieldConfig]:
        fields = [
            FieldConfig(name="pk", dtype=DataType.VARCHAR, is_primary=True, max_length=100)
        ]
        for f in dataset.filters:
            if f.filter_type == "filter":
                entry = dataset.get_entry(f.name)
                fields.append(FieldConfig(
                    name=entry.name,
                    dtype=entry.type.to_milvus_type(),
                    max_length=entry.max_length
                ))
        return fields

    def _get_query_expr(self, dataset: DatasetConfig, filter: Dict[str, List[str]]) -> Optional[str]:
        clauses = []
        logger.debug("milvus does not support must fields, only filter fields")
        for key, values in filter.items():
            f = dataset.get_filter(key)
            if f.filter_type != "filter":
                logger.warning(f"Filter {key} is not a filter type, skipping")
                continue
            field_type = dataset.get_entry(f.name).type
            if field_type in {EntryType.STRING, EntryType.BOOLEAN}:
                formatted = ",".join(f'"{v}"' for v in values)
            else:
                formatted = ",".join(f"{v}" for v in values)
            clauses.append(f"{key} in [{formatted}]")
        return " and ".join(clauses) if clauses else None

    def _group_chunk_ids(self, chunk_ids: List[str]) -> List[str]:
        return list({cid.split("-")[0] for cid in chunk_ids})

    @staticmethod
    def build_metadata_dict(
        docs: List[Document],
        dataset: DatasetConfig,
        chunk_sizes: Dict[str, int]
    ) -> Dict[str, List[Any]]:
        """
        Build a metadata dictionary for insert based on dataset filters and chunk counts.

        Args:
            docs: List of documents to insert.
            dataset: DatasetConfig object describing filters and field types.
            chunk_sizes: Dict mapping doc_id to number of chunks (used to repeat metadata values).

        Returns:
            Dict[str, List[Any]] suitable for Milvus insert.
        """
        metadata_dict: Dict[str, List[Any]] = {}

        for f in dataset.filters:
            if f.filter_type != "filter":
                continue

            values = []
            for doc in docs:
                doc_id = doc.key()
                repeat = chunk_sizes[doc_id]
                val = coalesce(
                    get(doc.metadata()[f.name].contents, 0),
                    doc.metadata()[f.name].meta.type.default_value()
                )
                values.extend([val] * repeat)

            metadata_dict[f.name] = values

        return metadata_dict




class HybridMilvusSearchEngine(BaseMilvus, SearchEngine):
    def __init__(
        self,
        config: HybridMilvusConfig,
        alpha = 0.5, 
        force_rebuild: bool = False,
    ):
        self.engine_config = config
        self.dense_vector_set = BaseVectorSet.from_config(config.dense_vector_set)
        self.sparse_vector_set = BaseVectorSet.from_config(config.sparse_vector_set)
        self.alpha = alpha
        self.force_rebuild = force_rebuild
        self.dataset = config.dense_vector_set.dataset
        self.channel = config.dense_vector_set.channel
      
        
        
        self.dense_embedder = BaseEmbedder.from_config(config.dense_vector_set.embedder)
        self.sparse_embedder = BaseEmbedder.from_config(config.sparse_vector_set.embedder)
        #collection name has to be different enough so that collections don't collide. But even if collections of different 
        #config but same name do collide, the collection builder would handle it can build a new one. 
        dense_model = config.dense_vector_set.embedder.model_name
        sparse_model = config.sparse_vector_set.embedder.model_name
        self.collection_name = (f"dense={model_config[dense_model]['alias']}_\
                                sparse={model_config[sparse_model]['alias']}_\
                                dataset={self.dataset.name}_\
                                channel={self.channel}")
        
        fields = self._get_metadata_fields(self.dataset)
        fields += [
            FieldConfig(name="sparse_vector", dtype=DataType.SPARSE_FLOAT_VECTOR),
            FieldConfig(name="dense_vector", dtype=DataType.FLOAT_VECTOR, dim=self.dense_vector_set.embedder.get_dim())
        ]

        self.collection_config = CollectionConfig(
            collection_name=self.collection_name,
            fields=fields,
            indexes=[
                IndexConfig(
                    field_name="sparse_vector",
                    index_params={"index_type": "SPARSE_INVERTED_INDEX", "metric_type": "IP"}
                ),
                IndexConfig(
                    field_name="dense_vector",
                    index_params={
                        "index_type": "IVF_FLAT",
                        "metric_type": "IP",
                        "params": {"nlist": 128}
                    }
                )
            ]
        )

    def setup(self):
        logger.info(f"Setting up Milvus collection: {self.collection_config.collection_name}, force_rebuild={self.force_rebuild}")
        builder = CollectionBuilder.from_config(self.collection_config)
        builder.connect()
        self.collection = (builder.build() 
                           if self.force_rebuild 
                           else coalesce(builder.get_existing, builder.build))
        self.dense_vector_set.setup()
        self.sparse_vector_set.setup()
        self.operator = CollectionOperator(self.collection)

    def embed_query(self, query: str):
        dense = self.dense_embedder.embed([query])[0]
        sparse = self.sparse_embedder.embed([query])
        assert sparse.shape[0] == 1, "Expected a single-row sparse vector"
        return dense, sparse._getrow(0)

    def insert(self, documents: List[Document]):
        assert all(doc.source() == self.dense_vector_set.source for doc in documents), "All documents must belong to the same dataset"
        existing_pks = set()
        if documents:
            keys = [doc.key() for doc in documents]
            expr = f'pk in ["{"","".join(keys)}"]'
            self.collection.load()
            results = self.collection.query(expr, output_fields=["pk"])
            existing_pks = {res["pk"] for res in results}

        new_docs = [doc for doc in documents if doc.key() not in existing_pks]
        if not new_docs:
            return
        
        self.dense_vector_set.upsert([doc for doc in new_docs if not self.dense_vector_set.has(doc.key())])
        self.sparse_vector_set.upsert([doc for doc in new_docs if not self.sparse_vector_set.has(doc.key())])

        ids = [doc.key() for doc in new_docs]
        dense_embeddings = self.dense_vector_set.retrieve(ids)  # Dict[str, List[List[float]]]
        sparse_embeddings = self.sparse_vector_set.retrieve(ids)  # Dict[str, csr_array]

        chunk_sizes: Dict[str, int] = {doc_id: len(dense_embeddings[doc_id]) for doc_id in ids}
        insert_dict = {
            "pk": [f"{doc_id}-{i}" for doc_id in ids for i in range(chunk_sizes[doc_id])],
            "dense_vector": reduce(lambda x, y: x + y, [dense_embeddings[doc_id] for doc_id in ids], []),
            "sparse_vector": vstack([sparse_embeddings[doc_id] for doc_id in ids])
        }
        insert_dict.update(
            self.build_metadata_dict(new_docs, self.dataset, chunk_sizes)
        )
        self.operator.buffered_insert([insert_dict[k] for k in self.collection_config.field_names()])

    def search(self, query: str, filter: Dict[str, List[str]], limit: int = 100) -> List[str]:
        dense_vector, sparse_vector = self.embed_query(query)
        expr = self._get_query_expr(self.dataset, filter)
        results = self.operator.search_hybrid(
            dense_vector=dense_vector,
            sparse_vector=sparse_vector,
            alpha=self.alpha,
            limit=limit,
            output_fields=["pk"],
            expr=expr
        )
        return self._group_chunk_ids([hit.fields.get("pk", "") for hit in results[0]])
    
    def config(self) -> SearchEngineConfig:
        """
        Returns the configuration of the hybrid Milvus search engine.
        :return: An instance of SearchEngineConfig containing the hybrid Milvus search engine parameters.
        """
        return self.engine_config.model_copy()

    def spec(self) -> SearchSpec:
        return SearchSpec(name="milvus_search_engine", optimal_for="weak")

class MilvusSearchEngine(BaseMilvus, SearchEngine):
    def __init__(
        self,
        config: MilvusConfig,
        force_rebuild: bool = True,
    ):
        self.engine_config = config
        self.vector_set = BaseVectorSet.from_config(config.vector_set)
        self.embedder = BaseEmbedder.from_config(config.vector_set.embedder)
        self.force_rebuild = force_rebuild

        self.dataset = config.vector_set.dataset
        self.channel = config.vector_set.channel
        self.vector_type = config.vector_set.embedder.embedding_type

        model = config.vector_set.embedder.model_name
        self.collection_name = (
            f"{model_config[model]['alias']}_"
            f"{self.dataset.name}_{self.channel}_collection"
        )
        fields = self._get_metadata_fields(self.dataset)

        if self.vector_type == "dense":
            fields.append(FieldConfig(name="dense_vector", dtype=DataType.FLOAT_VECTOR, dim=self.embedder.get_dim()))
            indexes = [
                IndexConfig(
                    field_name="dense_vector",
                    index_params={
                        "index_type": "IVF_FLAT",
                        "metric_type": "IP",
                        "params": {"nlist": 128}
                    }
                )
            ]
        elif self.vector_type == "sparse":
            fields.append(FieldConfig(name="sparse_vector", dtype=DataType.SPARSE_FLOAT_VECTOR))
            indexes = [
                IndexConfig(
                    field_name="sparse_vector",
                    index_params={"index_type": "SPARSE_INVERTED_INDEX", "metric_type": "IP"}
                )
            ]
        else:
            raise ValueError(f"Unsupported vector type: {self.vector_type}")

        self.collection_config = CollectionConfig(
            collection_name=self.collection_name,
            fields=fields,
            indexes=indexes
        )

    def setup(self):
        logger.info(f"Setting up Milvus collection: {self.collection_config.collection_name}, force_rebuild={self.force_rebuild}")
        builder = CollectionBuilder.from_config(self.collection_config)
        builder.connect()
        self.collection = (
            builder.build() if self.force_rebuild
            else coalesce(builder.get_existing, builder.build)
        )
        self.vector_set.setup()
        self.operator = CollectionOperator(self.collection)

    def embed_query(self, query: str):
        embedding = self.embedder.embed([query])
        if self.vector_type == "dense":
            assert isinstance(embedding, list) and len(embedding) == 1
            return embedding[0]
        elif self.vector_type == "sparse":
            assert isinstance(embedding, csr_array) and embedding.shape[0] == 1
            return embedding._getrow(0)

    def insert(self, documents: List[Document]):
        existing_pks = set()
        if documents:
            keys = [doc.key() for doc in documents]
            expr = f'pk in ["{"","".join(keys)}"]'
            self.collection.load()
            results = self.collection.query(expr, output_fields=["pk"])
            existing_pks = {res["pk"] for res in results}

        new_docs = [doc for doc in documents if doc.key() not in existing_pks]
        if not new_docs:
            return

        self.vector_set.upsert([doc for doc in new_docs if not self.vector_set.has(doc.key())])
        embeddings = self.vector_set.retrieve([doc.key() for doc in new_docs])

        ids = [doc.key() for doc in new_docs]
        insert_dict = {
            "pk": [f"{doc_id}-{i}" for doc_id in ids for i in range(len(embeddings[doc_id]))],
        }
        if self.vector_type == "dense":
            insert_dict["dense_vector"] = reduce(
                lambda x, y: x + y, [embeddings[doc_id] for doc_id in ids], []
            )
        elif self.vector_type == "sparse":
            insert_dict["sparse_vector"] = vstack([embeddings[doc_id] for doc_id in ids])

        chunk_sizes: Dict[str, int] = {doc_id: len(embeddings[doc_id]) for doc_id in ids}
        insert_dict.update(
            self.build_metadata_dict(new_docs, self.dataset, chunk_sizes)
        )
        self.operator.buffered_insert([insert_dict[k] for k in self.collection_config.field_names()])

    def search(self, query: str, filter: Dict[str, List[str]], limit: int = 100) -> List[str]:
        query_vector = self.embed_query(query)
        expr = self._get_query_expr(self.dataset, filter)
        results = self.operator.search(
            query_vector=query_vector,
            anns_field=self.vector_type + "_vector",
            limit=limit,
            expr=expr,
            output_fields=["pk"]
        )
        return self._group_chunk_ids([hit.fields.get("pk", "") for hit in results[0]])

    def config(self) -> SearchEngineConfig:
        """
        Returns the configuration of the Milvus search engine.
        :return: An instance of SearchEngineConfig containing the Milvus search engine parameters.
        """
        return self.engine_config.model_copy()
    
    def spec(self) -> SearchSpec:
        return SearchSpec(name="milvus_search_engine", optimal_for="weak")
    


class ElasticSearchEngine(SearchEngine):
    def __init__(self, config: ElasticSearchConfig, force_rebuild: bool = False):
        self.engine_config = config
        self.dataset = config.dataset
        self.es_index = config.es_index
        self.force_rebuild = force_rebuild

        # Connect to Elastic instance
        yaml_config = yaml.safe_load(open("config/elastic_search.yml", "r"))
        self.es = Elasticsearch(
            [config.es_host],
            basic_auth=("elastic", yaml_config["password"]),
            verify_certs=True,
            ca_certs=yaml_config["ca_certs"]
        )

        # Map filter fields to elastic field types
        self.field_types = {
            f.name: self.dataset.get_entry(f.name).type.to_elastic_type()
            for f in self.dataset.filters
        }

    @classmethod
    def from_config(cls, config: ElasticSearchConfig) -> "ElasticSearchEngine":
        return cls(config)

    def setup(self):
        builder = ElasticIndexBuilder(
            es=self.es,
            config=ElasticIndexConfig(
                es_index=self.es_index,
                fields=self.field_types
            )
        )
        builder.build(force_rebuild=self.force_rebuild)

    def insert(self, docs: List[Document]):
        actions = []
        for doc in docs:
            doc_id = doc.key()
            if self.es.exists(index=self.es_index, id=doc_id):
                continue

            body = {}
            for f in self.dataset.filters:
                entry = doc.metadata().get(f.name)
                value = coalesce(
                    get(entry.contents, 0),
                    entry.meta.type.default_value()
                )
                body[f.name] = value

            actions.append({
                "_index": self.es_index,
                "_id": doc_id,
                "_source": body
            })

        if actions:
            success, _ = bulk(self.es, actions)
            logger.info(f"Inserted {success} documents into {self.es_index}")

    def _get_query(self, filter: Dict[str, List[str]]) -> Dict:
        must_clauses = []
        filter_clauses = []

        for name, values in filter.items():
            f = self.dataset.get_filter(name)
            if not values:
                continue
            if f.filter_type == "must":
                for val in values:
                    must_clauses.append({"match_phrase": {name: val}})
            elif f.filter_type == "filter":
                filter_clauses.append({"terms": {name: values}})

        return {
            "query": {
                "bool": {
                    "must": must_clauses,
                    "filter": filter_clauses
                }
            }
        }

    def search(self, query: str, filter: Dict[str, List[str]], limit: int = 10000) -> List[str]:
        es_query = self._get_query(filter)
        response = self.es.search(index=self.es_index, body=es_query, size=limit)
        return [hit["_id"] for hit in response["hits"]["hits"]]

    def config(self) -> SearchEngineConfig:
        """
        Returns the configuration of the ElasticSearch engine.
        :return: An instance of SearchEngineConfig containing the ElasticSearch parameters.
        """
        return self.engine_config.model_copy()
    
    def spec(self) -> SearchSpec:
        return SearchSpec(name="elastic_search_engine", optimal_for="strong")