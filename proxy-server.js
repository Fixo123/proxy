// proxy-server.js - RENDER VERSION (FIXED)
const http = require('http');
const https = require('https');
const url = require('url');

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, User-Agent, Accept');

    // OPTIONS request (CORS preflight)
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // ============================================
    // ✅ HEALTH CHECK - /health
    // ============================================
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            timestamp: new Date().toISOString(),
            message: 'Proxy server is running on Render!'
        }));
        return;
    }

    // ============================================
    // ✅ PROXY ENDPOINT - /proxy
    // ============================================
    // මෙය /proxy?url=https://example.com විදියට වැඩ කරයි
    if (req.url.startsWith('/proxy')) {
        const parsedUrl = url.parse(req.url, true);
        const target = parsedUrl.query.url;

        if (!target) {
            res.writeHead(400);
            res.end(JSON.stringify({
                error: 'Missing url parameter',
                usage: '/proxy?url=https://example.com'
            }));
            return;
        }

        console.log(`📥 [${new Date().toLocaleTimeString()}] Proxying: ${target}`);

        const client = target.startsWith('https') ? https : http;
        const startTime = Date.now();

        client.get(target, (response) => {
            const timeTaken = Date.now() - startTime;
            console.log(`✅ ${response.statusCode} - ${timeTaken}ms`);
            res.writeHead(response.statusCode, response.headers);
            response.pipe(res);
        }).on('error', (err) => {
            console.log(`❌ Error: ${err.message}`);
            res.writeHead(500);
            res.end(JSON.stringify({
                error: 'Proxy error',
                message: err.message
            }));
        });
        return;
    }

    // ============================================
    // ✅ ROOT ENDPOINT - /
    // ============================================
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head><title>✅ Proxy Server Running</title></head>
            <body style="font-family: Arial; text-align: center; padding: 50px; background: #0a0a0a; color: #fff;">
                <h1 style="color: #00ff88;">✅ Proxy Server is Running!</h1>
                <p>🌐 Render Proxy Server</p>
                <p>📌 Use: <code>/proxy?url=https://example.com</code></p>
                <p>💚 Health: <code>/health</code></p>
            </body>
            </html>
        `);
        return;
    }

    // ============================================
    // ❌ 404 - Not Found
    // ============================================
    res.writeHead(404);
    res.end(JSON.stringify({
        error: 'Not Found',
        available_endpoints: ['/', '/health', '/proxy?url=https://example.com']
    }));
});

server.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('✅ PROXY SERVER RUNNING ON RENDER!');
    console.log('='.repeat(50));
    console.log(`📌 Port: ${PORT}`);
    console.log(`🔄 Proxy: /proxy?url=https://example.com`);
    console.log(`💚 Health: /health`);
    console.log('='.repeat(50));
    console.log('⚠️  මෙය අධ්‍යාපනික අරමුණු සඳහා පමණයි!');
    console.log('='.repeat(50));
});
