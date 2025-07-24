// src/components/editors/ElasticEditor.tsx
import { useEffect, useState } from "react";
import type { DatasetConfig, ElasticSearchConfig } from "../../../types/app";
import DatasetCard from "../../cards/DatasetCard";
import { getAllDatasets } from "../../../lib/api";

interface ElasticEditorProps {
  onSubmit: (config: ElasticSearchConfig) => void;
}

export default function ElasticEditor({ onSubmit }: ElasticEditorProps) {
  const [datasets, setDatasets] = useState<DatasetConfig[]>([]);
  const [selected, setSelected] = useState<DatasetConfig | null>(null);
  const [esHost, setEsHost] = useState("");
  const [esIndex, setEsIndex] = useState("");

  useEffect(() => {
    getAllDatasets()
      .then(setDatasets)
      .catch(() => setDatasets([]));
  }, []);

  const handleAdd = () => {
    if (!selected || !esHost || !esIndex) return;
    onSubmit({
      type: "elasticsearch",
      dataset: selected,
      es_host: esHost,
      es_index: esIndex,
    });
    setSelected(null);
    setEsHost("");
    setEsIndex("");
  };

  return (
    <div>
      <h4>Select Dataset</h4>
      <div className="scrollable-card-container">
        {datasets.map((ds, idx) => (
          <DatasetCard
            key={idx}
            dataset={ds}
            selected={selected?.id === ds.id}
            onClick={() => setSelected(ds)}
          />
        ))}
      </div>

      <input
        placeholder="Elasticsearch Host"
        value={esHost}
        onChange={(e) => setEsHost(e.target.value)}
      />
      <input
        placeholder="Elasticsearch Index"
        value={esIndex}
        onChange={(e) => setEsIndex(e.target.value)}
      />
      <button onClick={handleAdd} disabled={!selected || !esHost || !esIndex}>
        Add ElasticSearch Engine
      </button>
    </div>
  );
}
