import os
from base64 import b64encode, b64decode 
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad

def encrypt(data: str, key: bytes) -> str:
    """Шифрует данные с помощью AES-256"""
    cipher = AES.new(key, AES.MODE_CBC)
    ct_bytes = cipher.encrypt(pad(data.encode(), AES.block_size))
    return b64encode(cipher.iv + ct_bytes).decode()

def decrypt(data: str, key: bytes) -> str:
    """Расшифровывает данные с помощью AES-256"""
    raw = b64decode(data)
    iv, ct = raw[:16], raw[16:]
    cipher = AES.new(key, AES.MODE_CBC, iv)
    return unpad(cipher.decrypt(ct), AES.block_size).decode()
