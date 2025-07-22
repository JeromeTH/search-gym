import { useEffect, useState } from "react";
import type { EmbedderConfig } from "../../types/app";
import { getDefaultEmbedders } from "../../lib/api";

interface Props {
  config: EmbedderConfig | null;
  onChange: (c: EmbedderConfig) => void;
}

export default function EmbedderEditor({ config, onChange }: Props) {
  const [defaults, setDefaults] = useState<{ [key: string]: EmbedderConfig }>({});

  useEffect(() => {
    getDefaultEmbedders().then(setDefaults).catch(console.error);
  }, []);

  const handleTypeChange = (type: string) => {
    if (defaults[type]) {
      onChange(defaults[type]);
    }
  };

  return (
    <div>
      <h3>Embedder</h3>
      <select
        value={config?.type ?? ""}
        onChange={(e) => handleTypeChange(e.target.value)}
      >
        <option value="">-- Select --</option>
        {Object.keys(defaults).map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      {config && (
        <>
          <label>Model Name</label>
          <input
            value={config.model_name}
            onChange={(e) =>
              onChange({ ...config, model_name: e.target.value })
            }
          />
        </>
      )}
    </div>
  );
}
