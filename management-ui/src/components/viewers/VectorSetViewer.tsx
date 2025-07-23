// src/components/viewers/VectorSetViewer.tsx

import type { VectorSetConfig } from "../../types/app";
import DatasetCard from "../cards/DatasetCard";

interface VectorSetViewerProps {
  config: VectorSetConfig;
}

export default function VectorSetViewer({ config }: VectorSetViewerProps) {
  const {
    root,
    channel,
    dataset,
    chunker,
    embedder,
  } = config;

  return (
    <div>
      <h2>Vector Set Viewer</h2>

      <div>
        <label>Root Path</label>
        <input value={root} readOnly style={{ backgroundColor: "#f5f5f5" }} />
      </div>

      <div>
        <label>Channel</label>
        <input value={channel} readOnly style={{ backgroundColor: "#f5f5f5" }} />
      </div>

      <div>
        <label>Dataset</label>
        <DatasetCard dataset = {dataset} />
      </div>

      {dataset?.id && (
        <div>
          <label>Dataset ID</label>
          <input value={dataset.id} readOnly style={{ backgroundColor: "#f5f5f5" }} />
        </div>
      )}

      <div>
        <label>Chunker</label>
        <input value={chunker.type} readOnly style={{ backgroundColor: "#f5f5f5" }} />
        <ul style={{ marginLeft: "1rem" }}>
          {Object.entries(chunker).map(([key, val]) => {
            if (key === "type") return null;
            return (
              <li key={key}>
                <code>{key}</code>: {val.toString()}
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <label>Embedder</label>
        <input value={embedder.type} readOnly style={{ backgroundColor: "#f5f5f5" }} />
        <ul style={{ marginLeft: "1rem" }}>
          <li><code>embedding_type</code>: {embedder.embedding_type}</li>
          <li><code>model_name</code>: {embedder.model_name}</li>
        </ul>
      </div>
    </div>
  );
}
