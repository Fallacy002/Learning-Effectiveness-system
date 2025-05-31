const sqlite3 = require('sqlite3').verbose();
const DB_FILE = './main/learning.db';

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

function addRecord(req, res, body) {
    const { subject, study_time, study_period, date } = JSON.parse(body);
    const notes = ""; // default empty
    db.run(
        `INSERT INTO records (subject, study_time, study_period, date, notes) VALUES (?, ?, ?, ?, ?)`,
        [subject, study_time, study_period, date, notes],
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
    db.all(`SELECT id, subject, study_time, study_period, date, notes FROM records`, [], (err, rows) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'DB error' }));
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(rows));
        }
    });
}

// Add this function for deleting a record
function deleteRecord(req, res, id) {
    db.run(`DELETE FROM records WHERE id = ?`, [id], function(err) {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'DB error' }));
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
        }
    });
}

// Add this function for editing a record
function editRecord(req, res, id, body) {
    const { subject, study_time, study_period, notes } = JSON.parse(body);
    db.run(
        `UPDATE records SET subject = ?, study_time = ?, study_period = ?, notes = ? WHERE id = ?`,
        [subject, study_time, study_period, notes, id],
        function(err) {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'DB error' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            }
        }
    );
}

module.exports = { addRecord, getRecords, deleteRecord, editRecord };