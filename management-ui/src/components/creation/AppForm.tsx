// src/components/forms/AppForm.tsx
import { useState } from "react";
import type {
  AppConfig,
  SearchEngineConfig,
  SearchEngineType,
  RouterConfig,
  RouterType,
  RerankerConfig,
  RerankerType,
} from "../../types/app";
import { SearchEngineTypeValues, RouterTypeValues, RerankerTypeValues } from "../../types/app";
import MilvusEditor from "../editors/engine/MilvusEditor";
import ElasticEditor from "../editors/engine/ElasticEditor";
import HybridMilvusEditor from "../editors/engine/HybridMilvusEditor";
import SimpleRouterEditor from "../editors/router/SimpleRouterEditor";
import IdentityRerankerEditor from "../editors/reranker/IdentityRerankerEditor";

interface AppFormProps {
  onSubmit: (config: AppConfig) => void;
}

export default function AppForm({ onSubmit }: AppFormProps) {
  const [selectedEngines, setSelectedEngines] = useState<SearchEngineConfig[]>([]);
  const [selectedType, setSelectedType] = useState<SearchEngineType | "">("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [routerType, setRouterType] = useState<RouterType | "">("");
  const [router, setRouter] = useState<RouterConfig | null>(null);

  const [rerankerType, setRerankerType] = useState<RerankerType | "">("");
  const [reranker, setReranker] = useState<RerankerConfig | null>(null);

  const addEngine = (engine: SearchEngineConfig) => {
    setSelectedEngines((prev) => [...prev, engine]);
    setSelectedType("");
  };

  const handleSubmit = () => {
    if (!name || !router || !reranker || selectedEngines.length === 0) return;
    onSubmit({
      name,
      description,
      search_engines: selectedEngines,
      router,
      reranker,
    });
  };

  return (
    <div className="form-container">
      <h2>Create App</h2>

      <input
        placeholder="App Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <label>Select Search Engine Type</label>
      <select
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value as SearchEngineType)}
      >
        <option value="">-- Select --</option>
        {SearchEngineTypeValues.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      {selectedType === "milvus" && <MilvusEditor onSubmit={addEngine} />}
      {selectedType === "elasticsearch" && <ElasticEditor onSubmit={addEngine} />}
      {selectedType === "hybrid_milvus" && <HybridMilvusEditor onSubmit={addEngine} />}

      <label>Select Router</label>
      <select value={routerType} onChange={(e) => setRouterType(e.target.value as RouterType)}>
        <option value="">-- Select --</option>
        {RouterTypeValues.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      {routerType === "simple" && <SimpleRouterEditor onSubmit={setRouter} />}

      <label>Select Reranker</label>
      <select value={rerankerType} onChange={(e) => setRerankerType(e.target.value as RerankerType)}>
        <option value="">-- Select --</option>
        {RerankerTypeValues.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      {rerankerType === "identity" && <IdentityRerankerEditor onSubmit={setReranker} />}

      <button
        onClick={handleSubmit}
        disabled={!name || !router || !reranker || selectedEngines.length === 0}
      >
        Create App
      </button>
    </div>
  );
}
