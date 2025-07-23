// src/pages/DatasetView.tsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { DatasetConfig } from "../../types/app";
import { getDataset } from "../../lib/api";
import ErrorPopup from "../basic/ErrorPopup";
import DatasetViewer from "../viewers/DatasetViewer"; // The read-only viewer

export default function DatasetView() {
  const { id } = useParams(); // from route /datasets/:id
  const [dataset, setDataset] = useState<DatasetConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("No dataset ID provided.");
      return;
    }

    getDataset(id)
      .then(setDataset)
      .catch((err) => {
        setError("Failed to load dataset.");
        console.error("Fetch error:", err);
      });
  }, [id]);

  if (error) {
    return <ErrorPopup message={error} onClose={() => setError(null)} />;
  }

  if (!dataset) {
    return <p>Loading dataset...</p>;
  }

  return (
    <div>
      <h2>Dataset Details</h2>
      <DatasetViewer config={dataset} />
    </div>
  );
}
