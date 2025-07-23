# CORVAX

> **C**onfigurable **O**rchestrated **R**etrieval with **VA**riables and e**X**ecutors

CORVAX is the canonical, fully modular RAG system authored by **Jerome Tze-Hou Hsu** and originally developed during his research at National Central University. It is now released under a dual-license model for research use and commercial deployment.

**Repo History:**  
This code was forked from an earlier internal prototype at NCU, but the full design, architecture, and implementation are original intellectual property of Jerome Hsu.  
All further development and licensing of CORVAX occur under this repository.

## 📦 Submodules

- `src/` – Core search system (vector stores, rerankers, managers, routers)
- `frontend/` – TypeScript-based UI for creating, monitoring, and evaluating app versions and benchmarks
- `backend/` – API server bridging frontend with Weights & Biases (Weave) for logging and feedback
- `monitoring/` – Evaluation scripts, benchmark runners, metric logging

## 🧭 Key Features

- Modular hybrid search engine (Milvus + Elastic + Reranking)
- Real-time monitoring and feedback collection via Weave
- UI-based app and benchmark creation
- Evaluation pipeline connecting queries to feedback datasets

## 🚀 Getting Started
...

## License

CORVAX is released under the **GNU Affero General Public License v3.0 (AGPLv3)**.

This ensures:
- You may freely use, modify, and distribute CORVAX
- If you **host** a modified version (e.g. as a service), you must also release your modifications

For commercial use where code release is not possible, a [commercial license](./COMMERCIAL_LICENSE.md) is available.

📧 Contact: jeromehsu.dev@gmail.com
[![License: AGPL v3](https://img.shields.io/badge/license-AGPLv3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
