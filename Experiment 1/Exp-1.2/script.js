let balance = 1000;

function deposit() {
    let amount = Number(document.getElementById("amount").value);
    let message = document.getElementById("message");

    if (amount <= 0) {
        message.textContent = "Invalid amount!";
        message.style.color = "red";
        return;
    }

    balance += amount;
    document.getElementById("balance").textContent = balance;
    message.textContent = "Deposit successful!";
    message.style.color = "green";
}

function withdraw() {
    let amount = Number(document.getElementById("amount").value);
    let message = document.getElementById("message");

    if (amount <= 0 || amount > balance) {
        message.textContent = "Invalid amount!";
        message.style.color = "red";
        return;
    }

    balance -= amount;
    document.getElementById("balance").textContent = balance;
    message.textContent = "Withdrawal successful!";
    message.style.color = "green";
}
