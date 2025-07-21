# scripts/preprocess_litsearch.py

from datasets import load_dataset
import json
import os
from typing import Dict, List, Any

def extract_span(text: str, annotations: Dict[str, str], key: str) -> str:
    try:
        spans = json.loads(annotations.get(key, "[]"))
        if spans:
            span = spans[0]
            return text[span["start"]:span["end"]]
    except Exception:
        pass
    return ""

def extract_span_list(text: str, annotations: Dict[str, str], key: str) -> List[str]:
    try:
        spans = json.loads(annotations.get(key, "[]"))
        return [text[span["start"]:span["end"]] for span in spans]
    except Exception:
        return []

def preprocess_litsearch(output_path: str, limit: int = -1):
    dataset = load_dataset("princeton-nlp/LitSearch", "corpus_s2orc", split="full")

    with open(output_path, 'w', encoding='utf-8') as f_out:
        for i, entry in enumerate(dataset):
            if 0 < limit <= i:
                break

            content = entry.get("content", {})
            annotations = content.get("annotations", {})
            text = content.get("text", "")

            processed = {
                "id": [str(entry.get("corpusid", i))],
                "corpusid": [str(entry.get("corpusid", i))],
                "year": [str(content.get("year"))] if content.get("year") else [],
                "venue": [content.get("venue")] if content.get("venue") else [],
                "authors": extract_span_list(text, annotations, "author"),
                "doi": [entry.get("externalids", {}).get("doi")] if entry.get("externalids", {}).get("doi") else [],
                "arxiv": [entry.get("externalids", {}).get("arxiv")] if entry.get("externalids", {}).get("arxiv") else [],
                "dblp": [entry.get("externalids", {}).get("dblp")] if entry.get("externalids", {}).get("dblp") else [],
                "pdfurl": [entry.get("source", {}).get("pdfurls", [None])[0]] if entry.get("source", {}).get("pdfurls") else [],
                "abstract": [extract_span(text, annotations, "abstract")],
                "title": [extract_span(text, annotations, "title")],
            }

            json.dump(processed, f_out, ensure_ascii=False)
            f_out.write("\n")

# Usage example
# preprocess_litsearch("data/litsearch/processed/litsearch.jsonl", limit=100000)
