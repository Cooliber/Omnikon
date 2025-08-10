from fastapi import FastAPI
from pydantic import BaseModel
import httpx
import os

app = FastAPI()

class SearchRequest(BaseModel):
    q: str

@app.get("/healthz")
async def healthz():
    return {"ok": True}

@app.post("/raynet/search")
async def raynet_search(req: SearchRequest):
    api_key = os.getenv("RAYNET_API_KEY")
    api_url = os.getenv("RAYNET_API_URL")
    instance = os.getenv("RAYNET_INSTANCE")

    if not all([api_key, api_url, instance]):
        return {"error": "Missing Raynet configuration", "items": [], "query": req.q}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Example Raynet API call - adjust based on actual API
            response = await client.get(
                f"{api_url}/v2/company/",
                headers={"X-Instance-Name": instance, "Authorization": f"Bearer {api_key}"},
                params={"fulltext": req.q, "limit": 10}
            )

            if response.status_code == 200:
                data = response.json()
                return {"items": data.get("data", []), "query": req.q}
            else:
                return {"error": f"Raynet API error: {response.status_code}", "items": [], "query": req.q}

    except Exception as e:
        return {"error": f"Raynet connection error: {str(e)}", "items": [], "query": req.q}

