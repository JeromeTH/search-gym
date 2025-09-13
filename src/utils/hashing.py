import hashlib
import json 

BASE62_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

def base62_encode(num: int) -> str:
    if num == 0:
        return BASE62_ALPHABET[0]
    encoded = []
    while num > 0:
        num, rem = divmod(num, 62)
        encoded.append(BASE62_ALPHABET[rem])
    return ''.join(reversed(encoded))

def row_to_uid(row: dict, length: int = 10) -> str:
    row_str = json.dumps(row, sort_keys=True)  # ensure consistent order
    row_hash = hashlib.sha1(row_str.encode()).hexdigest()  # SHA-1 = 160 bits
    row_int = int(row_hash, 16)
    base62 = base62_encode(row_int)
    return base62[:length]  # trim to 10 chars (customizable)