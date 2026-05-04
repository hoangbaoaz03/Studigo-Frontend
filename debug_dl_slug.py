
import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/courses/courses/"

term = "Deep Learning"
print(f"Searching for: {term}")
try:
    response = requests.get(f"{BASE_URL}?search={term}")
    if response.status_code == 200:
        data = response.json()
        for i, result in enumerate(data['results'][:5]):
            print(f"Result {i+1}:")
            print(f"  Title: {result.get('title')}")
            print(f"  Slug: {result.get('slug')}")
    else:
         print(f"Error {response.status_code}")
except Exception as e:
    print(f"Error fetching {term}: {e}")
