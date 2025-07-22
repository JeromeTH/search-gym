import BaseCard from "../components/cards/BaseCard";
import CreateNewButton from "../components/basic/CreateNewButton";
import type { DatasetConfig } from "../types/app";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


export default function DatasetPage() {
  const [datasets, setDatasets] = useState<DatasetConfig[]>([]);

  useEffect(() => {
    fetch("/api/datasets") // Replace with real endpoint
      .then(res => res.json())
      .then(setDatasets);
  }, []);

  const navigate = useNavigate();
  const handleCreateNew = () => navigate("/datasets/new");

  return (
    <div>
      <div className="page-header">
        <h1>Datasets</h1>
        <CreateNewButton onClick={handleCreateNew} />
      </div>
      <div className="card-grid">
        {datasets.map(ds => (
          <BaseCard key={ds.name} title={ds.name} description={ds.description}>
            <p><strong>Format:</strong> {ds.format}</p>
            <p><strong>Fields:</strong> {ds.metadata.length}</p>
            <p><strong>Channels:</strong> {ds.channels.length}</p>
          </BaseCard>
        ))}
      </div>
    </div>
  );
}
