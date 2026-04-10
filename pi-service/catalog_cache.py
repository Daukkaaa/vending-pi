import json
import os
from typing import Any

from config import CATALOG_PATH


def write_catalog(data: Any):
    os.makedirs(os.path.dirname(CATALOG_PATH), exist_ok=True)
    with open(CATALOG_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False)
