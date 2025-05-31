// Registration 註冊功能
document.getElementById("register-form")?.addEventListener("submit", async function(e) {
    // 阻止表單預設提交行為（避免頁面重新整理）
    e.preventDefault();
    // 取得使用者輸入的帳號並去除前後空白
    const username = document.getElementById("username").value.trim();
    // 取得使用者輸入的密碼
    const password = document.getElementById("password").value;
    // 取得使用者輸入的確認密碼
    const confirmPassword = document.getElementById("confirm-password").value;
    // 取得顯示錯誤訊息的元素
    const errorMsg = document.getElementById("register-error-msg");

    // 檢查密碼與確認密碼是否一致
    if (password !== confirmPassword) {
        errorMsg.textContent = "⚠ 密碼與確認密碼不一致！";
        return; // 若不一致則顯示錯誤訊息並結束
    }
    // 檢查帳號或密碼是否為空
    if (!username || !password) {
        errorMsg.textContent = "⚠ 請填寫所有欄位！";
        return; // 若有欄位為空則顯示錯誤訊息並結束
    }

    try {
        // 發送註冊請求到後端 API
        const res = await fetch('/api/register', {
            method: 'POST', // 使用 POST 方法
            headers: { 'Content-Type': 'application/json' }, // 設定請求內容型態為 JSON
            body: JSON.stringify({ username, password }) // 將帳號密碼轉為 JSON 字串
        });
        // 解析回傳的 JSON 資料
        const data = await res.json();
        if (res.ok) {
            // 註冊成功，顯示提示並導向登入頁
            alert("✅ 註冊成功！");
            window.location.href = "login.html";
        } else {
            // 註冊失敗，顯示後端回傳的錯誤訊息或預設訊息
            errorMsg.textContent = "⚠ " + (data.error || "註冊失敗！");
        }
    } catch (err) {
        // 伺服器錯誤，顯示通用錯誤訊息
        errorMsg.textContent = "⚠ 伺服器錯誤，請稍後再試！";
    }
});

// Login 登入功能
document.getElementById("login-form")?.addEventListener("submit", async function(e) {
    // 阻止表單預設提交行為
    e.preventDefault();
    // 取得帳號（第一個文字輸入框的值並去除空白）
    const username = e.target.querySelector('input[type="text"]').value.trim();
    // 取得密碼（第一個密碼輸入框的值）
    const password = e.target.querySelector('input[type="password"]').value;
    // 取得顯示錯誤訊息的元素
    const errorMsg = document.getElementById("login-error-msg");

    // 檢查帳號或密碼是否為空
    if (!username || !password) {
        errorMsg.textContent = "⚠ 請填寫所有欄位！";
        return; // 若有欄位為空則顯示錯誤訊息並結束
    }

    try {
        // 發送登入請求到後端 API
        const res = await fetch('/api/login', {
            method: 'POST', // 使用 POST 方法
            headers: { 'Content-Type': 'application/json' }, // 設定請求內容型態為 JSON
            body: JSON.stringify({ username, password }) // 將帳號密碼轉為 JSON 字串
        });
        // 解析回傳的 JSON 資料
        const data = await res.json();
        if (res.ok) {
            // 登入成功，導向主頁
            window.location.href = "main/main.html";
        } else {
            // 登入失敗，顯示後端回傳的錯誤訊息或預設訊息
            errorMsg.textContent = "⚠ " + (data.error || "登入失敗！");
        }
    } catch (err) {
        // 伺服器錯誤，顯示通用錯誤訊息
        errorMsg.textContent = "⚠ 伺服器錯誤，請稍後再試！";
    }
});