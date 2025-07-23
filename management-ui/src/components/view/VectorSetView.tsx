// src/pages/VectorSetView.tsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { VectorSetConfig } from "../../types/app";
import { getVectorSet } from "../../lib/api";
import ErrorPopup from "../basic/ErrorPopup";
import VectorSetViewer from "../viewers/VectorSetViewer"; // The read-only viewer

export default function VectorSetView() {
  const { id } = useParams(); // from route /vectorsets/:id
  const [vectorSet, setVectorSet] = useState<VectorSetConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("No vector set ID provided.");
      return;
    }

    getVectorSet(id)
      .then(setVectorSet)
      .catch((err) => {
        setError("Failed to load vector set.");
        console.error("Fetch error:", err);
      });
  }, [id]);

  if (error) {
    return <ErrorPopup message={error} onClose={() => setError(null)} />;
  }

  if (!vectorSet) {
    return <p>Loading vector set...</p>;
  }

  return (
    <div>
      <h2>Vector Set Details</h2>
      <VectorSetViewer config={vectorSet} />
    </div>
  );
}
