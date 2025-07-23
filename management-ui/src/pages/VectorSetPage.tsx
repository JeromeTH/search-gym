import BaseCard from "../components/cards/BaseCard";
import VectorSetCard from "../components/cards/VectorSetCard";
import CreateNewButton from "../components/basic/CreateNewButton";
import type { VectorSetConfig } from "../types/app";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllVectorSets } from "../lib/api";


export default function VectorSetPage() {
  const [vectorSets, setVectorSets] = useState<VectorSetConfig[]>([]);

  useEffect(() => {
    getAllVectorSets()
      .then(setVectorSets) 
      .catch((err) => {
        console.error("Failed to load datasets:", err);
        setVectorSets([]);
      });
  }, []);

  const navigate = useNavigate();

  return (
    <div>
      <div className="page-header">
        <h1>Vector Sets</h1>
        <CreateNewButton onClick={() => navigate("/vector-sets/new")} />
      </div>
      <div className="card-grid">
         {/* {datasets.map((ds) => (
                    <DatasetCard dataset={ds} onClick={() => handleCardClick(ds.id!)}/>
                ))} */}
        {vectorSets.map((vs) => (
          <VectorSetCard
            vectorSet={vs}
            onClick={() => navigate(`/vector-sets/${vs.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
