import BaseCard from "../components/cards/BaseCard";
import CreateNewButton from "../components/basic/CreateNewButton";
import type { VectorSetConfig } from "../types/app";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


export default function VectorSetPage() {
  const [vectorSets, setVectorSets] = useState<VectorSetConfig[]>([]);

  useEffect(() => {
    fetch("/api/vector_sets") // Replace with real endpoint
      .then(res => res.json())
      .then(setVectorSets);
  }, []);

  const navigate = useNavigate();
  const handleCreateNew = () => navigate("/vector-sets/new");

  return (
    <div>
      <div className="page-header">
        <h1>Vector Sets</h1>
        <CreateNewButton onClick={handleCreateNew} />
      </div>
      <div className="card-grid">
        {vectorSets.map((vs, i) => (
          <BaseCard
            key={i}
            title={`${vs.dataset.name} - ${vs.channel}`}
            description={`${vs.embedder.type} + ${vs.chunker.type}`}
          >
            <p><strong>Embedder:</strong> {vs.embedder.model_name}</p>
            <p><strong>Chunker:</strong> {vs.chunker.type}</p>
          </BaseCard>
        ))}
      </div>
    </div>
  );
}
