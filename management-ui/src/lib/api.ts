import type {
  DatasetConfig,
} from "../types/app";

const BASE_URL = "http://0.0.0.0:8001";

export async function getDefaultDataset(): Promise<DatasetConfig> {
  try {
    const res = await fetch(`${BASE_URL}/defaults/dataset`);
    if (!res.ok) throw new Error("Server responded with error");
    return await res.json();
  } catch (err) {
    console.error("Fetch failed:", err);
    throw new Error("Could not connect to backend. Is it running?");
  }
}

export async function getAllDatasets(): Promise<DatasetConfig[]> {
  const res = await fetch(`${BASE_URL}/datasets`);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to fetch datasets: ${res.status} ${errText}`);
  }
  return await res.json();
}

export async function createObject<T>(endpoint: string, config: T): Promise<T> {
  const res = await fetch(`${BASE_URL}/${endpoint}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Backend error: ${res.status} ${errText}`);
  }
  return await res.json();
}


export async function getDatasets(): Promise<DatasetConfig[]> {
  const res = await fetch(`${BASE_URL}/api/datasets`);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to fetch datasets: ${res.status} ${errText}`);
  }
  return await res.json();
}


export async function getChannels(datasetId: string): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/api/${datasetId}/channel`);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to fetch channels: ${res.status} ${errText}`);
  }
  return res.json();  // Now directly returns string[]
}

// src/lib/api.ts
export async function getDefaultChunkers() {
  const res = await fetch("/defaults/chunker");
  if (!res.ok) throw new Error("Failed to fetch chunker defaults");
  return res.json(); // { length_chunker: ..., sentence_chunker: ... }
}

export async function getDefaultEmbedders() {
  const res = await fetch("/defaults/embedder");
  if (!res.ok) throw new Error("Failed to fetch embedder defaults");
  return res.json(); // { auto_model: ..., bge: ... }
}
