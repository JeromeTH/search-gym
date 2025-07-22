import { useState } from "react";
import type { DatasetConfig, EntryMeta, Filter } from "../../types/app";
import { getDefaultDataset } from "../../lib/api";
import ErrorPopup from "../basic/ErrorPopup";
import EntryMetaEditor from "../editors/EntryMetaEditor";
import FilterEditor from "../editors/FilterEditor";

interface DatasetFormProps {
    onSubmit: (config: DatasetConfig) => void;
}

export default function DatasetForm({ onSubmit }: DatasetFormProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [root, setRoot] = useState("");
    const [metadata, setMetadata] = useState<EntryMeta[]>([]);
    const [channels, setChannels] = useState<EntryMeta[]>([]);
    const [filters, setFilters] = useState<Filter[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = () => {
        if (!root || !name) {
            setError("Dataset name and root path are required.");
            return;
        }

        onSubmit({
            name,
            description,
            root,
            format: "json",
            metadata,
            channels,
            filters,
        });
    };

    const handleLoadDefault = async () => {
        try {
            const defaultDs = await getDefaultDataset();
            setName(defaultDs.name);
            setDescription(defaultDs.description ?? "");
            setRoot(defaultDs.root ?? "");
            setMetadata(defaultDs.metadata);
            setChannels(defaultDs.channels);
            setFilters(defaultDs.filters);
        } catch (err) {
            setError("Failed to load default dataset from backend.");
            console.error("Error loading default dataset:", err);
        }
    };

    return (
        <div>
            <div style={{
                backgroundColor: "#fff3cd",
                color: "#856404",
                border: "1px solid #ffeeba",
                borderRadius: "6px",
                padding: "12px",
                marginBottom: "20px"
            }}>
                ⚠️ <strong>Important:</strong> Your dataset's <code>root</code> directory must contain a valid JSON file.
                Every document in that file should include all metadata, channel, and filter attributes you configure below.
                <br />
                <br />
                <em>You are not inventing new fields here — you're assigning fields that must already exist in the dataset’s JSON structure.</em>
            </div>
            <h2>Create New Dataset</h2>
            {error && <ErrorPopup message={error} onClose={() => setError(null)} />}
            <button onClick={handleLoadDefault}>Load Default Dataset</button>

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
            <button onClick={handleSubmit}>Create Dataset</button>
        </div>
    );
}
