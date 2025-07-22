import BaseCard from "../components/cards/BaseCard";
import CreateNewButton from "../components/basic/CreateNewButton";
import type { AppConfig } from "../types/app";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


export default function AppPage() {
  const [apps, setApps] = useState<AppConfig[]>([]);

  useEffect(() => {
    fetch("/api/apps") // Replace with real endpoint
      .then(res => res.json())
      .then(setApps);
  }, []);
  const navigate = useNavigate();
  const handleCreateNew = () => navigate("/apps/new");

  return (
    <div>
      <div className="page-header">
        <h1>Apps</h1>
        <CreateNewButton onClick={handleCreateNew} />
      </div>
      <div className="card-grid">
        {apps.map(app => (
          <BaseCard
            key={app.name}
            title={app.name}
            description={app.description}
          >
            <p><strong>Engines:</strong> {app.search_engines.map(e => e.type).join(", ")}</p>
            <p><strong>Router:</strong> {app.router.type}</p>
            <p><strong>Reranker:</strong> {app.reranker.type}</p>
          </BaseCard>
        ))}
      </div>
    </div>
  );
}
