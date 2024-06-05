const http = require('http');
const url = require('url');

const port = 3000;

// Create a server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { pathname, query } = parsedUrl;

  // Middleware to enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Middleware to parse JSON bodies
  if (req.method === 'GET' || req.headers['content-type'] === 'application/json') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      if (req.method !== 'GET') {
        try {
          req.body = JSON.parse(body);
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Invalid JSON body' }));
        }
      }

      // Route handling
      if (req.method === 'GET') {
        if (pathname.startsWith('/user/')) {
          const id = pathname.split('/').pop();
          res.end(`User ID: ${id}`);
        } else if (pathname === '/search') {
          const { q } = query;
          if (!q) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: "Missing query parameter 'q'" }));
          } else {
            res.end(`Search query: ${q}`);
          }
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404: Page Not Found');
        }
      } else if (req.method === 'POST') {
        if (pathname === '/data') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ receivedData: req.body }));
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404: Page Not Found');
        }
      } else {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('405: Method Not Allowed');
      }
    });
  } else {
    res.writeHead(415, { 'Content-Type': 'text/plain' });
    res.end('415: Unsupported Media Type');
  }
});

// Start the server
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
