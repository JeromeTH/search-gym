from src.core.schema import EntryType
from pymilvus import DataType
from typing import Type, Any

def to_python_type(t: EntryType) -> Type[Any]:
    """
    Converts an EntryType to a Python type.
    """
    return {
        "str": str,
        "int": int,
        "float": float,
        "bool": bool
    }[t]

def to_milvus_type(t: EntryType) -> DataType:
    return {
        "str": DataType.VARCHAR,
        "int": DataType.INT64,
        "float": DataType.FLOAT,
        "bool": DataType.BOOL
    }[t]