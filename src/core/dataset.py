from src.core.document import Document, NCLDocument, Info, LitSearchDocument, BaseDocument
import os
from typing import Any, Iterator, List, Dict
import json
import yaml
from datasets import load_dataset
from tqdm import tqdm
from src.core.util import coalesce
from src.core.schema import EntryMeta, Entry, DatasetConfig
from src.core.interface import StoredObj
import uuid
from abc import ABC, abstractmethod

class Dataset(StoredObj): 
    @abstractmethod
    def stream(self) -> Iterator[Document]:
        """
        Abstract method to stream data.
        Should be implemented by subclasses.
        Iteratively returns Documents one by one.
        """
        pass
    
    @abstractmethod
    def config(self) -> DatasetConfig:
        """
        Returns the dataset configuration.
        """
        pass

    @classmethod
    def from_default(cls, dataset: DatasetConfig) -> "Dataset":
        """
        Factory method to return a dataset-specific DataLoader.
        """
        if dataset.format == "json":
            return JsonlDataset(dataset)

#new
class JsonlDataset(Dataset):
    def __init__(self, dataset: DatasetConfig):
        """
        Initializes the JsonDataLoader with a dataset configuration.
        Each document should be a JSON object, with each key corresponding to a **list** of strings. 
        """
        self.dataset = dataset
        self.json_paths = [os.path.join(dataset.root, f) for f in os.listdir(dataset.root) if f.endswith('.jsonl')]

    def _process_data(self, raw: Dict[str, Any]) -> Dict[str, List[str]]:
        """
        Processes the raw data dictionary into a format suitable for Document creation.
        """
        result: Dict[str, List[str]] = {}
        for key, value in raw.items():
            if isinstance(value, str):
                result[key] = [value]
            elif isinstance(value, list):
                result[key] = value
            else:
                raise ValueError(f"Unsupported data type for key '{key}': {type(value)}")
        return result

    def stream(self) -> Iterator[Document]:
        for path in self.json_paths:
            with open(path, 'r', encoding='utf-8') as f:
                for line in f:
                    if not line.strip():
                        continue
                    data: Dict[str, Any] = json.loads(line)
                    processed_data = self._process_data(data)
                    yield BaseDocument(self.dataset, processed_data)
            
    def setup(self):
        """
        Setup method to prepare the dataset.
        This can include loading configurations or initializing resources.
        """
        if not os.path.exists(self.dataset.root):
            raise FileNotFoundError(f"Dataset root directory {self.dataset.root} does not exist.")
        
        
    def config(self) -> DatasetConfig:
        """
        Returns the dataset configuration.
        """
        return self.dataset