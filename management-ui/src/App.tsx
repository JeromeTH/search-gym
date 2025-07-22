import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/basic/Layout";

import Apps from "./pages/AppPage";
import DatasetPage from "./pages/DatasetPage";
import VectorSetPage from "./pages/VectorSetPage";

import DatasetForm from "./components/creation/DatasetForm";
import VectorSetForm from "./components/creation/VectorSetForm";
import AppForm from "./components/creation/AppForm";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Top-level pages */}
          <Route path="/" element={<Apps />} />
          <Route path="/apps" element={<Apps />} />
          <Route path="/datasets" element={<DatasetPage />} />
          <Route path="/vector-sets" element={<VectorSetPage />} />

          {/* Form pages */}
          <Route path="/datasets/new" element={<DatasetForm onSubmit={(config) => console.log("New Dataset", config)} />} />
          <Route path="/vector-sets/new" element={<VectorSetForm onSubmit={(config) => console.log("New VectorSet", config)} />} />
          <Route path="/apps/new" element={<AppForm onSubmit={(config) => console.log("New App", config)} />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
