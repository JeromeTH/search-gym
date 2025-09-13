import json
import pandas as pd
import argparse
import hashlib
from src.utils.hashing import row_to_uid
def xlsx_to_jsonl(xlsx_path: str, jsonl_path: str, sheet_name: str = 0):
    df = pd.read_excel(xlsx_path, sheet_name=sheet_name)
    df.columns = df.columns.str.replace(r"\s+", "", regex=True)
    df = df.where(pd.notnull(df), None)

    with open(jsonl_path, 'w', encoding='utf-8') as f:
        for record in df.to_dict(orient='records'):
            clean_record = {k: v for k, v in record.items() if v is not None}
            clean_record["uid"] = row_to_uid(clean_record, length=10)
            json_line = json.dumps(clean_record, ensure_ascii=False)
            f.write(json_line + '\n')

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert .xlsx file to newline-delimited JSON.")
    parser.add_argument("xlsx_path", help="Path to the input .xlsx file")
    parser.add_argument("jsonl_path", help="Path to the output .jsonl file")
    parser.add_argument("--sheet", default=0, help="Sheet name or index (default: 0)")
    args = parser.parse_args()
    xlsx_to_jsonl(args.xlsx_path, args.jsonl_path, sheet_name=args.sheet)
