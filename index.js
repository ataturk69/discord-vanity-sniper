"use strict";
const tls = require("tls");
const WebSocket = require("ws");
const extractJson = require("extract-json-from-string");

const token = "";
const channelId = "";
const guildId = "";

const tlsSocket = tls.connect({ host: "canary.discord.com", port: 443 });
const ws = new WebSocket("wss://gateway-us-east1-b.discord.gg");

let vanity, guilds = {};

const send = (m, p, b) => tlsSocket.write(`${m} ${p} HTTP/1.1\r\nHost: canary.discord.com\r\nAuthorization: ${token}\r\nContent-Type: application/json\r\nContent-Length: ${Buffer.byteLength(b)}\r\n\r\n${b}`);

tlsSocket.on("data", d => {
    const json = extractJson(d.toString()).find(e => e.code || e.message);
    if (json) send("POST", `/api/channels/${channelId}/messages`, JSON.stringify({ content: `@everyone ${vanity}\n\`\`\`json\n${JSON.stringify(json)}\`\`\`` }));
});

ws.onmessage = ({ data }) => {
    const { d, op, t } = JSON.parse(data);
    if (t === "GUILD_UPDATE" || t === "GUILD_DELETE") {
        const code = guilds[d.guild_id || d.id];
        if (code) {
            send("PATCH", `/api/v7/guilds/${guildId}/vanity-url`, JSON.stringify({ code }));
            vanity = t === "GUILD_UPDATE" ? code : `${code} guild delete`;
        }
    } else if (t === "READY") guilds = d.guilds.reduce((a, { id, vanity_url_code }) => ({ ...a, [id]: vanity_url_code }), {});
    if (op === 10) {
        ws.send(JSON.stringify({ op: 2, d: { token, intents: 1, properties: { os: "zantexq", browser: "zante46", device: "" } } }));
        setInterval(() => ws.send(JSON.stringify({ op: 1, d: {}, s: null, t: "heartbeat" })), d.heartbeat_interval);
    } else if (op === 7) process.exit();
};

setInterval(() => send("GET", "/", ""), 600);
ws.onclose = process.exit;
