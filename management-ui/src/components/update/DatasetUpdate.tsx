import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { DatasetConfig } from "../../types/app";
import { getDataset } from "../../lib/api";
import DatasetEditor from "../editors/DatasetEditor";
import ErrorPopup from "../basic/ErrorPopup";

interface DatasetUpdateProps {
  onSubmit: (config: DatasetConfig) => void;
}

export default function DatasetUpdate({ onSubmit }: DatasetUpdateProps) {
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
      <h2>Update Dataset</h2>
      <DatasetEditor defaultValue={dataset} onSubmit={onSubmit} />
    </div>
  );
}
