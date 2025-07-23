import { useState, useEffect } from "react";
import type { DatasetConfig, EntryMeta, Filter } from "../../types/app";
import ErrorPopup from "../basic/ErrorPopup";
import EntryMetaEditor from "../editors/EntryMetaEditor";
import FilterEditor from "../editors/FilterEditor";

interface DatasetEditorProps {
  onSubmit: (config: DatasetConfig) => void;
  defaultValue?: DatasetConfig;
}

export default function DatasetEditor({ onSubmit, defaultValue }: DatasetEditorProps) {
  const [id, setId] = useState<string | undefined>(defaultValue?.id);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [root, setRoot] = useState("");
  const [metadata, setMetadata] = useState<EntryMeta[]>([]);
  const [channels, setChannels] = useState<EntryMeta[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!defaultValue) return;

    setId(defaultValue.id);
    setName(defaultValue.name ?? "");
    setDescription(defaultValue.description ?? "");
    setRoot(defaultValue.root ?? "");
    setMetadata(defaultValue.metadata ?? []);
    setChannels(defaultValue.channels ?? []);
    setFilters(defaultValue.filters ?? []);
  }, [defaultValue]);

  const handleSubmit = () => {
    if (!root || !name) {
      setError("Dataset name and root path are required.");
      return;
    }

    const config: DatasetConfig = {
      ...(id ? { id } : {}),
      name,
      description,
      root,
      format: "json",
      metadata,
      channels,
      filters,
    };

    onSubmit(config);
  };

  return (
    <div>
      {error && <ErrorPopup message={error} onClose={() => setError(null)} />}

      {id && (
        <div>
          <label>Dataset ID</label>
          <input value={id} readOnly style={{ backgroundColor: "#f5f5f5" }} />
        </div>
      )}

      <div>
        <label>Dataset Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div>
        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div>
        <label>Root Directory</label>
        <input value={root} onChange={(e) => setRoot(e.target.value)} />
      </div>

      <EntryMetaEditor label="Metadata Fields" entries={metadata} onChange={setMetadata} />
      <EntryMetaEditor label="Channel Fields" entries={channels} onChange={setChannels} />
      <FilterEditor filters={filters} onChange={setFilters} />

      <br />
      <button onClick={handleSubmit}>
        {"submit"}
      </button>
    </div>
  );
}
