const sqlite3 = require('sqlite3').verbose(); // 載入 sqlite3 模組，並啟用詳細模式
const DB_FILE = './main/learning.db'; // 資料庫檔案路徑

const db = new sqlite3.Database(DB_FILE, (err) => { // 建立資料庫連線
    if (err) console.error(err); // 如果有錯誤就印出錯誤訊息
    db.run(`CREATE TABLE IF NOT EXISTS records (
        id INTEGER PRIMARY KEY AUTOINCREMENT, // 自動遞增的主鍵
        subject TEXT, // 科目
        study_time REAL, // 學習時數
        date TEXT, // 日期
        study_period TEXT, // 學習時段
        notes TEXT // 備註
    )`); // 如果沒有 records 資料表就建立一個
});

function addRecord(req, res, body) { // 新增紀錄的函式
    const { subject, study_time, study_period, date } = JSON.parse(body); // 從請求內容解析出資料
    const notes = ""; // 預設備註為空字串
    db.run(
        `INSERT INTO records (subject, study_time, study_period, date, notes) VALUES (?, ?, ?, ?, ?)`, // 新增一筆紀錄
        [subject, study_time, study_period, date, notes], // 對應的值
        function(err) { // 執行完畢後的回呼函式
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' }); // 發生錯誤，回傳 500
                res.end(JSON.stringify({ error: 'DB error' })); // 回傳錯誤訊息
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' }); // 新增成功，回傳 200
                res.end(JSON.stringify({ id: this.lastID })); // 回傳新紀錄的 id
            }
        }
    );
}

function getRecords(res) { // 取得所有紀錄的函式
    db.all(`SELECT id, subject, study_time, study_period, date, notes FROM records`, [], (err, rows) => { // 查詢所有紀錄
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' }); // 發生錯誤，回傳 500
            res.end(JSON.stringify({ error: 'DB error' })); // 回傳錯誤訊息
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json' }); // 查詢成功，回傳 200
            res.end(JSON.stringify(rows)); // 回傳所有紀錄
        }
    });
}

// 刪除紀錄的函式
function deleteRecord(req, res, id) {
    db.run(`DELETE FROM records WHERE id = ?`, [id], function(err) { // 根據 id 刪除紀錄
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' }); // 發生錯誤，回傳 500
            res.end(JSON.stringify({ error: 'DB error' })); // 回傳錯誤訊息
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json' }); // 刪除成功，回傳 200
            res.end(JSON.stringify({ success: true })); // 回傳成功訊息
        }
    });
}

// 編輯紀錄的函式
function editRecord(req, res, id, body) {
    const { subject, study_time, study_period, notes } = JSON.parse(body); // 從請求內容解析出資料
    db.run(
        `UPDATE records SET subject = ?, study_time = ?, study_period = ?, notes = ? WHERE id = ?`, // 更新紀錄
        [subject, study_time, study_period, notes, id], // 對應的值
        function(err) {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' }); // 發生錯誤，回傳 500
                res.end(JSON.stringify({ error: 'DB error' })); // 回傳錯誤訊息
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' }); // 更新成功，回傳 200
                res.end(JSON.stringify({ success: true })); // 回傳成功訊息
            }
        }
    );
}

module.exports = { addRecord, getRecords, deleteRecord, editRecord }; // 匯出這些函式給其他檔案使用