// src/components/cards/VectorSetCard.tsx
import type { VectorSetConfig } from "../../types/app";
import BaseCard from "./BaseCard";

interface VectorSetCardProps {
  vectorSet: VectorSetConfig;
  selected?: boolean;
  onClick?: () => void;
}

export default function VectorSetCard({ vectorSet, selected = false, onClick }: VectorSetCardProps) {
  const { root, channel, chunker, embedder, dataset } = vectorSet;

  return (
    <BaseCard
      title={`${dataset.name} / ${channel}`}
      description={`Vector store at ${root}`}
      selected={selected}
      onClick={onClick}
    >
      <p style={{ fontSize: "0.75rem", color: "#888", marginBottom: "8px" }}>
        <strong>Dataset ID:</strong> {dataset.id || "None"}
      </p>
      <p><strong>Chunker:</strong> {chunker.type}</p>
      <p><strong>Embedder:</strong> {embedder.type}</p>
      <p><strong>Embedding Type:</strong> {embedder.embedding_type}</p>
    </BaseCard>
  );
}
