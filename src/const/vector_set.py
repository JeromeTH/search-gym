from src.core.schema import DatasetConfig, VectorSetConfig
from typing import List, Dict
from src.const.chunker import CHUNKERS, LENGTH_CHUNKER, SENTENCE_CHUNKER
from src.const.embedder import EMBEDDERS, AUTO_MODEL_EMBEDDER
from src.const.dataset import NCL, LITSEARCH, ARXIV
from src.core.document import Document  # Import Document from the appropriate module
from src.core.util import deterministic_get_id
import os
import yaml

ROOT = f"_tests/storage/vector_set"

VECTOR_SETS: List[VectorSetConfig] = [
    VectorSetConfig(
        id = id,
        root = os.path.join(ROOT, id),
        dataset = dataset,
        channel = channel, 
        chunker = chunker,
        embedder = embedder
    )
    for dataset in [NCL, LITSEARCH, ARXIV]
    for channel in [c.name for c in dataset.channels]
    for chunker in CHUNKERS
    for embedder in EMBEDDERS
    for id in [deterministic_get_id(f"{str(dataset)}_{str(channel)}_{str(chunker)}_{str(embedder)}")]
]


DENSE_VECTOR_SETS = [
    vs for vs in VECTOR_SETS if vs.embedder.embedding_type == "dense"
]

SPARSE_VECTOR_SETS = [
    vs for vs in VECTOR_SETS if vs.embedder.embedding_type == "sparse"
]

DEFAULT_VECTOR_SETS: Dict[str, VectorSetConfig] = {
    "ncl_dense_vs": VectorSetConfig(
    id='ncl_dense_vs',
    root=f"_tests/storage/vector_set/ncl_dense_vs", 
    dataset=NCL, 
    channel="abstract_chinese", 
    chunker=LENGTH_CHUNKER, 
    embedder=AUTO_MODEL_EMBEDDER
    ), 
    "arxiv_dense_vs": VectorSetConfig(
    id='arxiv_dense_vs',
    root=f"_tests/storage/vector_set/arxiv_dense_vs",
    dataset=ARXIV,
    channel="summaries",
    chunker=LENGTH_CHUNKER,
    embedder=AUTO_MODEL_EMBEDDER
    )
}