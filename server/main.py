from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()

# 允许跨域 (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 模拟数据
class Channel(BaseModel):
    id: int
    name: str

@app.get("/api/channels", response_model=dict)
async def get_channels():
    channels = [
        {"id": 1, "name": "Python News"},
        {"id": 2, "name": "FastAPI Tips"},
        {"id": 3, "name": "React & Redux"}
    ]
    return {"data": {"channels": channels}}

@app.get("/")
async def root():
    return {"message": "Hello from Python Backend"}
