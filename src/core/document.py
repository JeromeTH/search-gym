from typing import Optional, List, Dict, ClassVar, Type, Self, Any
from pydantic import BaseModel, create_model, model_validator, ValidationError
from enum import Enum
from pymilvus import DataType
from dataclasses import dataclass
from datasets import load_dataset
from src.core.schema import Entry, EntryType, DatasetConfig, EntryMeta
from src.core.util import ensure
from src.utils.typing import to_python_type
from abc import ABC, abstractmethod

# --- Abstract document interface ---
class Document(ABC):

    @abstractmethod
    def source(self) -> str: 
        """
        The ID of the source dataset. 
        """
        pass

    @abstractmethod
    def key(self) -> str:
        """
        The unique key for the document.
        """
        pass 

    @abstractmethod
    def metadata(self) -> Dict[str, Entry]:
        """
        A dictionary of metadata fields for the document.
        Each key is the field name, and the value is an Entry object.
        """
        pass

    @abstractmethod
    def channels(self) -> Dict[str, Entry]:
        """
        A dictionary of channel fields for the document.
        Each key is the channel name, and the value is an Entry object.
        """
        pass
        
class BaseDocument(BaseModel, Document): 
    dataset: DatasetConfig
    data: Dict[str, List[str]]

    def source(self) -> str: 
        """
        Returns the ID of the dataset this document belongs to.
        """
        return self.dataset.id

    def _load_entries(self, entry_metas: List[EntryMeta], crop = False) -> Dict[str, Entry]:
        return {
            meta.name: 
            Entry(
                meta = meta, 
                contents = [to_python_type(meta.type) 
                 (ensure(s, meta.max_length)) 
                 for s in self.data[meta.name]]
                )
            for meta in entry_metas
        }
    
    @model_validator(mode="after")
    def check_id_exist(self) -> Self:
        if "id" not in self.data:
            raise ValueError("Document must have an 'id' field in its data.")
        return self

    def key(self) -> str:
        return self.data['id'][0]

    def metadata(self) -> Dict[str, Entry]:
        return self._load_entries(self.dataset.metadata)
    
    def channels(self) -> Dict[str, Entry]:
        return self._load_entries(self.dataset.channels)