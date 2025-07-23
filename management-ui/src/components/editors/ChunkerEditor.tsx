// src/components/editors/ChunkerEditor.tsx
import { useEffect, useState } from "react";
import type { ChunkerConfig, ChunkerType } from "../../types/app";
import { ChunkerTypeValues, languageValues } from "../../types/app";
import { getDefaultChunker } from "../../lib/api";

interface Props {
  onChange: (config: ChunkerConfig) => void;
}

export default function ChunkerEditor({ onChange }: Props) {
  const [config, setConfig] = useState<ChunkerConfig | null>(null);

  const handleTypeChange = (type: ChunkerType) => {
    getDefaultChunker(type)
      .then((defaultCfg) => {
        setConfig(defaultCfg);
        onChange(defaultCfg);
      })
      .catch(console.error);
  };

  const handleFieldChange = (key: string, value: string) => {
    if (!config) return;
    const updated = { ...config, [key]: value } as ChunkerConfig;
    setConfig(updated);
    onChange(updated);
  };

  const renderField = (key: string, value: string) => {
    if (key === "language") {
      return (
        <div key={key}>
          <label>{key}</label>
          <select
            value={value}
            onChange={(e) => handleFieldChange(key, e.target.value)}
          >
            {languageValues.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
      );
    }

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
      <h3>Chunker</h3>
      <select
        value={config?.type ?? ""}
        onChange={(e) => handleTypeChange(e.target.value as ChunkerType)}
      >
        <option value="">-- Select --</option>
        {ChunkerTypeValues.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>

      {config && (
        <div style={{ marginTop: "1rem" }}>
          {Object.entries(config).map(([key, value]) =>
            key === "type" ? null : renderField(key, value)
          )}
        </div>
      )}
    </div>
  );
}
