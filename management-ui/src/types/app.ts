// ------------------ Shared ------------------

// EntryType
export const EntryValues = ["str", "int", "float", "bool"] as const;
export type EntryType = (typeof EntryValues)[number];

export interface EntryMeta {
  name: string;
  type: EntryType;
  max_length: number;
  is_required?: boolean; // default = true
}

// FilterType
export const FilterTypeValues = ["filter", "must"] as const;
export type FilterType = (typeof FilterTypeValues)[number];

export interface Filter {
  name: string;
  filter_type: FilterType;
}

// ------------------ Dataset ------------------

export interface DatasetConfig {
  id?: string; // auto-generated if not provided
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

export const ChunkerTypeValues = ["length_chunker", "sentence_chunker"] as const;
export type ChunkerType = (typeof ChunkerTypeValues)[number];

export interface LengthChunkerConfig {
  type: "length_chunker";
  chunk_size: number;
  overlap: number;
}

export const languageValues = ["en", "zh"] as const;
export type Language = (typeof languageValues)[number];

export interface SentenceChunkerConfig {
  type: "sentence_chunker";
  language: Language;
}

export type ChunkerConfig = LengthChunkerConfig | SentenceChunkerConfig;

// ------------------ Embedder ------------------

export const EmbedderTypeValues = ["auto_model", "bge"] as const;
export type EmbedderType = (typeof EmbedderTypeValues)[number];

export const EmbeddingTypeValues = ["dense", "sparse"] as const;
export type EmbeddingType = (typeof EmbeddingTypeValues)[number];

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

export const SearchEngineTypeValues = ["milvus", "elasticsearch", "hybrid_milvus", "sequential"] as const;
export type SearchEngineType = (typeof SearchEngineTypeValues)[number];

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

export const RouterTypeValues = ["simple"] as const;
export type RouterType = (typeof RouterTypeValues)[number];

export interface RouterConfig {
  type: RouterType;
}

export const RerankerTypeValues = ["identity", "auto_model"] as const;
export type RerankerType = (typeof RerankerTypeValues)[number];

export interface RerankerConfig {
  type: RerankerType;
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
