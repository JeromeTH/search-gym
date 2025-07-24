import type { AppConfig } from "../../types/app";
import BaseCard from "./BaseCard";

interface AppCardProps {
  app: AppConfig;
  selected?: boolean;
  onClick?: () => void;
}

export default function AppCard({ app, selected = false, onClick }: AppCardProps) {
  return (
    <BaseCard
      title={app.name}
      description={app.description || "No description provided."}
      selected={selected}
      onClick={onClick}
    >
      {app.id && (
        <p style={{ fontSize: "0.75rem", color: "#888", marginBottom: "8px" }}>
          <strong>App ID:</strong> {app.id}
        </p>
      )}
      <p style={{ fontSize: "0.75rem", color: "#888", marginBottom: "8px" }}>
        <strong>Engines:</strong> {app.search_engines.map(e => e.type).join(", ")}
      </p>
      <p><strong>Router:</strong> {app.router.type}</p>
      <p><strong>Reranker:</strong> {app.reranker.type}</p>
    </BaseCard>
  );
}
