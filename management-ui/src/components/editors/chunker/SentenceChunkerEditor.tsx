// src/components/editors/SentenceChunkerEditor.tsx
import { useEffect, useState } from "react";
import type { SentenceChunkerConfig, Language } from "../../../types/app";
import { languageValues } from "../../../types/app";
import { getDefaultChunker } from "../../../lib/api";

interface Props {
  onChange: (config: SentenceChunkerConfig) => void;
}

export default function SentenceChunkerEditor({ onChange }: Props) {
  const [config, setConfig] = useState<SentenceChunkerConfig>({
    type: "sentence_chunker",
    language: "en",
  });

  useEffect(() => {
    getDefaultChunker("sentence_chunker")
      .then((cfg) => {
        const typedCfg = cfg as SentenceChunkerConfig;
        setConfig(typedCfg);
        onChange(typedCfg);
      })
      .catch(console.error);
  }, []);

  const updateLanguage = (lang: Language) => {
    const updated = { ...config, language: lang };
    setConfig(updated);
    onChange(updated);
  };

  return (
    <div>
      <h4>Sentence Chunker</h4>
      <label>Language</label>
      <select
        value={config.language}
        onChange={(e) => updateLanguage(e.target.value as Language)}
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
