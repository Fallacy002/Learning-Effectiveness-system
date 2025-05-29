const http = require('http');
const fs = require('fs');
const path = require('path');
const mainApi = require('./main/main-server.js');

const PORT = 3000;
const USERS_FILE = './users.json';
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

function readUsers() {
    if (!fs.existsSync(USERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}

function writeUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

http.createServer((req, res) => {
    if (req.url === '/api/register' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { username, password } = JSON.parse(body);
            let users = readUsers();
            if (users.some(u => u.username === username)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'User exists' }));
            } else {
                users.push({ username, password });
                writeUsers(users);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            }
        });
        return;
    }
    if (req.url === '/api/login' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { username, password } = JSON.parse(body);
            let users = readUsers();
            if (users.some(u => u.username === username && u.password === password)) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } else {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid credentials' }));
            }
        });
        return;
    }

    // Static file serving
    let filePath = '.' + req.url.split('?')[0];
    if (filePath === './' || filePath === './index.html' || filePath === './login.html') filePath = './login.html';
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}).listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});

if (req.url === '/api/add-record' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => mainApi.addRecord(req, res, body));
    return;
}
if (req.url === '/api/records' && req.method === 'GET') {
    mainApi.getRecords(res);
    return;
}