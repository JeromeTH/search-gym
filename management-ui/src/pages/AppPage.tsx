import AppCard from "../components/cards/AppCard";
import CreateNewButton from "../components/basic/CreateNewButton";
import type { AppConfig } from "../types/app";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllApps } from "../lib/api";

export default function AppPage() {
  const [apps, setApps] = useState<AppConfig[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getAllApps()
      .then(setApps)
      .catch((err) => {
        console.error("Failed to load apps:", err);
        setApps([]);
      });
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Apps</h1>
        <CreateNewButton onClick={() => navigate("/apps/new")} />
      </div>
      <div className="card-grid">
        {apps.map((app) => (
          <AppCard
            app={app}
            onClick={() => navigate(`/apps/${app.id!}`)}
          />
        ))}
      </div>
    </div>
  );
}
