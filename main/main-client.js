async function loadRecords() {
    const res = await fetch('/api/records');
    const records = await res.json();
    const tbody = document.getElementById('records-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    records.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${r.date}</td>
            <td>${r.subject}</td>
            <td>${r.study_time}</td>
            <td>${r.study_period || ''}</td>
            <td>${r.notes || ''}</td>
            <td>
                <button class="edit-btn" data-id="${r.id}">編輯</button>
                <button class="delete-btn" data-id="${r.id}">刪除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Add event listeners for delete
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.onclick = async function() {
            if (confirm('確定要刪除這筆紀錄嗎？')) {
                await fetch(`/api/delete-record/${btn.dataset.id}`, { method: 'DELETE' });
                loadRecords();
            }
        };
    });

    // Add event listeners for edit
    tbody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.onclick = function() {
            const row = btn.closest('tr');
            const cells = row.querySelectorAll('td');
            // Replace cells with input fields
            cells[1].innerHTML = `<input value="${cells[1].textContent}" />`;
            cells[2].innerHTML = `<input value="${cells[2].textContent}" />`;
            cells[3].innerHTML = `<input value="${cells[3].textContent}" />`;
            cells[4].innerHTML = `<input value="${cells[4].textContent}" />`; // notes
            btn.textContent = '儲存';
            btn.onclick = async function() {
                const subject = cells[1].querySelector('input').value;
                const study_time = cells[2].querySelector('input').value;
                const study_period = cells[3].querySelector('input').value;
                const notes = cells[4].querySelector('input').value;
                await fetch(`/api/edit-record/${btn.dataset.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ subject, study_time, study_period, notes })
                });
                loadRecords();
            };
        };
    });
}

document.getElementById("add-subject-form")?.addEventListener("submit", async function(e) {
    e.preventDefault();
    const subject = document.getElementById("subject-name").value.trim();
    const study_time = document.getElementById("study-time").value.trim();
    const study_period = document.getElementById("study-period").value.trim();
    const date = new Date().toISOString().slice(0,10);
    if (!subject || !study_time || !study_period) return;
    await fetch('/api/add-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, study_time, study_period, date })
    });
    this.reset();
    loadRecords(); // your existing function to refresh the table
    fetchRecordsForDownload(); // <-- add this line to refresh the selector
});

window.addEventListener('DOMContentLoaded', loadRecords);