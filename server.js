const http = require('http'); // 載入 Node.js 的 http 模組，用來建立 HTTP 伺服器
const fs = require('fs'); // 載入檔案系統模組，用來讀寫檔案
const path = require('path'); // 載入路徑模組，用來處理檔案路徑
const mainApi = require('./main/main-server.js'); // 載入自訂的主功能 API 模組

const PORT = 3000; // 設定伺服器監聽的埠號為 3000
const USERS_FILE = './users.json'; // 使用者資料儲存的檔案名稱
const mimeTypes = { // 定義不同副檔名對應的 MIME 類型
    '.html': 'text/html', // HTML 檔案
    '.css': 'text/css', // CSS 檔案
    '.js': 'application/javascript', // JavaScript 檔案
    '.json': 'application/json', // JSON 檔案
    '.png': 'image/png' // PNG 圖片
};

function readUsers() { // 讀取使用者資料的函式
    if (!fs.existsSync(USERS_FILE)) return []; // 如果檔案不存在，回傳空陣列
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); // 讀取並解析 JSON 檔案內容
}

function writeUsers(users) { // 寫入使用者資料的函式
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2)); // 將資料轉成 JSON 字串並寫入檔案
}

http.createServer((req, res) => { // 建立 HTTP 伺服器，處理所有請求
    if (req.url === '/api/register' && req.method === 'POST') { // 處理註冊 API 請求
        let body = ''; // 用來儲存請求內容
        req.on('data', chunk => body += chunk); // 監聽資料傳入事件，累加資料
        req.on('end', () => { // 當資料接收完畢
            const { username, password } = JSON.parse(body); // 解析 JSON，取得帳號密碼
            let users = readUsers(); // 讀取現有使用者
            if (users.some(u => u.username === username)) { // 檢查帳號是否已存在
                res.writeHead(400, { 'Content-Type': 'application/json' }); // 回傳 400 錯誤
                res.end(JSON.stringify({ error: 'User exists' })); // 回傳錯誤訊息
            } else {
                users.push({ username, password }); // 新增新使用者
                writeUsers(users); // 寫入檔案
                res.writeHead(200, { 'Content-Type': 'application/json' }); // 回傳 200 成功
                res.end(JSON.stringify({ success: true })); // 回傳成功訊息
            }
        });
        return; // 結束處理
    }
    if (req.url === '/api/login' && req.method === 'POST') { // 處理登入 API 請求
        let body = '';
        req.on('data', chunk => body += chunk); // 監聽資料傳入事件
        req.on('end', () => { // 當資料接收完畢
            const { username, password } = JSON.parse(body); // 解析帳號密碼
            let users = readUsers(); // 讀取使用者資料
            if (users.some(u => u.username === username && u.password === password)) { // 檢查帳號密碼是否正確
                res.writeHead(200, { 'Content-Type': 'application/json' }); // 回傳 200
                res.end(JSON.stringify({ success: true })); // 回傳成功訊息
            } else {
                res.writeHead(401, { 'Content-Type': 'application/json' }); // 回傳 401 未授權
                res.end(JSON.stringify({ error: 'Invalid credentials' })); // 回傳錯誤訊息
            }
        });
        return;
    }
    // --- Move these two API routes INSIDE the server handler ---
    if (req.url === '/api/add-record' && req.method === 'POST') { // 新增紀錄 API
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => mainApi.addRecord(req, res, body)); // 呼叫主 API 的 addRecord 方法
        return;
    }
    if (req.url === '/api/records' && req.method === 'GET') { // 取得所有紀錄 API
        mainApi.getRecords(res); // 呼叫主 API 的 getRecords 方法
        return;
    }
    if (req.url.startsWith('/api/delete-record/') && req.method === 'DELETE') { // 刪除紀錄 API
        const id = req.url.split('/').pop(); // 取得紀錄 id
        mainApi.deleteRecord(req, res, id); // 呼叫主 API 的 deleteRecord 方法
        return;
    }
    if (req.url.startsWith('/api/edit-record/') && req.method === 'PUT') { // 編輯紀錄 API
        const id = req.url.split('/').pop(); // 取得紀錄 id
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => mainApi.editRecord(req, res, id, body)); // 呼叫主 API 的 editRecord 方法
        return;
    }
    // 靜態檔案服務
    let filePath = '.' + req.url.split('?')[0]; // 取得請求的檔案路徑
    if (filePath === './' || filePath === './index.html' || filePath === './login.html') filePath = './login.html'; // 預設導向登入頁
    const extname = String(path.extname(filePath)).toLowerCase(); // 取得副檔名
    const contentType = mimeTypes[extname] || 'application/octet-stream'; // 取得對應的 MIME 類型
    fs.readFile(filePath, (error, content) => { // 讀取檔案內容
        if (error) {
            if (error.code === 'ENOENT') { // 檔案不存在
                res.writeHead(404, { 'Content-Type': 'text/plain' }); // 回傳 404
                res.end('404 Not Found', 'utf-8'); // 回傳錯誤訊息
            } else {
                res.writeHead(500); // 伺服器錯誤
                res.end('Server Error: ' + error.code); // 回傳錯誤訊息
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType }); // 回傳 200 和正確的內容型態
            res.end(content, 'utf-8'); // 回傳檔案內容
        }
    });
}).listen(PORT, () => { // 伺服器開始監聽指定埠號
    console.log(`Server running at http://localhost:${PORT}/`); // 在終端機顯示伺服器啟動訊息
});