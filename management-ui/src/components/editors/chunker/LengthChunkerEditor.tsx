// src/components/editors/LengthChunkerEditor.tsx
import { useState, useEffect } from "react";
import type { LengthChunkerConfig } from "../../../types/app";
import { getDefaultChunker } from "../../../lib/api";

interface Props {
  onChange: (config: LengthChunkerConfig) => void;
}

export default function LengthChunkerEditor({ onChange }: Props) {
  const [config, setConfig] = useState<LengthChunkerConfig>({
    type: "length_chunker",
    chunk_size: 100,
    overlap: 20,
  });

  useEffect(() => {
    getDefaultChunker("length_chunker")
      .then((cfg) => {
        const typedCfg = cfg as LengthChunkerConfig;
        setConfig(typedCfg);
        onChange(typedCfg);
      })
      .catch(console.error);
  }, []);

  const updateField = (key: "chunk_size" | "overlap", value: string) => {
    const updated = { ...config, [key]: parseInt(value, 10) };
    setConfig(updated);
    onChange(updated);
  };

  return (
    <div>
      <h4>Length Chunker</h4>
      <div>
        <label>Chunk Size</label>
        <input
          type="number"
          value={config.chunk_size}
          onChange={(e) => updateField("chunk_size", e.target.value)}
        />
      </div>
      <div>
        <label>Overlap</label>
        <input
          type="number"
          value={config.overlap}
          onChange={(e) => updateField("overlap", e.target.value)}
        />
      </div>
    </div>
  );
}
