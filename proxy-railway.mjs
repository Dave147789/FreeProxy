const http = require("http");
const TUNNEL_URL = "https://compact-routes-cleaner-ranch.trycloudflare.com";
const ALLOWED_MODELS = ["mimo-v2.5-free", "deepseek-v4-flash-free", "nemotron-3-ultra-free", "north-mini-code-free", "mythomax"];

const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Max-Age": "86400"
};

function json(res, status, data) {
    res.writeHead(status, { ...CORS, "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
    if (req.method === "OPTIONS") { res.writeHead(204, CORS); return res.end(); }
    if (req.method === "GET") return json(res, 200, { status: "ok", tunnel: TUNNEL_URL, models: ALLOWED_MODELS });
    if (req.method !== "POST") return json(res, 405, { error: { message: "Method not allowed" } });

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

        const reader = upstreamRes.body.getReader();
        const dec = new TextDecoder();
        let buf = "";
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += dec.decode(value, { stream: true });
            const lines = buf.split("\n");
            buf = lines.pop() || "";
            for (const line of lines) res.write(line + "\n");
        }
        if (buf) res.write(buf);
        res.end();
    } catch (err) {
        json(res, 502, { error: { message: "Tunnel unreachable: " + err.message } });
    }
});

server.listen(process.env.PORT || 3001, "0.0.0.0", () => console.log("Railway proxy on http://0.0.0.0:" + (process.env.PORT || 3001)));
