import { useEffect, useState } from "react";
import type { AppConfig, VectorSetConfig, RouterConfig, RerankerConfig } from "../../types/app";
import VectorSetForm from "./VectorSetForm";

interface AppFormProps {
  onSubmit: (config: AppConfig) => void;
}

export default function AppForm({ onSubmit }: AppFormProps) {
  const [vectorSets, setVectorSets] = useState<VectorSetConfig[]>([]);
  const [selectedVectorSet, setSelectedVectorSet] = useState<VectorSetConfig | null>(null);
  const [creatingVectorSet, setCreatingVectorSet] = useState(false);

  const [router, setRouter] = useState<RouterConfig>({ type: "simple" });
  const [reranker, setReranker] = useState<RerankerConfig>({ type: "identity" });
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetch("/api/vector_sets").then(res => res.json()).then(setVectorSets);
  }, []);

  const handleSubmit = () => {
    if (!selectedVectorSet) return;
    onSubmit({
      name,
      description,
      search_engines: [{ type: "milvus", vector_set: selectedVectorSet }],
      router,
      reranker,
    });
  };

  return (
    <div>
      <h2>Create App</h2>
      <input placeholder="App Name" value={name} onChange={(e) => setName(e.target.value)} />
      <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

      {creatingVectorSet ? (
        <VectorSetForm onSubmit={(vs) => {
          setSelectedVectorSet(vs);
          setCreatingVectorSet(false);
          setVectorSets((prev) => [...prev, vs]);
        }} />
      ) : (
        <>
          <label>Select Vector Set</label>
          <select value={selectedVectorSet?.channel ?? ""} onChange={(e) => {
            const selected = vectorSets.find(vs => vs.channel === e.target.value);
            setSelectedVectorSet(selected ?? null);
          }}>
            <option value="">-- Select --</option>
            {vectorSets.map(vs => (
              <option key={vs.channel} value={vs.channel}>
                {vs.dataset.name} - {vs.channel}
              </option>
            ))}
          </select>
          <button onClick={() => setCreatingVectorSet(true)}>+ Create New Vector Set</button>
        </>
      )}

      <label>Reranker</label>
      <select value={reranker.type} onChange={(e) => setReranker({ type: e.target.value as any })}>
        <option value="identity">Identity</option>
        <option value="auto_model">Auto Model</option>
      </select>

      <button onClick={handleSubmit}>Create App</button>
    </div>
  );
}
