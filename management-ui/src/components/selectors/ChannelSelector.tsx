import { useEffect, useState } from "react";
import { getChannels } from "../../lib/api";

interface ChannelSelectorProps {
  datasetId: string;
  value: string;
  onChange: (channel: string) => void;
}

export default function ChannelSelector({ datasetId, value, onChange }: ChannelSelectorProps) {
  const [channels, setChannels] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!datasetId) {
      setChannels([]);
      return;
    }

    setLoading(true);
    getChannels(datasetId)
      .then((chs) => {
        setChannels(chs);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setChannels([]);
        setError("Failed to load channels for dataset.");
      })
      .finally(() => setLoading(false));
  }, [datasetId]);

  return (
    <div>
      <label>Channel</label>
      {loading && <p>Loading channels...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && (
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">-- Select --</option>
          {channels.map((ch) => (
            <option key={ch} value={ch}>
              {ch}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
