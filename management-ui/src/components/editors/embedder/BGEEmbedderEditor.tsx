// src/components/editors/BGEEditor.tsx
import { useEffect, useState } from "react";
import type { BGEEmbedderConfig } from "../../../types/app";
import { getDefaultEmbedder } from "../../../lib/api";

interface Props {
  onChange: (config: BGEEmbedderConfig) => void;
}

export default function BGEEditor({ onChange }: Props) {
  const [config, setConfig] = useState<BGEEmbedderConfig>({
    type: "bge",
    embedding_type: "sparse",
    model_name: "",
  });

  useEffect(() => {
    getDefaultEmbedder("bge")
      .then((cfg) => {
        const typedCfg = cfg as BGEEmbedderConfig;
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
      <h4>BGE Embedder</h4>
      <label>Model Name</label>
      <input
        type="text"
        value={config.model_name}
        onChange={(e) => updateField(e.target.value)}
      />
    </div>
  );
}
