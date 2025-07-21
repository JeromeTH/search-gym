from src.core.document import Document
from typing import List, Any, Optional
import hashlib


def deterministic_get_id(key: str) -> str:
    """
    Generate a short deterministic ID (SHA1-based) from any string input.
    Returns the first 10 characters of the SHA1 hex digest.
    """
    return hashlib.sha1(key.encode("utf-8")).hexdigest()[:10]

def get(lst: List[Any], index: int) -> Optional[Any]:
    """
    Get an element from a list by index, returning None if the index is out of bounds.
    
    Args:
        lst (List[Any]): The list to retrieve the element from.
        index (int): The index of the element to retrieve.
        
    Returns:
        Optional[Any]: The element at the specified index, or None if the index is out of bounds.
    """
    try:
        return lst[index]
    except IndexError:
        return None

def ensure(s: str, max_len: int) -> str:
    if len(s) > max_len: 
        raise ValueError(f"String exceeds maximum length of {max_len}: {s}")
    return s

def coalesce(*args):
    """
    Returns the first non-None argument from the provided arguments.
    
    Args:
        *args: A variable number of arguments to check.
        
    Returns:
        The first non-None argument, or None if all are None.
    """
    for arg in args:
        if callable(arg): result = arg()
        else: result = arg
        if result is not None:
            return result
    return None
    
def get_first_content(doc: Document) -> str:
        """
        Helper method to extract the first content from a Document.
        If the document has no content, returns an empty string.
        """
        if doc.channels():
            first_field = next(iter(doc.channels().values()))
            if first_field.contents:
                return first_field.contents[0]
            else: 
                #first field exists but is empty
                return ""
        return ""