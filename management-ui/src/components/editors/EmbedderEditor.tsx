// src/components/editors/EmbedderEditor.tsx
import { useEffect, useState } from "react";
import type { EmbedderConfig, EmbedderType } from "../../types/app";
import { EmbedderTypeValues } from "../../types/app";
import { getDefaultEmbedder } from "../../lib/api";

interface Props {
  onChange: (config: EmbedderConfig) => void;
}

export default function EmbedderEditor({ onChange }: Props) {
  const [config, setConfig] = useState<EmbedderConfig | null>(null);

  const handleTypeChange = (type: EmbedderType) => {
    getDefaultEmbedder(type)
      .then((defaultCfg) => {
        setConfig(defaultCfg);
        onChange(defaultCfg);
      })
      .catch(console.error);
  };

  const handleFieldChange = (key: string, value: string) => {
    if (!config) return;
    const updated = { ...config, [key]: value } as EmbedderConfig;
    setConfig(updated);
    onChange(updated);
  };

  const renderField = (key: string, value: string) => {
    if (key === "type") return null;

    return (
      <div key={key}>
        <label>{key}</label>
        <input
          type="text"
          value={value}
          onChange={(e) => handleFieldChange(key, e.target.value)}
        />
      </div>
    );
  };

  return (
    <div>
      <h3>Embedder</h3>
      <select
        value={config?.type ?? ""}
        onChange={(e) => handleTypeChange(e.target.value as EmbedderType)}
      >
        <option value="">-- Select --</option>
        {EmbedderTypeValues.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>

      {config && (
        <div style={{ marginTop: "1rem" }}>
          {Object.entries(config).map(([key, value]) =>
            renderField(key, value)
          )}
        </div>
      )}
    </div>
  );
}
