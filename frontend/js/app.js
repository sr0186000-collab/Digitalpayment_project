const API = "http://localhost:5000";

function signup() {

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const msgEl = document.getElementById("signupMsg");

    msgEl.style.display = "none";
    msgEl.innerText = "";

    if (!name || !email || !password || !phone) {
        msgEl.innerText = "All fields are required";
        msgEl.style.display = "block";
        return;
    }

    fetch(API + "/register", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ name, email, password, phone})
    })
    .then(res => res.json())
    .then(data => {

        if (data.error) {
            msgEl.innerText = data.error;
            msgEl.style.display = "block";
            return;
        }

        msgEl.style.color = "#34d399";  // green
        msgEl.innerText = "Account created successfully 🎉";
        msgEl.style.display = "block";

        setTimeout(() => {
            window.location = "index.html";
        }, 1500);
    })
    .catch(() => {
        msgEl.innerText = "Server error";
        msgEl.style.display = "block";
    });
}

function validatePhone() {
    let input = document.getElementById("phone");

    // Remove non-numeric characters
    let value = input.value.replace(/\D/g, '');

    // Limit to 10 digits
    value = value.slice(0, 10);

    input.value = value;
}

function login() {

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value.trim();
    const errorEl = document.getElementById("errorMsg");

    errorEl.style.display = "none";
    errorEl.innerText = "";

    if (!email && !password) {
        errorEl.innerText = "Please enter email and password";
        errorEl.style.display = "block";
        return;
    }

    if (!email) {
        errorEl.innerText = "Please enter email";
        errorEl.style.display = "block";
        return;
    }

    if (!password) {
        errorEl.innerText = "Please enter password";
        errorEl.style.display = "block";
        return;
    }

    fetch(API + "/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {

        if (data.error) {
            errorEl.innerText = data.error;
            errorEl.style.display = "block";
            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location = "dashboard.html";
    })
    .catch(() => {
        errorEl.innerText = "Server error";
        errorEl.style.display = "block";
    });
}

function logout() {
    localStorage.clear();
    window.location = "index.html";
}

function goTo(page) {
    window.location = page;
}

if (window.location.pathname.includes("dashboard.html")) {

    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (user) {
        document.getElementById("username").innerText = user.name;
        document.getElementById("welcome").innerText = "Welcome back, " + user.name;
        document.getElementById("avatar").innerText = user.name.charAt(0).toUpperCase();
    }

    fetch(API + "/user", {
        headers: { "authorization": token }
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("balance").innerText = "₹ " + (data.balance || 0);
        localStorage.setItem("user", JSON.stringify(data));
    });

    fetch(API + "/transactions", {
        headers: { "authorization": token }
    })
    .then(res => res.json())
    .then(data => {

        let sent = 0;
        let received = 0;

        data.forEach(tx => {
            if (tx.sender_id === user.id) {
                sent += Number(tx.amount);
            } else {
                received += Number(tx.amount);
            }
        });

        document.getElementById("sent").innerText = "₹ " + sent;
        document.getElementById("received").innerText = "₹ " + received;
        document.getElementById("txCount").innerText = data.length;
    });

fetch(API + "/transactions", {
    headers: { "authorization": token }
})
.then(res => res.json())
.then(data => {

    const recentList = document.getElementById("recentList");
    const recentEmpty = document.getElementById("recentEmpty");

    if (!recentList || !recentEmpty) return;

    if (data.length === 0) {
        recentEmpty.style.display = "block";
        return;
    }

    recentEmpty.style.display = "none";

    data.slice(0, 3).forEach(tx => {

        const isSent = tx.sender_id === user.id;

        const card = document.createElement("div");
        card.classList.add("tx-card");

        card.innerHTML = `
            <div>
                <p>
                    ${isSent ? "Sent to: " + tx.receiver_email : "Received from: " + tx.sender_email}
                </p>
                <span class="tx-date">
                    ${new Date(tx.created_at).toLocaleString()}
                </span>
            </div>

            <div class="${isSent ? "sent" : "received"}">
                ${isSent ? "- ₹" : "+ ₹"} ${tx.amount}
            </div>
        `;

        recentList.appendChild(card);
    });

});
}

function sendMoney() {
    fetch(API + "/send-money", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "authorization": localStorage.getItem("token")
        },
        body: JSON.stringify({
            phone: document.getElementById("phone").value,
            amount: document.getElementById("amount").value,
            note: document.getElementById("note").value
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            alert(data.message);
            window.location = "dashboard.html";
        }
    })
    .catch(() => {
        alert("Server error");
    });
}

if (window.location.pathname.includes("send.html")) {

    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (user) {
        document.getElementById("username").innerText = user.name;
        document.getElementById("avatar").innerText = user.name.charAt(0).toUpperCase();
    }

    fetch(API + "/user", {
        headers: { "authorization": token }
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("balance").innerText = "Balance: ₹ " + (data.balance || 0);
        localStorage.setItem("user", JSON.stringify(data));
    });
}

if (window.location.pathname.includes("history.html")) {

    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (user) {
    const nameEl = document.getElementById("username");
    if (nameEl) nameEl.innerText = user.name;

    const avatar = document.getElementById("avatar");
    if (avatar) {
        avatar.innerText = user.name.charAt(0).toUpperCase();
    }
}

    const list = document.getElementById("historyList");
    const empty = document.getElementById("emptyState");
    const countText = document.getElementById("txCountText");

    fetch("http://localhost:5000/transactions", {
        headers: {
            "authorization": token
        }
    })
    .then(res => res.json())
    .then(data => {

        countText.innerText = data.length + " total transactions";

        if (data.length === 0) {
            empty.style.display = "block";
            return;
        }

        empty.style.display = "none";

        data.forEach(tx => {

            const isSent = tx.sender_id === user.id;

            const card = document.createElement("div");
            card.classList.add("tx-card");

            card.innerHTML = `
                <div class="tx-left">
                    <span class="tx-email">
                        ${isSent ? "Sent to: " + tx.receiver_email : "Received from: " + tx.sender_email}
                    </span>
                    <span class="tx-date">
                        ${new Date(tx.created_at).toLocaleString()}
                    </span>
                    <p style="color:#94a3b8;">Note: ${tx.note || "No note"}</p>
                </div>

                <div class="tx-amount ${isSent ? "sent" : "received"}">
                    ${isSent ? "- ₹" : "+ ₹"} ${tx.amount}
                </div>
            `;

            list.appendChild(card);
        });

    });
}

function toggleMenu() {
    document.getElementById("sidebar").classList.toggle("active");
}

document.addEventListener("click", function(e) {
    const sidebar = document.getElementById("sidebar");
    const toggle = document.querySelector(".menu-toggle");

    if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
        sidebar.classList.remove("active");
    }
});