import os
from base64 import b64encode, b64decode

SECRET_PEPPER = "SuperSecretPepper123!" 
AES_KEY = os.urandom(32) 
