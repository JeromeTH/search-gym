// src/components/editors/MilvusEditor.tsx
import { useEffect, useState } from "react";
import type { VectorSetConfig, MilvusConfig } from "../../../types/app";
import VectorSetCard from "../../cards/VectorSetCard";
import { getAllVectorSets } from "../../../lib/api";

interface MilvusEditorProps {
  onSubmit: (config: MilvusConfig) => void;
}

export default function MilvusEditor({ onSubmit }: MilvusEditorProps) {
  const [vectorSets, setVectorSets] = useState<VectorSetConfig[]>([]);
  const [selected, setSelected] = useState<VectorSetConfig | null>(null);

  useEffect(() => {
    getAllVectorSets()
      .then(setVectorSets)
      .catch(() => setVectorSets([]));
  }, []);

  const handleAdd = () => {
    if (!selected) return;
    onSubmit({
      type: "milvus",
      vector_set: selected,
    });
    setSelected(null);
  };

  return (
    <div>
      <h4>Select Vector Set</h4>
      <div className="scrollable-card-container">
        {vectorSets.map((vs, idx) => (
          <VectorSetCard
            key={idx}
            vectorSet={vs}
            selected={selected === vs}
            onClick={() => setSelected(vs)}
          />
        ))}
      </div>
      <button onClick={handleAdd} disabled={!selected}>
        Add Milvus Engine
      </button>
    </div>
  );
}
