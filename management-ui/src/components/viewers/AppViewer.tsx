import type { AppConfig } from "../../types/app";

interface AppViewerProps {
  config: AppConfig;
}

export default function AppViewer({ config }: AppViewerProps) {
  const {
    name,
    description,
    search_engines,
    router,
    reranker,
  } = config;

  return (
    <div>
      <h2>App Viewer</h2>

      <div>
        <label>Name</label>
        <input value={name} readOnly style={{ backgroundColor: "#f5f5f5" }} />
      </div>

      <div>
        <label>Description</label>
        <textarea value={description} readOnly style={{ backgroundColor: "#f5f5f5", width: "100%" }} />
      </div>

      <div>
        <label>Search Engines</label>
        <ul style={{ marginLeft: "1rem" }}>
          {search_engines.map((engine, index) => (
            <li key={index}>
              <code>{engine.type}</code>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <label>Router</label>
        <input value={router.type} readOnly style={{ backgroundColor: "#f5f5f5" }} />
      </div>

      <div>
        <label>Reranker</label>
        <input value={reranker.type} readOnly style={{ backgroundColor: "#f5f5f5" }} />
        <ul style={{ marginLeft: "1rem" }}>
          {Object.entries(reranker).map(([key, val]) => {
            if (key === "type") return null;
            return (
              <li key={key}>
                <code>{key}</code>: {val.toString()}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
