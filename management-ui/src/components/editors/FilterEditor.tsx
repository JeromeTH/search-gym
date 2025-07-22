import { useState } from "react";
import type { Filter, FilterType } from "../../types/app";
import { FilterTypeValues } from "../../types/app";

interface Props {
  filters: Filter[];
  onChange: (updated: Filter[]) => void;
}

export default function FilterEditor({ filters, onChange }: Props) {
  const [newFilter, setNewFilter] = useState<Filter>({
    name: "",
    filter_type: "filter",
  });

  const handleAdd = () => {
    if (!newFilter.name.trim()) return;
    onChange([...filters, newFilter]);
    setNewFilter({ name: "", filter_type: "filter" });
  };

  const handleRemove = (index: number) => {
    const updated = [...filters];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <div>
      <h3>Filters</h3>
      <ul>
        {filters.map((f, i) => (
          <li key={i}>
            <code>{f.name}</code> — type: {f.filter_type}
            <button onClick={() => handleRemove(i)}>✕</button>
          </li>
        ))}
      </ul>

      <div>
        <input
          placeholder="Filter name"
          value={newFilter.name}
          onChange={(e) => setNewFilter({ ...newFilter, name: e.target.value })}
        />
        <select
          value={newFilter.filter_type}
          onChange={(e) => setNewFilter({ ...newFilter, filter_type: e.target.value as FilterType })}
        >
          {FilterTypeValues.map((ft) => (
            <option key={ft} value={ft}>
              {ft}
            </option>
          ))}
        </select>
        <button onClick={handleAdd}>Add</button>
      </div>
    </div>
  );
}
