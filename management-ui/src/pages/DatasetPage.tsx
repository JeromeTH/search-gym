import BaseCard from "../components/cards/BaseCard";
import DatasetCard from "../components/cards/DatasetCard";
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

  return (
    <div>
      <div className="page-header">
        <h1>Datasets</h1>
        <CreateNewButton onClick={() => navigate("/datasets/new")} />
      </div>
      <div className="grid-standard">
        {datasets.map((ds) => (
            <DatasetCard dataset={ds} onClick={() => navigate(`/datasets/${ds.id}`)}/>
        ))}
      </div>
    </div>
  );
}
