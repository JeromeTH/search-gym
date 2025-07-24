// src/components/editors/HybridMilvusEditor.tsx
import { useEffect, useState } from "react";
import type { VectorSetConfig, HybridMilvusConfig } from "../../../types/app";
import VectorSetCard from "../../cards/VectorSetCard";
import { getAllVectorSets } from "../../../lib/api";

interface Props {
  onSubmit: (engine: HybridMilvusConfig) => void;
}

export default function HybridMilvusEditor({ onSubmit }: Props) {
  const [vectorSets, setVectorSets] = useState<VectorSetConfig[]>([]);
  const [dense, setDense] = useState<VectorSetConfig | null>(null);
  const [sparse, setSparse] = useState<VectorSetConfig | null>(null);

  useEffect(() => {
    getAllVectorSets()
      .then(setVectorSets)
      .catch((err) => {
        console.error("Failed to fetch vector sets:", err);
        setVectorSets([]);
      });
  }, []);

  const filteredSparseOptions = dense
    ? vectorSets.filter(
        (vs) =>
          vs.dataset.id === dense.dataset.id &&
          vs.channel === dense.channel &&
          JSON.stringify(vs.chunker) === JSON.stringify(dense.chunker) &&
          vs.embedder.embedding_type === "sparse"
      )
    : [];

  const handleSubmit = () => {
    if (!dense || !sparse) return;
    onSubmit({
      type: "hybrid_milvus",
      dense_vector_set: dense,
      sparse_vector_set: sparse,
      alpha: 0.5,
    });
  };

  return (
    <div>
      <h4>Select Dense Vector Set</h4>
      <div className="scrollable-card-container">
        {vectorSets
          .filter((vs) => vs.embedder.embedding_type === "dense")
          .map((vs, idx) => (
            <VectorSetCard
              key={`dense-${idx}`}
              vectorSet={vs}
              selected={dense?.id === vs.id}
              onClick={() => {
                setDense(vs);
                setSparse(null);
              }}
            />
          ))}
      </div>

      {dense && (
        <>
          <h4>Select Matching Sparse Vector Set</h4>
          <div className="scrollable-card-container">
            {filteredSparseOptions.map((vs, idx) => (
              <VectorSetCard
                key={`sparse-${idx}`}
                vectorSet={vs}
                selected={sparse?.id === vs.id}
                onClick={() => setSparse(vs)}
              />
            ))}
          </div>
        </>
      )}

      <button onClick={handleSubmit} disabled={!dense || !sparse}>
        Add Hybrid Search Engine
      </button>
    </div>
  );
}
