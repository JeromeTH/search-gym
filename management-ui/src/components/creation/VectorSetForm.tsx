// src/components/forms/VectorSetForm.tsx

import { useEffect, useState } from "react";
import type {
  VectorSetConfig,
  DatasetConfig,
  ChunkerConfig,
  EmbedderConfig,
  ChunkerType,
  EmbedderType,
} from "../../types/app";
import {
  getAllDatasets,
} from "../../lib/api";
import {
  ChunkerTypeValues,
  EmbedderTypeValues,
} from "../../types/app";
import ChannelSelector from "../selectors/ChannelSelector";
import DatasetCard from "../cards/DatasetCard";
import LengthChunkerEditor from "../editors/chunker/LengthChunkerEditor";
import SentenceChunkerEditor from "../editors/chunker/SentenceChunkerEditor";
import AutoModelEditor from "../editors/embedder/AutoModelEmbedderEditor";
import BGEEditor from "../editors/embedder/BGEEmbedderEditor";
import "../styles/styles.css";

interface VectorSetFormProps {
  onSubmit: (config: VectorSetConfig) => void;
}

export default function VectorSetForm({ onSubmit }: VectorSetFormProps) {
  const [datasets, setDatasets] = useState<DatasetConfig[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<DatasetConfig | null>(null);
  const [channel, setChannel] = useState("");
  const [root, setRoot] = useState("");

  const [chunkerType, setChunkerType] = useState<ChunkerType | "">("");
  const [embedderType, setEmbedderType] = useState<EmbedderType | "">("");

  const [chunker, setChunker] = useState<ChunkerConfig | null>(null);
  const [embedder, setEmbedder] = useState<EmbedderConfig | null>(null);

  useEffect(() => {
    getAllDatasets()
      .then(setDatasets)
      .catch((err) => {
        console.error("Failed to load datasets:", err);
        setDatasets([]);
      });
  }, []);

  const handleSubmit = () => {
    if (!selectedDataset || !chunker || !embedder) return;
    onSubmit({
      root,
      dataset: selectedDataset,
      channel,
      chunker,
      embedder,
    });
  };

  return (
    <div className="form-container">
      <h2>Create Vector Set</h2>

      <div>
        <label>Root Path</label>
        <input
          placeholder="/path/to/vector/store"
          value={root}
          onChange={(e) => setRoot(e.target.value)}
        />
      </div>

      <div className="scrollable-card-container">
        {datasets.map((ds) => (
          <DatasetCard
            key={ds.id}
            dataset={ds}
            selected={selectedDataset?.id === ds.id}
            onClick={() => {
              setSelectedDataset(ds);
              setChannel(""); // Reset channel when dataset changes
            }}
          />
        ))}
      </div>

      {!selectedDataset?.id ? (
        <div style={{ color: "red", marginTop: "10px" }}>
          ⚠️ Please select a dataset before proceeding.
        </div>
      ) : (
        <>
          <ChannelSelector
            datasetId={selectedDataset.id}
            value={channel}
            onChange={setChannel}
          />

          <label>Chunker Type</label>
          <select value={chunkerType} onChange={(e) => setChunkerType(e.target.value as ChunkerType)}>
            <option value="">-- Select --</option>
            {ChunkerTypeValues.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {chunkerType === "length_chunker" && <LengthChunkerEditor onChange={setChunker} />}
          {chunkerType === "sentence_chunker" && <SentenceChunkerEditor onChange={setChunker} />}

          <label>Embedder Type</label>
          <select value={embedderType} onChange={(e) => setEmbedderType(e.target.value as EmbedderType)}>
            <option value="">-- Select --</option>
            {EmbedderTypeValues.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {embedderType === "auto_model" && <AutoModelEditor onChange={setEmbedder} />}
          {embedderType === "bge" && <BGEEditor onChange={setEmbedder} />}

          <button onClick={handleSubmit}>Create Vector Set</button>
        </>
      )}
    </div>
  );
}
