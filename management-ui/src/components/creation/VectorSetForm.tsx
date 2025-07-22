import { useState } from "react";
import type {
  VectorSetConfig,
  DatasetConfig,
  ChunkerConfig,
  EmbedderConfig,
} from "../../types/app";
import DatasetSelector from "../selectors/DatasetSelector";
import ChannelSelector from "../selectors/ChannelSelector";
import ChunkerEditor from "../editors/ChunkerEditor";
import EmbedderEditor from "../editors/EmbedderEditor";

interface VectorSetFormProps {
  onSubmit: (config: VectorSetConfig) => void;
}

export default function VectorSetForm({ onSubmit }: VectorSetFormProps) {
  const [selectedDataset, setSelectedDataset] = useState<DatasetConfig | null>(null);
  const [channel, setChannel] = useState("");
  const [root, setRoot] = useState("");
  const [chunker, setChunker] = useState<ChunkerConfig | null>(null);
  const [embedder, setEmbedder] = useState<EmbedderConfig | null>(null);

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

      <DatasetSelector
        value={selectedDataset?.name ?? ""}
        onChange={(ds) => {
          setSelectedDataset(ds);
          setChannel("");
        }}
      />

      {!selectedDataset?.id ? (
        <div style={{ color: "red", marginTop: "10px" }}>
          ⚠️ Please create a dataset before creating a vector set.
        </div>
      ) : (
        <>
          <ChannelSelector
            datasetId={selectedDataset.id}
            value={channel}
            onChange={setChannel}
          />
          <ChunkerEditor config={chunker} onChange={setChunker} />
          <EmbedderEditor config={embedder} onChange={setEmbedder} />
          <button onClick={handleSubmit}>Create Vector Set</button>
        </>
      )}
    </div>
  );
}
