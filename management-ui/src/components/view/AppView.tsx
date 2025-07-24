import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { AppConfig } from "../../types/app";
import { getApp } from "../../lib/api";
import ErrorPopup from "../basic/ErrorPopup";
import AppViewer from "../viewers/AppViewer"; // The read-only viewer

export default function AppView() {
  const { id } = useParams(); // from route /apps/:id
  const [app, setApp] = useState<AppConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("No app ID provided.");
      return;
    }

    getApp(id)
      .then(setApp)
      .catch((err) => {
        setError("Failed to load app.");
        console.error("Fetch error:", err);
      });
  }, [id]);

  if (error) {
    return <ErrorPopup message={error} onClose={() => setError(null)} />;
  }

  if (!app) {
    return <p>Loading app...</p>;
  }

  return (
    <div>
      <h2>App Details</h2>
      <AppViewer config={app} />
    </div>
  );
}
