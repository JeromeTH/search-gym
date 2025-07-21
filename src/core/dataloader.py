from src.core.dataset import Dataset
from src.core.document import Document
from src.core.schema import DatasetConfig
from typing import List, Dict, Any, Iterator

class DataLoader:
    def __init__(self, dataset: Dataset):
        self.dataset = dataset
        self.documents: List[Document] = []
        self.buffer_size = 64

    def load(self) -> Iterator[List[Document]]:
        for doc in self.dataset.stream():
            yield from self._handle(doc)
        yield from self._flush()

    def _handle(self, document: Document) -> Iterator[List[Document]]:
        self.documents.append(document)
        if len(self.documents) >= self.buffer_size:
            yield from self._flush()

    def _flush(self) -> Iterator[List[Document]]:
        if self.documents:
            yield self.documents
            self.documents = []