import { useState } from "react";
import type { DatasetConfig } from "../../types/app";
import { getDefaultDataset } from "../../lib/api";
import DatasetEditor from "../editors/dataset/DatasetEditor";
import ErrorPopup from "../basic/ErrorPopup";

interface DatasetFormProps {
  onSubmit: (config: DatasetConfig) => void;
}

export default function DatasetForm({ onSubmit }: DatasetFormProps) {
  const [defaultValue, setDefaultValue] = useState<DatasetConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLoadDefault = async () => {
    try {
      const defaultDs = await getDefaultDataset();
      const { id, ...rest } = defaultDs; // Strip id here
      setDefaultValue(rest);
    } catch (err) {
      setError("Failed to load default dataset from backend.");
      console.error("Error loading default dataset:", err);
    }
  };

  return (
    <div>
      <div style={{
        backgroundColor: "#fff3cd",
        color: "#856404",
        border: "1px solid #ffeeba",
        borderRadius: "6px",
        padding: "12px",
        marginBottom: "20px"
      }}>
        ⚠️ <strong>Important:</strong> Your dataset's <code>root</code> directory must contain a valid JSON file.
        Every document in that file should include all metadata, channel, and filter attributes you configure below.
        <br /><br />
        <em>You are not inventing new fields here — you're assigning fields that must already exist in the dataset’s JSON structure.</em>
      </div>

      <h2>Create New Dataset</h2>
      {error && <ErrorPopup message={error} onClose={() => setError(null)} />}
      <button onClick={handleLoadDefault}>Load Default Dataset</button>

      <DatasetEditor onSubmit={onSubmit} defaultValue={defaultValue ?? undefined} />
    </div>
  );
}
