async function loadRecords() {
    const res = await fetch('/api/records');
    const records = await res.json();
    const recordsDiv = document.getElementById('learning-records');
    if (!recordsDiv) return;
    let html = `<table><thead><tr><th>日期</th><th>科目</th><th>學習時間 (小時)</th></tr></thead><tbody>`;
    records.forEach(r => {
        html += `<tr><td>${r.date}</td><td>${r.subject}</td><td>${r.study_time}</td></tr>`;
    });
    html += `</tbody></table>`;
    recordsDiv.innerHTML = html;
}

document.getElementById("add-subject-form")?.addEventListener("submit", async function(e) {
    e.preventDefault();
    const subject = document.getElementById("subject-name").value.trim();
    const study_time = document.getElementById("study-time").value.trim();
    const date = new Date().toISOString().slice(0,10);
    if (!subject || !study_time) return;
    await fetch('/api/add-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, study_time, date })
    });
    this.reset();
    loadRecords();
});

window.addEventListener('DOMContentLoaded', loadRecords);