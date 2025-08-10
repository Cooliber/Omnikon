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
    # Placeholder for real Raynet API integration
    # RAYNET_API_KEY = os.getenv("RAYNET_API_KEY")
    # RAYNET_API_URL = os.getenv("RAYNET_API_URL")
    # Example: async with httpx.AsyncClient(timeout=10.0) as client: ...
    return {"items": [], "query": req.q}

