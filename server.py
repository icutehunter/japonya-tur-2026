import base64
import io
import json
import os
import secrets
import sqlite3
import time
from typing import List

import httpx
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_DIR = "/data"
AVATAR_DIR = os.path.join(DB_DIR, "avatars")
os.makedirs(AVATAR_DIR, exist_ok=True)
DB_PATH = os.path.join(DB_DIR, "japan_trip.db")

app.mount("/avatars", StaticFiles(directory=AVATAR_DIR), name="avatars")
if os.path.exists("dist/assets"):
    app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")


def get_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_conn()
    conn.execute("CREATE TABLE IF NOT EXISTS state (id INTEGER PRIMARY KEY, data TEXT)")
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            name_lower TEXT NOT NULL UNIQUE,
            device_token TEXT NOT NULL UNIQUE,
            avatar_url TEXT,
            created_at REAL
        )
        """
    )
    conn.commit()
    conn.close()


init_db()


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        dead = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                dead.append(connection)
        for d in dead:
            self.disconnect(d)


manager = ConnectionManager()


def get_users_public():
    conn = get_conn()
    rows = conn.execute(
        "SELECT id, name, avatar_url, created_at FROM users ORDER BY id ASC"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def save_avatar_base64(base64_str: str, token_prefix: str) -> str:
    if not base64_str or "," not in base64_str:
        return ""
    try:
        _, encoded = base64_str.split(",", 1)
        raw_bytes = base64.b64decode(encoded)
        img = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
        w, h = img.size
        side = min(w, h)
        left = (w - side) // 2
        top = (h - side) // 2
        img = img.crop((left, top, left + side, top + side))
        img = img.resize((256, 256), Image.Resampling.LANCZOS)

        filename = f"avatar_{token_prefix}_{int(time.time())}.jpg"
        filepath = os.path.join(AVATAR_DIR, filename)
        img.save(filepath, format="JPEG", quality=85)
        return f"/avatars/{filename}"
    except Exception:
        return ""


@app.get("/")
def serve_index():
    if os.path.exists("dist/index.html"):
        return FileResponse("dist/index.html")
    return FileResponse("index.html")


@app.get("/api/rate")
async def get_live_rate():
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            r = await client.get("https://open.er-api.com/v6/latest/JPY")
            if r.status_code == 200:
                data = r.json()
                try_rate = data.get("rates", {}).get("TRY")
                if try_rate:
                    return {"rate": round(float(try_rate), 4), "live": True}
    except Exception:
        pass
    return {"rate": 0.316, "live": False}


@app.get("/api/state")
def get_state():
    conn = get_conn()
    row = conn.execute("SELECT data FROM state WHERE id = 1").fetchone()
    conn.close()
    state_obj = json.loads(row["data"]) if (row and row["data"]) else {}
    state_obj["users"] = get_users_public()
    return JSONResponse(content=state_obj)


@app.post("/api/state")
async def save_state(request: Request):
    payload = await request.json()
    payload.pop("users", None)
    conn = get_conn()
    conn.execute(
        "INSERT OR REPLACE INTO state (id, data) VALUES (1, ?)",
        (json.dumps(payload),),
    )
    conn.commit()
    conn.close()

    payload["users"] = get_users_public()
    await manager.broadcast({"type": "state_update", "state": payload})
    return {"status": "ok"}


@app.post("/api/auth/verify")
async def verify_device(request: Request):
    body = await request.json()
    token = (body.get("device_token") or "").strip()
    if not token:
        return {"authenticated": False, "users": get_users_public()}

    conn = get_conn()
    user = conn.execute(
        "SELECT id, name, avatar_url, device_token FROM users WHERE device_token = ?",
        (token,),
    ).fetchone()
    conn.close()

    if user:
        return {
            "authenticated": True,
            "user": dict(user),
            "users": get_users_public(),
        }
    return {"authenticated": False, "users": get_users_public()}


@app.post("/api/auth/register_or_login")
async def register_or_login(request: Request):
    body = await request.json()
    raw_name = (body.get("name") or "").strip()
    device_token = (body.get("device_token") or "").strip()
    avatar_b64 = body.get("avatar_base64") or ""

    if not raw_name:
        return JSONResponse(
            status_code=400,
            content={"error": "Lütfen adınızı ve soyadınızı girin."},
        )

    name_lower = raw_name.lower()
    conn = get_conn()

    if device_token:
        by_device = conn.execute(
            "SELECT id, name, avatar_url, device_token FROM users WHERE device_token = ?",
            (device_token,),
        ).fetchone()
        if by_device:
            conn.close()
            return {
                "status": "ok",
                "user": dict(by_device),
                "users": get_users_public(),
            }

    by_name = conn.execute(
        "SELECT id, name, device_token FROM users WHERE name_lower = ?",
        (name_lower,),
    ).fetchone()

    if by_name:
        conn.close()
        return JSONResponse(
            status_code=403,
            content={
                "error": f"⛔ '{by_name['name']}' ismi başka bir cihaza kilitlenmiştir! Başka bir cihazdan aynı isimle giriş yapılamaz."
            },
        )

    count = conn.execute("SELECT COUNT(*) as c FROM users").fetchone()["c"]
    if count >= 4:
        conn.close()
        return JSONResponse(
            status_code=403,
            content={
                "error": "⛔ Kontenjan dolu! 4 yolcunun tamamı cihazlarıyla kayıt olduğu için yeni giriş kilitlenmiştir."
            },
        )

    new_token = device_token or secrets.token_hex(24)
    avatar_url = save_avatar_base64(avatar_b64, new_token[:8])

    conn.execute(
        "INSERT INTO users (name, name_lower, device_token, avatar_url, created_at) VALUES (?, ?, ?, ?, ?)",
        (raw_name, name_lower, new_token, avatar_url, time.time()),
    )
    conn.commit()
    created = conn.execute(
        "SELECT id, name, avatar_url, device_token FROM users WHERE device_token = ?",
        (new_token,),
    ).fetchone()
    conn.close()

    users_list = get_users_public()
    await manager.broadcast({"type": "users_update", "users": users_list})
    return {"status": "ok", "user": dict(created), "users": users_list}


@app.post("/api/user/avatar")
async def update_user_avatar(request: Request):
    body = await request.json()
    token = (body.get("device_token") or "").strip()
    avatar_b64 = body.get("avatar_base64") or ""

    conn = get_conn()
    user = conn.execute(
        "SELECT id, name, avatar_url, device_token FROM users WHERE device_token = ?",
        (token,),
    ).fetchone()
    if not user:
        conn.close()
        return JSONResponse(status_code=403, content={"error": "Yetkisiz cihaz."})

    new_url = save_avatar_base64(avatar_b64, token[:8])
    if new_url:
        conn.execute(
            "UPDATE users SET avatar_url = ? WHERE device_token = ?",
            (new_url, token),
        )
        conn.commit()

    updated = conn.execute(
        "SELECT id, name, avatar_url, device_token FROM users WHERE device_token = ?",
        (token,),
    ).fetchone()
    conn.close()

    users_list = get_users_public()
    await manager.broadcast({"type": "users_update", "users": users_list})
    return {"status": "ok", "user": dict(updated), "users": users_list}


@app.post("/api/admin/remove_user")
async def admin_remove_user(request: Request):
    body = await request.json()
    user_id = body.get("user_id")
    pin = (body.get("admin_pin") or "").strip()

    conn = get_conn()
    row = conn.execute("SELECT data FROM state WHERE id = 1").fetchone()
    current_pin = "2026"
    if row and row["data"]:
        current_pin = json.loads(row["data"]).get("adminPin", "2026")

    if pin != current_pin:
        conn.close()
        return JSONResponse(status_code=403, content={"error": "Hatalı Admin PIN"})

    conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()

    users_list = get_users_public()
    await manager.broadcast({"type": "users_update", "users": users_list})
    return {"status": "ok", "users": users_list}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
