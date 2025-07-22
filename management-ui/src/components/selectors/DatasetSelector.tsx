// src/components/selectors/DatasetSelector.tsx

import { useEffect, useState } from "react";
import type { DatasetConfig } from "../../types/app";
import { getDatasets } from "../../lib/api";

interface DatasetSelectorProps {
  value: string;
  onChange: (dataset: DatasetConfig | null) => void;
}

export default function DatasetSelector({ value, onChange }: DatasetSelectorProps) {
  const [datasets, setDatasets] = useState<DatasetConfig[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDatasets()
      .then((data) => {
        setDatasets(data);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load datasets from backend.");
      });
  }, []);

  const handleChange = (name: string) => {
    const selected = datasets.find((d) => d.name === name) ?? null;
    onChange(selected);
  };

  return (
    <div>
      <label>Dataset</label>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <select value={value} onChange={(e) => handleChange(e.target.value)}>
        <option value="">-- Select --</option>
        {datasets.map((ds) => (
          <option key={ds.name} value={ds.name}>
            {ds.name}
          </option>
        ))}
      </select>
    </div>
  );
}
