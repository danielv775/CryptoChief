'''
Set up Django to run Script
----------------------------------------------------------------------
'''
import os, sys
import django
sys.path.insert(0, '/home/ubuntu/workspace/finalproject/')
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "cryptochief.settings")
django.setup()
'''
----------------------------------------------------------------------
'''
'''
Source of cryptocurrencies.json
https://raw.githubusercontent.com/crypti/cryptocurrencies/master/cryptocurrencies.json
'''

from portfolio.models import Crypto
import json
from pprint import pprint

def main():
  with open('cryptocurrencies.json') as f:
    data = json.load(f)

  '''
  Get the upper bound ticker length
  max_len = max([ len(code) for code, name in data.items() ])
  print(max_len)
  '''
  crypto_object_list = [ Crypto(name=name, code=code) for code, name in data.items() ]
  Crypto.objects.bulk_create(crypto_object_list)

if __name__ == '__main__':
    main()