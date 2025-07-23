from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError
from src.core.schema import AppConfig
from contextlib import asynccontextmanager
from typing import Dict, Any, List
from src.run.state import BaseState
from src.core.vector_set import BaseVectorSet
from src.core.dataset import Dataset
from src.core.schema import VectorSetConfig, AppConfig, DatasetConfig, ChunkerConfig, EmbedderConfig
from src.core.app import App
from src.const.dataset import NCL
from src.const.chunker import LENGTH_CHUNKER, SENTENCE_CHUNKER
from src.const.embedder import AUTO_MODEL_EMBEDDER, BGE_EMBEDDER
import yaml
import os
api = FastAPI()
app_config = yaml.safe_load(open("config/app.yml", "r", encoding="utf-8"))
vector_set_config = yaml.safe_load(open("config/vector_set.yml", "r", encoding="utf-8"))
dataset_config = yaml.safe_load(open("config/dataset.yml", "r", encoding="utf-8"))

#load --> activate
app_state = BaseState[AppConfig, App](
    config_cls=AppConfig,
    obj_cls=App,
    config_dir=app_config["config_path"]
)

vector_set_state = BaseState[VectorSetConfig, BaseVectorSet](
    config_cls=VectorSetConfig,
    obj_cls=BaseVectorSet,
    config_dir=vector_set_config["config_path"]
) 

dataset_state = BaseState[DatasetConfig, Dataset](
    config_cls=DatasetConfig,
    obj_cls=Dataset,
    config_dir=dataset_config["config_path"]
)



@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    app_state.load_all_configs()
    vector_set_state.load_all_configs()
    dataset_state.load_all_configs()
    yield
    # Shutdown logic (if needed)

api = FastAPI(lifespan=lifespan)

api.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#------------- dataset -----------------

@api.get("/datasets", response_model=List[DatasetConfig])
def get_all_datasets():
    """
    Returns a list of all datasets.
    """
    return dataset_state.get_all_configs()

@api.get("/defaults/dataset", response_model=DatasetConfig)
def get_default_dataset():
    return NCL


@api.post("/dataset/register")
def register_dataset(config: Dict[str, Any]) -> DatasetConfig:
    try:
        dconfig: DatasetConfig = DatasetConfig.from_dict(config)
        dataset_state.register(dconfig)
        return dconfig
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))


@api.get("/datasets/{id}", response_model=DatasetConfig)    
def get_dataset(id: str):
    """
    Returns a specific dataset by its ID.
    """
    try:
        return dataset_state.get_config(id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Dataset not found")

# ---------------- VectorSet ----------------
@api.get("/vector_sets", response_model=List[VectorSetConfig])
def get_all_vector_sets():
    """
    Returns a list of all vector sets.
    """
    return vector_set_state.get_all_configs()

@api.get("/vector_sets/{id}", response_model=VectorSetConfig)
def get_vector_set(id: str):
    """
    Returns a specific vector set by its ID.
    """
    try:
        return vector_set_state.get_config(id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Vector set not found")

@api.get("/defaults/chunker/{chunker_type}")
def get_default_chunker(chunker_type: str) -> ChunkerConfig:
    defaults = {
        "length_chunker": LENGTH_CHUNKER.model_dump(),
        "sentence_chunker": SENTENCE_CHUNKER.model_dump(),
    }
    if chunker_type not in defaults:
        raise HTTPException(status_code=404, detail=f"Unknown chunker type: {chunker_type}")
    return defaults[chunker_type]

@api.get("/defaults/embedder/{embedder_type}")
def get_default_embedder(embedder_type: str) -> EmbedderConfig:
    defaults = {
        "auto_model": AUTO_MODEL_EMBEDDER.model_dump(),
        "bge": BGE_EMBEDDER.model_dump(),
    }
    if embedder_type not in defaults:
        raise HTTPException(status_code=404, detail=f"Unknown embedder type: {embedder_type}")
    return defaults[embedder_type]

@api.post("/vector_set/register")
def register_vector_set(config: Dict[str, Any]) -> VectorSetConfig:
    try:
        vconfig: VectorSetConfig = VectorSetConfig.from_dict(config)
        vector_set_state.register(vconfig)
        return vconfig
    
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unhandled error: {str(e)}")


@api.post("/app/register")
def register_app(config: Dict[str, Any]) -> AppConfig:
    try:
        aconfig: AppConfig = AppConfig.from_dict(config)
        app_state.register(aconfig)
        return aconfig
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unhandled error: {str(e)}")
    