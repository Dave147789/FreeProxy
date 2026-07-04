const TUNNEL_URL = "https://compact-routes-cleaner-ranch.trycloudflare.com";
const ALLOWED_MODELS = ["mimo-v2.5-free", "deepseek-v4-flash-free", "nemotron-3-ultra-free", "north-mini-code-free", "mythomax"];

const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Max-Age": "86400"
};

const MODELS = {
    object: "list",
    data: ALLOWED_MODELS.map(id => ({ id, object: "model", created: 1, owned_by: id === "mythomax" ? "chub" : "opencode" }))
};

export default {
    async fetch(request) {
        if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

        const url = new URL(request.url);

        if (url.pathname === "/v1/models" && request.method === "GET") {
            return new Response(JSON.stringify(MODELS), { status: 200, headers: { ...CORS, "Content-Type": "application/json" } });
        }
        if (url.pathname === "/" || url.pathname === "") {
            return new Response(JSON.stringify({ status: "ok", tunnel: TUNNEL_URL, models: ALLOWED_MODELS }), { status: 200, headers: { ...CORS, "Content-Type": "application/json" } });
        }
        if (request.method !== "POST") {
            return new Response(JSON.stringify({ error: { message: "Method not allowed" } }), { status: 405, headers: { ...CORS, "Content-Type": "application/json" } });
        }

        try {
            const body = await request.text();
            const upstreamRes = await fetch(TUNNEL_URL + url.pathname, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body
            });

            const respHeaders = { ...CORS };
            const ct = upstreamRes.headers.get("Content-Type");
            if (ct) respHeaders["Content-Type"] = ct;

            return new Response(upstreamRes.body, { status: upstreamRes.status, headers: respHeaders });
        } catch (err) {
            return new Response(JSON.stringify({ error: { message: "Tunnel unreachable: " + err.message } }), {
                status: 502, headers: { ...CORS, "Content-Type": "application/json" }
            });
        }
    }
};
