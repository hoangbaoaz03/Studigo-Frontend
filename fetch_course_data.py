
import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/courses/courses/"

searches = [
    "Machine Learning",
    "Deep Learning",
    "Business Strategy"
]

print("--- Data Fetching Results ---")
for term in searches:
    try:
        response = requests.get(f"{BASE_URL}?search={term}")
        if response.status_code == 200:
            data = response.json()
            if data['count'] > 0:
                first_result = data['results'][0]
                print(f"Term: {term}")
                print(f"Slug: {first_result.get('slug')}")
                print(f"Image: {first_result.get('thumbnail')}")
                print("-" * 20)
            else:
                print(f"Term: {term} - No results found")
        else:
             print(f"Term: {term} - Error {response.status_code}")
    except Exception as e:
        print(f"Error fetching {term}: {e}")
