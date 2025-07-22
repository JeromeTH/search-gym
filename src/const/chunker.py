from typing import List
from src.core.schema import ChunkerConfig, LengthChunkerConfig, SentenceChunkerConfig

LENGTH_CHUNKER = LengthChunkerConfig(
    type="length_chunker",
    chunk_size=512, 
    overlap=50
)
SENTENCE_CHUNKER = SentenceChunkerConfig(
    type="sentence_chunker",
    language="en"
)
CHUNKERS: List[ChunkerConfig]= [
    LENGTH_CHUNKER,
    SENTENCE_CHUNKER
]
