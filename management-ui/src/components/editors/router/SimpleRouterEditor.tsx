// src/components/editors/router/SimpleRouterEditor.tsx
import type { SimpleRouterConfig } from "../../../types/app";
import { useEffect } from "react";

interface Props {
  onSubmit: (config: SimpleRouterConfig) => void;
}

export default function SimpleRouterEditor({ onSubmit }: Props) {
  useEffect(() => {
    onSubmit({ type: "simple" });
  }, [onSubmit]);

  return (
    <div>
      <p>Simple Router has no configuration.</p>
    </div>
  );
}
