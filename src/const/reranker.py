from src.core.schema import RerankerConfig, IdentityRerankerConfig
from typing import List

RERANKERS: List[RerankerConfig] = [
    IdentityRerankerConfig(type="identity")
]

