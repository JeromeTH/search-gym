import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/basic/Layout";

import Apps from "./pages/AppPage";
import DatasetPage from "./pages/DatasetPage";
import VectorSetPage from "./pages/VectorSetPage";

import DatasetForm from "./components/creation/DatasetForm";
import VectorSetForm from "./components/creation/VectorSetForm";
import AppForm from "./components/creation/AppForm";

import {createObject} from "./lib/api";
import { useNavigateAfter } from "./lib/navigation";

function AppRoutes() {
  return (
    <Routes>
      {/* Top-level pages */}
      <Route path="/" element={<Apps />} />
      <Route path="/apps" element={<Apps />} />
      <Route path="/datasets" element={<DatasetPage />} />
      <Route path="/vector-sets" element={<VectorSetPage />} />

      {/* Form pages */}
      <Route path="/datasets/new" element={
        <DatasetForm onSubmit={
          useNavigateAfter((config) => createObject("dataset", config), "/datasets")
        }/>
        } 
      />
      <Route path="/vector-sets/new" element={
        <VectorSetForm onSubmit={
          useNavigateAfter((config) => createObject("vector_set", config), "/vector-sets")
        }/>
        } 
      />
      <Route path="/apps/new" element={
        <AppForm onSubmit={
          useNavigateAfter((config) => createObject("app", config), "/apps")
        }/>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <AppRoutes />
      </Layout>
    </BrowserRouter>
  );
}