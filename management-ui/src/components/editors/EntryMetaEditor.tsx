import { useState } from "react";
import type { EntryMeta, EntryType } from "../../types/app";
import { EntryValues } from "../../types/app"; // Use the constant values

interface Props {
  entries: EntryMeta[];
  onChange: (updated: EntryMeta[]) => void;
  label: string;
}

export default function EntryMetaEditor({ entries, onChange, label }: Props) {
  const [newField, setNewField] = useState<EntryMeta>({
    name: "",
    type: "str",
    max_length: 64,
    is_required: true,
  });

  const handleAdd = () => {
    if (!newField.name.trim()) return;
    onChange([...entries, newField]);
    setNewField({ name: "", type: "str", max_length: 64, is_required: true });
  };

  const handleRemove = (index: number) => {
    const updated = [...entries];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <div>
      <h3>{label}</h3>
      <ul>
        {entries.map((entry, i) => (
          <li key={i}>
            <code>{entry.name}</code> — type: {entry.type}, max length: {entry.max_length}, required:{" "}
            {entry.is_required ? "yes" : "no"}
            <button onClick={() => handleRemove(i)}>✕</button>
          </li>
        ))}
      </ul>

      <div>
        <input
          placeholder="Field name"
          value={newField.name}
          onChange={(e) => setNewField({ ...newField, name: e.target.value })}
        />
        <select
          value={newField.type}
          onChange={(e) => setNewField({ ...newField, type: e.target.value as EntryType })}
        >
          {EntryValues.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={newField.max_length}
          onChange={(e) => setNewField({ ...newField, max_length: Number(e.target.value) })}
        />
        <label>
          <input
            type="checkbox"
            checked={newField.is_required}
            onChange={(e) => setNewField({ ...newField, is_required: e.target.checked })}
          />
          Required
        </label>
        <button onClick={handleAdd}>Add</button>
      </div>
    </div>
  );
}
