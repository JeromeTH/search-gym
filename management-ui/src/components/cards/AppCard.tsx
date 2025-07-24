// src/components/cards/AppCard.tsx

import type { AppConfig } from "../../types/app";
import BaseCard from "./BaseCard";
import ActivationButton from "../basic/ActivationButton";
import { getAppStatus, activateApp } from "../../lib/api";

interface AppCardProps {
  app: AppConfig;
  selected?: boolean;
  onClick?: () => void;
}

export default function AppCard({ app, selected = false, onClick }: AppCardProps) {
  const getStatus = () => getAppStatus(app.id!);
  const handleActivate = () => activateApp(app.id!);

  return (
    <BaseCard
      title={app.name}
      description={app.description || "No description provided."}
      selected={selected}
      onClick={onClick}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
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
        </div>

        <ActivationButton
          getStatus={getStatus}
          onClick={handleActivate}
        />
      </div>
    </BaseCard>
  );
}
