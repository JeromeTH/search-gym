from typing import List, Literal
from src.core.schema import VectorSetConfig, SearchEngineConfig, MilvusConfig, HybridMilvusConfig, ElasticSearchConfig, DatasetConfig
from src.const.vector_set import DENSE_VECTOR_SETS, SPARSE_VECTOR_SETS
from src.const.dataset import NCL, LITSEARCH, ARXIV

VECTOR_ENGINES: List[SearchEngineConfig] = [
    MilvusConfig(
        type="milvus", 
        vector_set=vs
    ) for vs in DENSE_VECTOR_SETS + SPARSE_VECTOR_SETS
] + [
    HybridMilvusConfig(
        type="hybrid_milvus",
        sparse_vector_set=sparse_vs,
        dense_vector_set=dense_vs,
        alpha=0.5
    ) 
    for sparse_vs in SPARSE_VECTOR_SETS 
    for dense_vs in DENSE_VECTOR_SETS 
    if sparse_vs.channel == dense_vs.channel and sparse_vs.chunker == dense_vs.chunker
] 

STRUCTURED_ENGINES = [
    ElasticSearchConfig(
        type="elasticsearch",
        dataset=dataset,
        es_host="localhost",
        es_index=f"{dataset}_index"
    ) for dataset in [NCL, LITSEARCH]
]


