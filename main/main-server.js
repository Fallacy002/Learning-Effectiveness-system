const sqlite3 = require('sqlite3').verbose();
const DB_FILE = './main/learning.db';

const db = new sqlite3.Database(DB_FILE, (err) => {
    if (err) console.error(err);
    db.run(`CREATE TABLE IF NOT EXISTS records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject TEXT,
        study_time REAL,
        date TEXT
    )`);
});

function addRecord(req, res, body) {
    const { subject, study_time, date } = JSON.parse(body);
    db.run(
        `INSERT INTO records (subject, study_time, date) VALUES (?, ?, ?)`,
        [subject, study_time, date],
        function(err) {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'DB error' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ id: this.lastID }));
            }
        }
    );
}

function getRecords(res) {
    db.all(`SELECT * FROM records ORDER BY date DESC`, [], (err, rows) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'DB error' }));
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(rows));
        }
    });
}

module.exports = { addRecord, getRecords };