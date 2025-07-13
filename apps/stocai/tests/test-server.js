const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>StocAI - Testing</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #1a1a1a; color: white; }
        h1 { color: #00d4ff; }
      </style>
    </head>
    <body>
      <h1>StocAI - AI Stock Trading Platform</h1>
      <p>Basic server is working on port 4053!</p>
      <p>This confirms the port is available and working.</p>
    </body>
    </html>
  `);
});

server.listen(4053, () => {
  console.log('StocAI test server running on http://localhost:4053');
});
