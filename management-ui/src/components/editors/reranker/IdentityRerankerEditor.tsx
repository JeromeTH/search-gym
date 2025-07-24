// src/components/editors/reranker/IdentityRerankerEditor.tsx
import type { IdentityRerankerConfig } from "../../../types/app";
import { useEffect } from "react";

interface Props {
  onSubmit: (config: IdentityRerankerConfig) => void;
}

export default function IdentityRerankerEditor({ onSubmit }: Props) {
  useEffect(() => {
    onSubmit({ type: "identity" });
  }, [onSubmit]);

  return (
    <div>
      <p>Identity Reranker has no configuration.</p>
    </div>
  );
}
