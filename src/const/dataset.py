from src.core.schema import DatasetConfig, EntryMeta, Entry, EntryType, Filter
from src.core.document import Document, BaseDocument
from typing import List, Dict
import yaml

config = yaml.safe_load(open("config/data.yml", "r", encoding="utf-8"))

# --- Metadata fields based on NCLDocument.metadata ---
NCL_METADATA: List[EntryMeta] = [
    EntryMeta(name="id", type=EntryType.STRING, max_length=20),
    EntryMeta(name="year", type=EntryType.INTEGER, max_length=4),
    EntryMeta(name="category", type=EntryType.STRING, max_length=64),
    EntryMeta(name="link", type=EntryType.STRING, max_length=256),
    EntryMeta(name="keywords", type=EntryType.STRING, max_length=256),
    EntryMeta(name="school_chinese", type=EntryType.STRING, max_length=128),
    EntryMeta(name="school_english", type=EntryType.STRING, max_length=128),
    EntryMeta(name="dept_chinese", type=EntryType.STRING, max_length=128),
    EntryMeta(name="dept_english", type=EntryType.STRING, max_length=128),
    EntryMeta(name="authors_chinese", type=EntryType.STRING, max_length=256),
    EntryMeta(name="authors_english", type=EntryType.STRING, max_length=256),
    EntryMeta(name="advisors_chinese", type=EntryType.STRING, max_length=256),
    EntryMeta(name="advisors_english", type=EntryType.STRING, max_length=256),
]

# --- Channel fields based on NCLDocument.channels ---
NCL_CHANNELS: List[EntryMeta] = [
    EntryMeta(name="abstract_chinese", type=EntryType.STRING, max_length=1024),
    EntryMeta(name="abstract_english", type=EntryType.STRING, max_length=1024),
    EntryMeta(name="title_chinese", type=EntryType.STRING, max_length=256),
    EntryMeta(name="title_english", type=EntryType.STRING, max_length=256),
]

NCL_FILTERS: List[Filter] = [
    Filter(name="year", filter_type="filter"),
    Filter(name="category", filter_type="filter"),
    Filter(name="school_chinese", filter_type="filter"),
    Filter(name="dept_chinese", filter_type="filter"),
    Filter(name="keywords", filter_type="must"),
    Filter(name="authors_chinese", filter_type="must"),
    Filter(name="advisors_chinese", filter_type="must"),
]


NCL = DatasetConfig(
    id="001", 
    name="NCL",
    description="National Central Library of Taiwan dataset",
    root = config["ncl"]["root"],
    metadata= NCL_METADATA,
    channels=NCL_CHANNELS,
    filters=NCL_FILTERS,
    format = "json",
)

# --- Metadata fields based on LitSearchDocument.metadata ---
LITSEARCH_METADATA: List[EntryMeta] = [
    EntryMeta(name="corpusid", type=EntryType.INTEGER, max_length=16),
    EntryMeta(name="year", type=EntryType.INTEGER, max_length=4),
    EntryMeta(name="venue", type=EntryType.STRING, max_length=128),
    EntryMeta(name="authors", type=EntryType.STRING, max_length=128),
    EntryMeta(name="doi", type=EntryType.STRING, max_length=128),
    EntryMeta(name="arxiv", type=EntryType.STRING, max_length=64),
    EntryMeta(name="dblp", type=EntryType.STRING, max_length=128),
    EntryMeta(name="pdfurl", type=EntryType.STRING, max_length=256),
]

# --- Channel fields based on LitSearchDocument.channels ---
LITSEARCH_CHANNELS: List[EntryMeta] = [
    EntryMeta(name="abstract", type=EntryType.STRING, max_length=2048),
    EntryMeta(name="title", type=EntryType.STRING, max_length=256),
]

LITSEARCH_FILTERS: List[Filter] = [
    Filter(name="year", filter_type="filter"),
    Filter(name="venue", filter_type="filter"),
    Filter(name="authors", filter_type="must"),
]


LITSEARCH = DatasetConfig(
    id="002",
    name="LitSearch",
    description="Semantic Scholar-style scientific paper metadata and abstracts",
    root=config["litsearch"]["root"],
    format="json",
    metadata=LITSEARCH_METADATA,
    channels=LITSEARCH_CHANNELS,
    filters=LITSEARCH_FILTERS,
    created_by="Jerome"
)
