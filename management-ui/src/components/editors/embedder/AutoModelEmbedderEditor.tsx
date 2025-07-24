// src/components/editors/AutoModelEditor.tsx
import { useEffect, useState } from "react";
import type { AutoModelEmbedderConfig } from "../../../types/app";
import { getDefaultEmbedder } from "../../../lib/api";

interface Props {
  onChange: (config: AutoModelEmbedderConfig) => void;
}

export default function AutoModelEditor({ onChange }: Props) {
  const [config, setConfig] = useState<AutoModelEmbedderConfig>({
    type: "auto_model",
    embedding_type: "dense",
    model_name: "",
  });

  useEffect(() => {
    getDefaultEmbedder("auto_model")
      .then((cfg) => {
        const typedCfg = cfg as AutoModelEmbedderConfig;
        setConfig(typedCfg);
        onChange(typedCfg);
      })
      .catch(console.error);
  }, []);

  const updateField = (value: string) => {
    const updated = { ...config, model_name: value };
    setConfig(updated);
    onChange(updated);
  };

  return (
    <div>
      <h4>Auto Model Embedder</h4>
      <label>Model Name</label>
      <input
        type="text"
        value={config.model_name}
        onChange={(e) => updateField(e.target.value)}
      />
    </div>
  );
}
