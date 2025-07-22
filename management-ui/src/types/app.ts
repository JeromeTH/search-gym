// ------------------ Shared ------------------

export type EntryType = "str" | "int" | "float" | "bool";

export interface EntryMeta {
  name: string;
  type: EntryType;
  max_length: number;
  is_required?: boolean; // default = true
}

export type FilterType = "filter" | "must";

export interface Filter {
  name: string;
  filter_type: FilterType;
}

// ------------------ Dataset ------------------

export interface DatasetConfig {
  root: string; 
  name: string;
  description?: string;
  format: "json";
  metadata: EntryMeta[];
  channels: EntryMeta[];
  filters: Filter[];
  created_by?: string;
}

// ------------------ Chunker ------------------

export interface LengthChunkerConfig {
  type: "length_chunker";
  chunk_size: number;
  overlap: number;
}

export interface SentenceChunkerConfig {
  type: "sentence_chunker";
  language: "en" | "zh";
}

export type ChunkerConfig = LengthChunkerConfig | SentenceChunkerConfig;

// ------------------ Embedder ------------------

export interface AutoModelEmbedderConfig {
  type: "auto_model";
  embedding_type: "dense";
  model_name: string;
}

export interface BGEEmbedderConfig {
  type: "bge";
  embedding_type: "sparse";
  model_name: string;
}

export type EmbedderConfig = AutoModelEmbedderConfig | BGEEmbedderConfig;

// ------------------ Vector Set ------------------

export interface VectorSetConfig {
  root: string; 
  dataset: DatasetConfig;
  channel: string;
  chunker: ChunkerConfig;
  embedder: EmbedderConfig;
}

// ------------------ Search Engines ------------------

export interface MilvusConfig {
  type: "milvus";
  vector_set: VectorSetConfig;
}

export interface ElasticSearchConfig {
  type: "elasticsearch";
  dataset: DatasetConfig;
  es_host: string;
  es_index: string;
}

export interface HybridMilvusConfig {
  type: "hybrid_milvus";
  sparse_vector_set: VectorSetConfig;
  dense_vector_set: VectorSetConfig;
  alpha: number; // default = 0.5
}

export interface SequentialConfig {
  type: "sequential";
  engines: SearchEngineConfig[]; // must all share same dataset
}

export type SearchEngineConfig =
  | MilvusConfig
  | ElasticSearchConfig
  | HybridMilvusConfig
  | SequentialConfig;

// ------------------ Router and Reranker ------------------

export interface RouterConfig {
  type: "simple";
}

export interface RerankerConfig {
  type: "identity" | "auto_model";
}

// ------------------ App Config ------------------

export interface AppConfig {
  name: string;
  description?: string;
  search_engines: SearchEngineConfig[];
  router: RouterConfig;
  reranker: RerankerConfig;
  max_files?: number; // default = 1000000
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}
