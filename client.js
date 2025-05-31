// Registration
document.getElementById("register-form")?.addEventListener("submit", async function(e) {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const errorMsg = document.getElementById("register-error-msg");

    if (password !== confirmPassword) {
        errorMsg.textContent = "⚠ 密碼與確認密碼不一致！";
        return;
    }
    if (!username || !password) {
        errorMsg.textContent = "⚠ 請填寫所有欄位！";
        return;
    }

    try {
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
            alert("✅ 註冊成功！");
            window.location.href = "login.html";
        } else {
            errorMsg.textContent = "⚠ " + (data.error || "註冊失敗！");
        }
    } catch (err) {
        errorMsg.textContent = "⚠ 伺服器錯誤，請稍後再試！";
    }
});

// Login
document.getElementById("login-form")?.addEventListener("submit", async function(e) {
    e.preventDefault();
    const username = e.target.querySelector('input[type="text"]').value.trim();
    const password = e.target.querySelector('input[type="password"]').value;
    const errorMsg = document.getElementById("login-error-msg");

    if (!username || !password) {
        errorMsg.textContent = "⚠ 請填寫所有欄位！";
        return;
    }

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
            window.location.href = "main/main.html";
        } else {
            errorMsg.textContent = "⚠ " + (data.error || "登入失敗！");
        }
    } catch (err) {
        errorMsg.textContent = "⚠ 伺服器錯誤，請稍後再試！";
    }
});