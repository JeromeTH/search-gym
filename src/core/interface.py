from abc import ABC, abstractmethod
from typing import List, Dict, Any, Union
from pydantic import BaseModel, ConfigDict



class StoredConfig(BaseModel):
    model_config = ConfigDict(frozen=True)
    id: str

class StoredObj(ABC): 
    @abstractmethod
    def setup(self):
        """
        Sets up the storage backend.
        """
        pass

    @classmethod
    @abstractmethod
    def from_config(cls, config: 'StoredConfig') -> 'StoredObj':
        """
        Creates an instance from a configuration object.
        """
        pass