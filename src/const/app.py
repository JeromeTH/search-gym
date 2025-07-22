from src.core.schema import AppConfig, SearchEngineConfig, MilvusConfig, HybridMilvusConfig, ElasticSearchConfig, DatasetConfig
from src.const.engine import VECTOR_ENGINES, STRUCTURED_ENGINES
from src.const.router import ROUTERS
from src.const.reranker import RERANKERS
from src.const.dataset import NCL, LITSEARCH
from src.const.vector_set import DEFAULT_VECTOR_SETS
from typing import List, Dict
from src.core.util import deterministic_get_id

APPS = [
    AppConfig(
        id=deterministic_get_id(f"{str(engine)}_{str(router)}_{str(reranker)}"),
        name=f"",
        description=f"{engine.type} engine on {engine.get_dataset().name}, {router.type} router, and {reranker.type} reranker",
        search_engines=[engine],
        router=router,  # Assuming a single router for simplicity
        reranker=reranker  # Assuming a single reranker for simplicity
    )
    for engine in VECTOR_ENGINES + STRUCTURED_ENGINES #can support multiple engine in the future
    for router in ROUTERS
    for reranker in RERANKERS
]

DEFAULT_APPS: Dict[str, AppConfig] = {
    "ncl_milvus_simple_identity": AppConfig(
        id="ncl_milvus_simple_identity",
        name="NCL Milvus Simple Identity",
        description="NCL dataset with Milvus search engine, simple router, and identity reranker",
        search_engines=[MilvusConfig(type="milvus", vector_set=DEFAULT_VECTOR_SETS["ncl_dense_vs"])],
        router=ROUTERS[0],  # Assuming the first router is the simple one
        reranker=RERANKERS[0]  # Assuming the first reranker is the identity one
    )
}