const http = require('http');
const comments = [];

const stats = {};

const server = http.createServer((req, res) => {
  const ua = req.headers['user-agent'] || 'Unknown';
  stats[ua] = (stats[ua] || 0) + 1;

  console.log(`Получен запрос: ${req.method} ${req.url}`);

  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Приветствие с сервера!');
  } else if (req.url === '/comments' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (data.text) {
          comments.push({ text: data.text });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(comments));
        } else {
          res.writeHead(400);
          res.end('Bad Request: No "text" field');
        }
      } catch (e) {
        res.writeHead(400);
        res.end('Bad Request: Invalid JSON');
      }
    });
  } else if (req.url === '/stats' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('<h1>Статистика запросов</h1><table border="1"><tr><th>User-Agent</th><th>Количество</th></tr>');
    for (const [agent, count] of Object.entries(stats)) {
      res.write(`<tr><td>${agent}</td><td>${count}</td></tr>`);
    }
    res.end('</table>');
  } else {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Bad Request');
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
