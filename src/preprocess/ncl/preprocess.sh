#!/bin/bash

mkdir -p /home/share/data/ncl_json_processed

for year in {108..112}; do
    echo "Processing year $year..."
    python src/preprocess/ncl/preprocess.py \
        /home/share/data/ncl_json/${year}.jsonl \
        /home/share/data/ncl_json_processed/${year}.jsonl
done
