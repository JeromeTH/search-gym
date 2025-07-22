# scripts/preprocess_ncl.py

import os
import json
import argparse
from typing import Optional

def split_or_empty(val: Optional[str]) -> list[str]:
    return val.splitlines() if val else []

def preprocess_ncl_file(input_path: str, output_path: str):
    with open(input_path, 'r', encoding='utf-8') as f_in, open(output_path, 'w', encoding='utf-8') as f_out:
        for line in f_in:
            if not line.strip():
                continue
            raw = json.loads(line)

            processed = {
                "id": [raw["uid"]],
                "year": [str(raw.get("畢業學年度", ""))] if raw.get("畢業學年度") else [],
                "category": [raw.get("學位類別", "")] if raw.get("學位類別") else [],
                "link": [raw.get("博碩士論文網址", "")] if raw.get("博碩士論文網址") else [],
                "keywords": [],
                "school_chinese": [raw.get("學校名稱", "")] if raw.get("學校名稱") else [],
                "school_english": [raw.get("學校名稱(外文)", "")] if raw.get("學校名稱(外文)") else [],
                "dept_chinese": [raw.get("系所名稱", "")] if raw.get("系所名稱") else [],
                "dept_english": [raw.get("系所名稱(外文)", "")] if raw.get("系所名稱(外文)") else [],
                "authors_chinese": split_or_empty(raw.get("作者")),
                "authors_english": split_or_empty(raw.get("作者(外文)")),
                "advisors_chinese": split_or_empty(raw.get("指導教授")),
                "advisors_english": split_or_empty(raw.get("指導教授(外文)")),
                "abstract_chinese": [raw.get("摘要", "")] if raw.get("摘要") else [],
                "abstract_english": [raw.get("摘要(外文)", "")] if raw.get("摘要(外文)") else [],
                "title_chinese": [raw.get("論文名稱", "")] if raw.get("論文名稱") else [],
                "title_english": [raw.get("論文名稱(外文)", "")] if raw.get("論文名稱(外文)") else [],
            }

            json.dump(processed, f_out, ensure_ascii=False)
            f_out.write('\n')

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Preprocess NCL thesis metadata file")
    parser.add_argument("input_path", type=str, help="Path to input JSONL file")
    parser.add_argument("output_path", type=str, help="Path to output JSONL file")
    args = parser.parse_args()

    preprocess_ncl_file(args.input_path, args.output_path)
