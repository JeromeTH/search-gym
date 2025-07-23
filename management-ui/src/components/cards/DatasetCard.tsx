import type { DatasetConfig } from "../../types/app";
import BaseCard from "./BaseCard";

interface DatasetCardProps {
  dataset: DatasetConfig;
  selected?: boolean;
  onClick?: () => void;
}

export default function DatasetCard({ dataset, selected = false, onClick }: DatasetCardProps) {
  return (
    <BaseCard
      title={dataset.name}
      description={dataset.description}
      selected={selected}
      onClick={onClick}
    >
      <p style={{ fontSize: "0.75rem", color: "#888", marginBottom: "8px" }}>
        <strong>ID:</strong> {dataset.id || "None"}
      </p>
      <p><strong>Format:</strong> {dataset.format}</p>
      <p><strong>Fields:</strong> {dataset.metadata.length}</p>
      <p><strong>Channels:</strong> {dataset.channels.length}</p>
    </BaseCard>
  );
}
