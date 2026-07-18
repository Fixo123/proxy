// proxy-server.js - ROOT PROXY VERSION
const http = require('http');
const https = require('https');
const url = require('url');

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, User-Agent, Accept');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Health check
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            timestamp: new Date().toISOString(),
            message: 'Root Proxy is running!'
        }));
        return;
    }

    // ⭐ ROOT PROXY - /?url=https://example.com
    const parsedUrl = url.parse(req.url, true);
    const target = parsedUrl.query.url;

    if (target) {
        console.log(`📥 Proxying: ${target}`);

        const client = target.startsWith('https') ? https : http;
        client.get(target, (response) => {
            res.writeHead(response.statusCode, response.headers);
            response.pipe(res);
        }).on('error', (err) => {
            res.writeHead(500);
            res.end(JSON.stringify({ error: err.message }));
        });
        return;
    }

    // Root page
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`<h1>✅ Root Proxy Running</h1><p>Use: /?url=https://example.com</p>`);
        return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(PORT, () => {
    console.log(`✅ Root Proxy running on port ${PORT}`);
});
