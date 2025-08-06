# SearchGym: A Configurable Design Space Engine for Hybrid RAG systemss


## 🧭 Key Features

- Modular hybrid search engine (Milvus + Elastic + Reranking)
- Real-time monitoring and feedback collection via Weave
- UI-based app and benchmark creation
- Evaluation pipeline connecting queries to feedback datasets

See DESIGN.md for architecture walkthrough. 

## 🚀 Getting Started

Make sure you have **Python 3.12.9** and **Node.js ≥ 18** installed.

---

### 1. 📦 Set Up Python Backend Environment

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
````


### 2. 🛠️ Elasticsearch Setup (Secured, Local Only)

```bash
# Step 1: Download
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-9.0.2-linux-x86_64.tar.gz

# Step 2: Extract
tar -xzf elasticsearch-9.0.2-linux-x86_64.tar.gz
mv elasticsearch-9.0.2 elasticsearch

# Step 3: Start
cd elasticsearch
bin/elasticsearch

# Elasticsearch will print a password and start on https://localhost:9200
```

---

### 3. 🧪 Start the Backend API

From the **project root**, run:

```bash
uvicorn src.run.api:api --host 0.0.0.0 --port 8001 --reload
```

Backend will be live at:
→ `http://localhost:8001`

---

### 4. 🖼️ Start the Frontend UI

```bash
cd management-ui/
npm install
npm run dev
```

Frontend will be live at:
→ `http://localhost:5173`


## License

CORVAX is released under the **GNU Affero General Public License v3.0 (AGPLv3)**.

This ensures:
- You may freely use, modify, and distribute CORVAX
- If you **host** a modified version (e.g. as a service), you must also release your modifications

For commercial use where code release is not possible, a [commercial license](./COMMERCIAL_LICENSE.md) is available.

📧 Contact: jeromehsu.dev@gmail.com
[![License: AGPL v3](https://img.shields.io/badge/license-AGPLv3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
