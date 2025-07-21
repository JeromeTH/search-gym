from src.core.llm import Agent
from src.core.embedder import DenseEmbedder, SparseEmbedder, AutoModelEmbedder, BGEM3Embedder, MilvusBGEM3Embedder
from src.core.dataset import Dataset
from src.core.dataloader import DataLoader
from src.core.prompt import PromptBuilder
from src.core.document import Document
from src.core.search_engine import SearchEngine, Filter, MilvusSearchEngine, ElasticSearchEngine
from src.core.library import Library, InMemoryLibrary, FilesLibrary
from src.core.schema import AppConfig, DatasetConfig
from src.core.router import BaseRouter
from src.core.reranker import BaseReranker, IdentityReranker
from src.utils.logging import setup_logger
from scipy.sparse import csr_array
from typing import List, Dict
import sys
from src.core.manager import Manager
from src.core.reranker import IdentityReranker
from src.core.interface import StoredObj
from tqdm import tqdm
import logging
CHATBOT = "meta-llama/Llama-3.1-8B-Instruct"

logger = logging.getLogger('taihu')

class App(StoredObj):
    '''
    A search application that uses a combination of dense and sparse embeddings to retrieve relevant documents.
    The static methods are contextually static, meaning that their functionality does not depend on the instance state, 
    but is suited for this specific context of searching and embedding documents. For example, 
    the database schema is defined statically, as it does not change per instance, but if there's another app, 
    it may have a different schema or embedding strategy.
    '''
    def __init__(self, datasets: List[Dataset], manager: Manager, max_files: int = 1000):
        """Initialize the SearchApp."""
        self.datasets: List[Dataset] = datasets 
        self.manager: Manager = manager
        self.max_files: int = max_files
        self.llm: Agent = None
        self.count = 0

    def insert_from_dataset(self, dataset: Dataset) -> None:
        data_loader = DataLoader(dataset)
        for documents in tqdm(data_loader.load(), desc="Setup app: Inserting documents"):
            self.manager.insert(documents)
            self.count += len(documents)
            if self.count >= self.max_files:
                logger.info(f"Inserted {self.count} documents, stopping further insertion.")
                break
        logger.info(f"Total documents inserted: {self.count}")


    def setup(self):
        logger.info(f"Setting up application with max_files={self.max_files}")
        self.manager.setup()
        self.count = 0
        for datasets in self.datasets: 
            logger.info(f"setting up dataloader for {datasets.config().id}: {datasets.config().name}")
            self.insert_from_dataset(datasets)
        
    
    def search(
            self, 
            query: str, 
            filter: Dict[str, List[str]] = None,
            limit: int = None, 
        ) -> List[Document]: 
        return self.manager.fetch(query=query, filter=filter, limit=limit)
    
    def rag(self, query: str, results: List[Document]) -> dict:
        if not self.llm: self.llm: Agent = Agent.from_vllm(CHATBOT)
        prompt = PromptBuilder().add_user_message(query).add_documents(results).build_prompt()
        generation = self.llm.generate(prompt)
        return {
            "results": results,
            "prompt": prompt,
            "generation": generation
        }
    
    @classmethod
    def from_config(cls, config: AppConfig) -> 'App':
        dataset_configs: List[DatasetConfig] = list({engine.get_dataset() for engine in config.search_engines})
        datasets: List[Dataset] = [Dataset.from_default(c) for c in dataset_configs]
        search_engines = [SearchEngine.from_config(sconfig) for sconfig in config.search_engines]
        router = BaseRouter.from_config(config.router)
        reranker = BaseReranker.from_config(config.reranker)
        library = InMemoryLibrary()
        manager = Manager(
            library, 
            search_engines, 
            reranker, 
            router
        )
        return cls(datasets, manager, max_files=config.max_files)
