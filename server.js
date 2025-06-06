const http = require('http'); // 載入 Node.js 的 http 模組，用來建立 HTTP 伺服器
const fs = require('fs'); // 載入檔案系統模組，用來讀寫檔案
const path = require('path'); // 載入路徑模組，用來處理檔案路徑
const sqlite3 = require('sqlite3').verbose(); // 載入 SQLite3 模組，用來操作 SQLite 資料庫

const PORT = 3000; // 設定伺服器監聽的埠號為 3000
const USERS_FILE = './users.json'; // 使用者資料儲存的檔案名稱
const DB_FILE = './learning.db';
const mimeTypes = { // 定義不同副檔名對應的 MIME 類型
    '.html': 'text/html', // HTML 檔案
    '.css': 'text/css', // CSS 檔案
    '.js': 'application/javascript', // JavaScript 檔案
    '.json': 'application/json', // JSON 檔案
    '.png': 'image/png' // PNG 圖片
};

// 使用者資料相關
function readUsers() { // 讀取使用者資料的函式
    if (!fs.existsSync(USERS_FILE)) return []; // 如果檔案不存在，回傳空陣列
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); // 讀取並解析 JSON 檔案內容
}

function writeUsers(users) { // 寫入使用者資料的函式
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2)); // 將資料轉成 JSON 字串並寫入檔案
}

// --- SQLite 資料庫初始化與 CRUD ---
const db = new sqlite3.Database(DB_FILE, (err) => {
    if (err) console.error(err);
    db.run(`CREATE TABLE IF NOT EXISTS records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject TEXT,
        study_time REAL,
        date TEXT,
        study_period TEXT,
        notes TEXT
    )`);
});

// 新增紀錄
function addRecord(req, res, body) {
    const { subject, study_time, study_period, date } = JSON.parse(body); // 解析請求主體
    const notes = "";
    db.run(
        `INSERT INTO records (subject, study_time, study_period, date, notes) VALUES (?, ?, ?, ?, ?)`,
        [subject, study_time, study_period, date, notes],
        function(err) {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'DB error' })); // 如果有錯誤，回傳 500 錯誤
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ id: this.lastID })); // 回傳新增紀錄的 ID
            }
        }
    );
}

// 取得所有紀錄
function getRecords(res) {
    const sql = `SELECT id, subject, study_time, study_period, date, notes FROM records`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('SQL Error:', sql, err); // 印出 SQL 語句與錯誤
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'DB error' }));
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(rows));
        }
    });
}

// 刪除紀錄
function deleteRecord(req, res, id) {
    db.run(`DELETE FROM records WHERE id = ?`, [id], function(err) {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'DB error' })); // 如果有錯誤，回傳 500 錯誤
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true })); // 回傳成功訊息
        }
    });
}

// 編輯紀錄
function editRecord(req, res, id, body) {
    const { subject, study_time, study_period, notes } = JSON.parse(body); // 解析請求主體
    db.run(
        `UPDATE records SET subject = ?, study_time = ?, study_period = ?, notes = ? WHERE id = ?`,
        [subject, study_time, study_period, notes, id],
        function(err) {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'DB error' })); // 如果有錯誤，回傳 500 錯誤
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true })); // 回傳成功訊息
            }
        }
    );
}

// --- HTTP 伺服器 ---
http.createServer((req, res) => { // 建立 HTTP 伺服器，處理所有請求
    // 註冊 API
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
    // 登入 API
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
    // 新增紀錄 API
    if (req.url === '/api/add-record' && req.method === 'POST') { // 處理新增紀錄 API 請求
        let body = '';
        req.on('data', chunk => body += chunk); // 監聽資料傳入事件
        req.on('end', () => addRecord(req, res, body)); // 呼叫新增紀錄函式
        return;
    }
    // 取得所有紀錄 API
    if (req.url === '/api/records' && req.method === 'GET') { // 處理取得所有紀錄 API 請求
        getRecords(res); // 呼叫取得所有紀錄函式
        return;
    }
    // 刪除紀錄 API
    if (req.url.startsWith('/api/delete-record/') && req.method === 'DELETE') { // 處理刪除紀錄 API 請求
        const id = req.url.split('/').pop(); // 取得紀錄 id
        deleteRecord(req, res, id); // 呼叫刪除紀錄函式
        return;
    }
    // 編輯紀錄 API
    if (req.url.startsWith('/api/edit-record/') && req.method === 'PUT') { // 處理編輯紀錄 API 請求
        const id = req.url.split('/').pop(); // 取得紀錄 id
        let body = '';
        req.on('data', chunk => body += chunk); // 監聽資料傳入事件
        req.on('end', () => editRecord(req, res, id, body)); // 呼叫編輯紀錄函式
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