from src.core.schema import EmbedderConfig, AutoModelEmbedderConfig, BGEEmbedderConfig
from typing import List

AUTO_MODEL_EMBEDDER = AutoModelEmbedderConfig(
        type="auto_model",
        embedding_type="dense",
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
BGE_EMBEDDER = BGEEmbedderConfig(
        type="bge",
        embedding_type="sparse",
        model_name="BAAI/bge-m3" 
    )
EMBEDDERS: List[EmbedderConfig] = [
    AUTO_MODEL_EMBEDDER,
    BGE_EMBEDDER
]