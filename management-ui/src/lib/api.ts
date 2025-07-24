import type {
  DatasetConfig,
  ChunkerConfig, 
  ChunkerType,
  EmbedderType, 
  EmbedderConfig, 
  VectorSetConfig, 
  AppConfig,
} from "../types/app";
import type { Status } from "../types/ui";

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

export async function getDataset(id: string): Promise<DatasetConfig> {
  const res = await fetch(`${BASE_URL}/datasets/${id}`);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to fetch dataset: ${res.status} ${errText}`);
  }
  return await res.json();
}

export async function getAllVectorSets(): Promise<VectorSetConfig[]> {
  const res = await fetch(`${BASE_URL}/vector_sets`);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to fetch vector sets: ${res.status} ${errText}`);
  }
  return await res.json();
}

export async function getVectorSet(id: string): Promise<VectorSetConfig> {
  const res = await fetch(`${BASE_URL}/vector_sets/${id}`);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to fetch vector set: ${res.status} ${errText}`);
  }
  return await res.json();
}

export async function getAllApps(): Promise<AppConfig[]> {
  const res = await fetch(`${BASE_URL}/apps`);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to fetch apps: ${res.status} ${errText}`);
  } 
  return await res.json();
}

export async function getApp(id: string): Promise<AppConfig> {
  const res = await fetch(`${BASE_URL}/apps/${id}`);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to fetch app: ${res.status} ${errText}`);
  }
  return await res.json();
}

export async function activateApp(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/apps/${id}/activate`, {
    method: "POST",
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to activate app: ${res.status} ${errText}`);
  }
}

export async function getAppStatus(id: string) : Promise<Status> {
  const res = await fetch(`${BASE_URL}/apps/${id}/status`);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to fetch app status: ${res.status} ${errText}`);
  }
  const status: Status = await res.json();
  if (status !== "inactive" && status !== "active" && status !== "activating") {
    throw new Error(`Invalid status received: ${status}`);
  }
  return status;
}

export async function register<T>(endpoint: string, config: T): Promise<T> {
  const res = await fetch(`${BASE_URL}/${endpoint}/register`, {
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

export async function getDefaultChunker(type: ChunkerType): Promise<ChunkerConfig> {
  const res = await fetch(`${BASE_URL}/defaults/chunker/${type}`);
  if (!res.ok) throw new Error(`Failed to fetch default config for chunker: ${type}`);
  return await res.json(); // Returns a valid ChunkerConfig
}

export async function getDefaultEmbedder(type: EmbedderType): Promise<EmbedderConfig> {
  const res = await fetch(`${BASE_URL}/defaults/embedder/${type}`);
  if (!res.ok) throw new Error("Failed to fetch embedder defaults");
  return res.json(); // EmbedderConfig
}