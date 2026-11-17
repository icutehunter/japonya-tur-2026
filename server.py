import json
import os
import sqlite3
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_DIR = "/data"
os.makedirs(DB_DIR, exist_ok=True)
DB_PATH = os.path.join(DB_DIR, "japan_trip.db")


def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("CREATE TABLE IF NOT EXISTS state (id INTEGER PRIMARY KEY, data TEXT)")
    conn.commit()
    conn.close()


init_db()


@app.get("/")
def serve_index():
    return FileResponse("index.html")


@app.get("/api/state")
def get_state():
    conn = sqlite3.connect(DB_PATH)
    row = conn.execute("SELECT data FROM state WHERE id = 1").fetchone()
    conn.close()
    if row and row[0]:
        return JSONResponse(content=json.loads(row[0]))
    return JSONResponse(content={})


@app.post("/api/state")
async def save_state(request: Request):
    payload = await request.json()
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "INSERT OR REPLACE INTO state (id, data) VALUES (1, ?)",
        (json.dumps(payload),),
    )
    conn.commit()
    conn.close()
    return {"status": "ok"}
