import { useEffect, useState } from "react";
import type {
  VectorSetConfig,
  DatasetConfig,
  ChunkerConfig,
  EmbedderConfig,
} from "../../types/app";
import { getAllDatasets } from "../../lib/api";
import ChannelSelector from "../selectors/ChannelSelector";
import ChunkerEditor from "../editors/ChunkerEditor";
import EmbedderEditor from "../editors/EmbedderEditor";
import BaseCard from "../cards/BaseCard";
import DatasetCard from "../cards/DatasetCard";
import "../styles/styles.css"

interface VectorSetFormProps {
  onSubmit: (config: VectorSetConfig) => void;
}

export default function VectorSetForm({ onSubmit }: VectorSetFormProps) {
  const [datasets, setDatasets] = useState<DatasetConfig[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<DatasetConfig | null>(null);
  const [channel, setChannel] = useState("");
  const [root, setRoot] = useState("");
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
    <div>
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
          <ChunkerEditor onChange={setChunker} />
          <EmbedderEditor onChange={setEmbedder} />
          <button onClick={handleSubmit}>Create Vector Set</button>
        </>
      )}
    </div>
  );
}
