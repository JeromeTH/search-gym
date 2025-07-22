import { useEffect, useState } from "react";
import type { ChunkerConfig } from "../../types/app";
import { getDefaultChunkers } from "../../lib/api";

interface Props {
  config: ChunkerConfig | null;
  onChange: (c: ChunkerConfig) => void;
}

export default function ChunkerEditor({ config, onChange }: Props) {
  const [defaults, setDefaults] = useState<{ [key: string]: ChunkerConfig }>({});

  useEffect(() => {
    getDefaultChunkers().then(setDefaults).catch(console.error);
  }, []);

  const handleTypeChange = (type: string) => {
    if (defaults[type]) {
      onChange(defaults[type]);
    }
  };

  return (
    <div>
      <h3>Chunker</h3>
      <select
        value={config?.type ?? ""}
        onChange={(e) => handleTypeChange(e.target.value)}
      >
        <option value="">-- Select --</option>
        {Object.keys(defaults).map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      {config?.type === "length_chunker" && (
        <>
          <label>Chunk Size</label>
          <input
            type="number"
            value={config.chunk_size}
            onChange={(e) =>
              onChange({ ...config, chunk_size: Number(e.target.value) })
            }
          />
          <label>Overlap</label>
          <input
            type="number"
            value={config.overlap}
            onChange={(e) =>
              onChange({ ...config, overlap: Number(e.target.value) })
            }
          />
        </>
      )}
      {config?.type === "sentence_chunker" && (
        <>
          <label>Language</label>
          <select
            value={config.language}
            onChange={(e) =>
              onChange({ ...config, language: e.target.value as "en" | "zh" })
            }
          >
            <option value="en">English</option>
            <option value="zh">Chinese</option>
          </select>
        </>
      )}
    </div>
  );
}
