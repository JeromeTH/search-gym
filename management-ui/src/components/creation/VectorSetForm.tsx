import { useEffect, useState } from "react";
import type { VectorSetConfig, DatasetConfig, ChunkerConfig, EmbedderConfig } from "../../types/app";
import DatasetForm from "./DatasetForm";

interface VectorSetFormProps {
    onSubmit: (config: VectorSetConfig) => void;
}

export default function VectorSetForm({ onSubmit }: VectorSetFormProps) {
    const [datasets, setDatasets] = useState<DatasetConfig[]>([]);
    const [selectedDataset, setSelectedDataset] = useState<DatasetConfig | null>(null);
    const [creatingDataset, setCreatingDataset] = useState(false);

    const [channel, setChannel] = useState("");
    const [chunker, setChunker] = useState<ChunkerConfig>({ type: "length_chunker", chunk_size: 512, overlap: 50 });
    const [embedder, setEmbedder] = useState<EmbedderConfig>({ type: "auto_model", embedding_type: "dense", model_name: "" });
    const [root, setRoot] = useState("");

    useEffect(() => {
        fetch("/api/datasets").then(res => res.json()).then(setDatasets);
    }, []);

    const handleSubmit = () => {
        if (!selectedDataset) return;
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
            <div>
                <label>Root Path</label>
                <input
                    placeholder="/path/to/vector/store"
                    value={root}
                    onChange={(e) => setRoot(e.target.value)}
                />
            </div>
            <h2>Create Vector Set</h2>
            {creatingDataset ? (
                <DatasetForm onSubmit={(ds) => {
                    setSelectedDataset(ds);
                    setCreatingDataset(false);
                    setDatasets((prev) => [...prev, ds]);
                }} />
            ) : (
                <>
                    <label>Select Dataset</label>
                    <select value={selectedDataset?.name ?? ""} onChange={(e) => {
                        const selected = datasets.find(d => d.name === e.target.value);
                        setSelectedDataset(selected ?? null);
                    }}>
                        <option value="">-- Select --</option>
                        {datasets.map(ds => (
                            <option key={ds.name} value={ds.name}>{ds.name}</option>
                        ))}
                    </select>
                    <button onClick={() => setCreatingDataset(true)}>+ Create New Dataset</button>
                </>
            )}
            {selectedDataset && (
                <>
                    <label>Channel</label>
                    <select value={channel} onChange={(e) => setChannel(e.target.value)}>
                        <option value="">-- Select --</option>
                        {selectedDataset.channels.map(ch => (
                            <option key={ch.name} value={ch.name}>{ch.name}</option>
                        ))}
                    </select>

                    <label>Embedder Model</label>
                    <input value={embedder.model_name} onChange={(e) =>
                        setEmbedder({ ...embedder, model_name: e.target.value })
                    } />

                    <button onClick={handleSubmit}>Create Vector Set</button>
                </>
            )}
        </div>
    );
}
