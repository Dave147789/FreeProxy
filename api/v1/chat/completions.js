const TUNNEL_URL = "https://compact-routes-cleaner-ranch.trycloudflare.com";
const ALLOWED_MODELS = ["mimo-v2.5-free", "deepseek-v4-flash-free", "nemotron-3-ultra-free", "north-mini-code-free", "mythomax"];

const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Max-Age": "86400"
};

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "*");
    if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }

    if (req.method === "GET") {
        if (req.url === "/v1/models") {
            res.writeHead(200, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ object: "list", data: ALLOWED_MODELS.map(id => ({ id, object: "model", created: 1, owned_by: id === "mythomax" ? "chub" : "opencode" })) }));
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ status: "ok", tunnel: TUNNEL_URL, models: ALLOWED_MODELS }));
    }
    if (req.method !== "POST") { res.writeHead(405, { "Content-Type": "application/json" }); return res.end(JSON.stringify({ error: { message: "Method not allowed" } })); }

    let body;
    try {
        body = await new Promise((resolve) => {
            let data = "";
            req.on("data", c => data += c);
            req.on("end", () => resolve(data));
        });
    } catch { body = "{}"; }

    try {
        const upstreamRes = await fetch(TUNNEL_URL + req.url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body
        });

        res.writeHead(upstreamRes.status, {
            ...CORS,
            "Content-Type": upstreamRes.headers.get("Content-Type") || "application/json",
            "Cache-Control": "no-store"
        });

        const { Readable } = require("stream");
        Readable.fromWeb(upstreamRes.body).pipe(res);
    } catch (err) {
        res.writeHead(502, { ...CORS, "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: { message: "Tunnel unreachable: " + err.message } }));
    }
}
