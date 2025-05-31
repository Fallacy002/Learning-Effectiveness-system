async function loadRecords() { // 非同步函式，用來載入所有紀錄
    const res = await fetch('/api/records'); // 從後端 API 取得所有紀錄
    const records = await res.json(); // 將回傳資料轉為 JSON
    const tbody = document.getElementById('records-tbody'); // 取得表格 tbody 元素
    if (!tbody) return; // 如果找不到 tbody 就結束
    tbody.innerHTML = ''; // 清空原本的內容
    records.forEach(r => { // 對每一筆紀錄做處理
        const tr = document.createElement('tr'); // 建立一個新的表格列
        tr.innerHTML = `
            <td>${r.date}</td> // 顯示日期
            <td>${r.subject}</td> // 顯示科目
            <td>${r.study_time}</td> // 顯示學習時數
            <td>${r.study_period || ''}</td> // 顯示學習時段（可選）
            <td>${r.notes || ''}</td> // 顯示備註（可選）
            <td>
                <button class="edit-btn" data-id="${r.id}">編輯</button> // 編輯按鈕
                <button class="delete-btn" data-id="${r.id}">刪除</button> // 刪除按鈕
            </td>
        `;
        tbody.appendChild(tr); // 將這一列加到表格中
    });

    // 為每個刪除按鈕加上事件監聽
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.onclick = async function() { // 當點擊刪除
            if (confirm('確定要刪除這筆紀錄嗎？')) { // 彈出確認視窗
                await fetch(`/api/delete-record/${btn.dataset.id}`, { method: 'DELETE' }); // 發送刪除請求
                loadRecords(); // 重新載入紀錄
            }
        };
    });

    // 為每個編輯按鈕加上事件監聽
    tbody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.onclick = function() { // 當點擊編輯
            const row = btn.closest('tr'); // 找到這一列
            const cells = row.querySelectorAll('td'); // 取得所有儲存格
            // 將儲存格內容換成輸入框
            cells[1].innerHTML = `<input value="${cells[1].textContent}" />`;
            cells[2].innerHTML = `<input value="${cells[2].textContent}" />`;
            cells[3].innerHTML = `<input value="${cells[3].textContent}" />`;
            cells[4].innerHTML = `<input value="${cells[4].textContent}" />`; // 備註
            btn.textContent = '儲存'; // 按鈕文字改成儲存
            btn.onclick = async function() { // 點擊儲存時
                const subject = cells[1].querySelector('input').value; // 取得科目
                const study_time = cells[2].querySelector('input').value; // 取得時數
                const study_period = cells[3].querySelector('input').value; // 取得時段
                const notes = cells[4].querySelector('input').value; // 取得備註
                await fetch(`/api/edit-record/${btn.dataset.id}`, {
                    method: 'PUT', // 使用 PUT 方法
                    headers: { 'Content-Type': 'application/json' }, // 設定內容型態
                    body: JSON.stringify({ subject, study_time, study_period, notes }) // 傳送資料
                });
                loadRecords(); // 重新載入紀錄
            };
        };
    });
}

document.getElementById("add-subject-form")?.addEventListener("submit", async function(e) {
    e.preventDefault(); // 阻止表單預設提交行為
    const subject = document.getElementById("subject-name").value.trim(); // 取得科目名稱
    const study_time = document.getElementById("study-time").value.trim(); // 取得學習時數
    const study_period = document.getElementById("study-period").value.trim(); // 取得學習時段
    const date = new Date().toISOString().slice(0,10); // 取得今天日期（YYYY-MM-DD）
    if (!subject || !study_time || !study_period) return; // 有欄位沒填就不送出
    await fetch('/api/add-record', {
        method: 'POST', // 使用 POST 方法
        headers: { 'Content-Type': 'application/json' }, // 設定內容型態
        body: JSON.stringify({ subject, study_time, study_period, date }) // 傳送資料
    });
    this.reset(); // 清空表單
    loadRecords(); // 重新載入紀錄
    fetchRecordsForDownload(); // 重新整理下載選單（如果有這個功能）
});

window.addEventListener('DOMContentLoaded', loadRecords); // 畫面載入完成時自動載入紀錄