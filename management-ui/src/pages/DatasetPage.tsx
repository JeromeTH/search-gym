import BaseCard from "../components/cards/BaseCard";
import CreateNewButton from "../components/basic/CreateNewButton";
import type { DatasetConfig } from "../types/app";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllDatasets } from "../lib/api";

export default function DatasetPage() {
  const [datasets, setDatasets] = useState<DatasetConfig[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getAllDatasets()
      .then(setDatasets)
      .catch((err) => {
        console.error("Failed to load datasets:", err);
        setDatasets([]);
      });
  }, []);

  const handleCreateNew = () => navigate("/datasets/new");

  const handleCardClick = (id: string) => {
    navigate(`/datasets/${id}`);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Datasets</h1>
        <CreateNewButton onClick={handleCreateNew} />
      </div>
      <div className="card-grid">
        {datasets.map((ds) => (
          <div key={ds.id ?? ds.name} onClick={() => handleCardClick(ds.id!)} style={{ cursor: "pointer" }}>
            <BaseCard title={ds.name} description={ds.description}>
              <p><strong>ID:</strong> {ds.id}</p>
              <p><strong>Format:</strong> {ds.format}</p>
              <p><strong>Fields:</strong> {ds.metadata.length}</p>
              <p><strong>Channels:</strong> {ds.channels.length}</p>
            </BaseCard>
          </div>
        ))}
      </div>
    </div>
  );
}
