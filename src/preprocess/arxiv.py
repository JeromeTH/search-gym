import pandas as pd
import ast
import json
from src.utils.hashing import row_to_uid
df = pd.read_csv('_data/arxiv_data.csv')
with open("_data/arxiv.jsonl", "w") as f:
    for index, row in df.iterrows(): 
        json_dict = json.loads(row.to_json())
        json_dict['terms'] = ast.literal_eval(json_dict['terms'])
        json_dict = {k: v if isinstance(v, list) else [v] for k, v in json_dict.items()}
        json_dict["id"] = [row_to_uid(json_dict)]
        f.write(json.dumps(json_dict) + "\n")