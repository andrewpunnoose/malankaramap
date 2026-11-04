#!/usr/bin/env python3
"""
Builds the password-protected Directory Studio page.

    pip install cryptography
    python3 build-studio.py "your password here" studio-xxxxxxxx.html

It reads studio-source.html (keep that file OFF the website), encrypts it with
AES-256-GCM (key from your password via PBKDF2-SHA256, 600,000 rounds) and writes a
lock-screen page that only shows the editor once the right password is typed.
Upload only the output file. The file name is the "secret address" - keep it unlisted.
"""
import base64, json, os, re, sys
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes

ITER = 600_000
here = os.path.dirname(os.path.abspath(__file__))

def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    pw, out = sys.argv[1], sys.argv[2]
    src = open(os.path.join(here, "studio-source.html"), encoding="utf-8").read()
    col = open(os.path.join(here, "diocol.json"), encoding="utf-8").read()
    src = src.replace("/*__DIO_COL__*/{}", col)
    salt, iv = os.urandom(16), os.urandom(12)
    key = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=ITER).derive(pw.encode("utf-8"))
    ct = AESGCM(key).encrypt(iv, src.encode("utf-8"), None)
    lock = open(os.path.join(here, "lock-template.html"), encoding="utf-8").read()
    payload = json.dumps({"s": base64.b64encode(salt).decode(), "i": base64.b64encode(iv).decode(), "n": ITER, "c": base64.b64encode(ct).decode()})
    lock = lock.replace("/*__PAYLOAD__*/null", payload)
    open(out, "w", encoding="utf-8").write(lock)
    print("wrote", out, len(lock), "bytes")

if __name__ == "__main__":
    main()
