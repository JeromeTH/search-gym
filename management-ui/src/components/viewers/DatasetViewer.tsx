// src/components/viewers/DatasetViewer.tsx

import type { DatasetConfig } from "../../types/app";

interface DatasetViewerProps {
  config: DatasetConfig;
}

export default function DatasetViewer({ config }: DatasetViewerProps) {
  const {
    id,
    name,
    description,
    root,
    format,
    metadata,
    channels,
    filters,
    created_by,
  } = config;

  const renderEntryMeta = (entries: typeof config.metadata) => (
    <ul style={{ marginLeft: "1rem" }}>
      {entries.map((entry, idx) => (
        <li key={idx}>
          <code>{entry.name}</code> — <em>{entry.type}</em>, max length: {entry.max_length}
          {entry.is_required === false && " (optional)"}
        </li>
      ))}
    </ul>
  );

  const renderFilters = () => (
    <ul style={{ marginLeft: "1rem" }}>
      {filters.map((filter, idx) => (
        <li key={idx}>
          <code>{filter.name}</code> — <em>{filter.filter_type}</em>
        </li>
      ))}
    </ul>
  );

  return (
    <div>
      <h2>Dataset Viewer</h2>

      {id && (
        <div>
          <label>Dataset ID</label>
          <input value={id} readOnly style={{ backgroundColor: "#f5f5f5" }} />
        </div>
      )}

      <div>
        <label>Dataset Name</label>
        <input value={name} readOnly style={{ backgroundColor: "#f5f5f5" }} />
      </div>

      <div>
        <label>Description</label>
        <textarea value={description} readOnly style={{ backgroundColor: "#f5f5f5" }} />
      </div>

      <div>
        <label>Root Directory</label>
        <input value={root} readOnly style={{ backgroundColor: "#f5f5f5" }} />
      </div>

      <div>
        <label>Format</label>
        <input value={format} readOnly style={{ backgroundColor: "#f5f5f5" }} />
      </div>

      {created_by && (
        <div>
          <label>Created By</label>
          <input value={created_by} readOnly style={{ backgroundColor: "#f5f5f5" }} />
        </div>
      )}

      <div>
        <label>Metadata Fields</label>
        {renderEntryMeta(metadata)}
      </div>

      <div>
        <label>Channel Fields</label>
        {renderEntryMeta(channels)}
      </div>

      <div>
        <label>Filters</label>
        {renderFilters()}
      </div>
    </div>
  );
}
