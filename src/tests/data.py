import unittest
from src.core.dataset import Dataset
from src.core.document import Document
from src.const.dataset import NCL
from tqdm import tqdm

if __name__ == "__main__":
    dataset = Dataset.from_config(NCL)
    for i, doc, in tqdm(enumerate(dataset.stream())):
        if i > 1000: break
