let myName = "", pBalance = 1000, myCards = [], gameId = "global_table";

const suits = [{s:'♥',c:'red',k:'h'}, {s:'♦',c:'red',k:'d'}, {s:'♣',c:'black',k:'c'}, {s:'♠',c:'black',k:'s'}];
const ranks = [{n:'6',v:6}, {n:'7',v:7}, {n:'8',v:8}, {n:'9',v:9}, {n:'10',v:10}, {n:'J',v:10}, {n:'Q',v:10}, {n:'K',v:10}, {n:'A',v:11}];

// Вход в игру
document.getElementById('join-btn').onclick = () => {
    myName = document.getElementById('username').value.trim();
    if (!myName) return alert("Введите имя!");
    document.getElementById('auth-screen').style.display = "none";
    initOnline();
};

function initOnline() {
    // 1. Слушаем состояние игры
    db.ref(`games/${gameId}`).on('value', (snap) => {
        const data = snap.val() || {};
        document.getElementById('pot-display').innerText = `Банк: ${data.pot || 0} 🪙`;
        document.getElementById('score-display').innerText = data.lastAction || "Ждем ставок...";

        // 2. Рисуем карты противников (рубашки)
        const oppEl = document.getElementById('opponent-hand');
        oppEl.innerHTML = '';
        if (data.players) {
            Object.keys(data.players).forEach(p => {
                if (p !== myName && data.players[p].status === "playing") {
                    for(let i=0; i<3; i++) {
                        let c = document.createElement('div');
                        c.className = 'card';
                        c.style.background = 'linear-gradient(#2196f3, #1565c0)';
                        c.innerHTML = '<div style="color:white;font-size:11px">SEKA</div>';
                        oppEl.appendChild(c);
                    }
                }
            });
        }

        // 3. Управление кнопками
        document.getElementById('show-btn').style.display = (data.status === "playing") ? "inline-block" : "none";
        document.getElementById('reset-btn').style.display = (data.status === "finished") ? "inline-block" : "none";
    });
}

// Ставка "Вход"
document.getElementById('ante-btn').onclick = () => {
    if (pBalance < 10) return alert("Мало монет!");
    pBalance -= 10;
    document.getElementById('player-balance').innerText = pBalance;

    myCards = [draw(), draw(), draw()];
    renderCards('player-hand', myCards);

    // Отправляем данные в онлайн
    db.ref(`games/${gameId}/players/${myName}`).set({ status: "playing", cards: myCards });
    db.ref(`games/${gameId}`).update({
        pot: firebase.database.ServerValue.increment(10),
        status: "playing",
        lastAction: `${myName} сделал ставку!`
    });
    document.getElementById('ante-btn').style.display = "none";
};

// Кнопка вскрытия
document.getElementById('show-btn').onclick = () => {
    db.ref(`games/${gameId}`).update({
        status: "finished",
        lastAction: `${myName} вскрыл карты!`
    });
};

// Очистка стола
document.getElementById('reset-btn').onclick = () => {
    db.ref(`games/${gameId}`).set({ pot: 0, status: "waiting", lastAction: "Новая раздача" });
    document.getElementById('player-hand').innerHTML = '';
    document.getElementById('ante-btn').style.display = "inline-block";
};

function draw() { return {...suits[Math.floor(Math.random()*4)], ...ranks[Math.floor(Math.random()*9)]}; }

function renderCards(id, hand) {
    const el = document.getElementById(id); el.innerHTML = '';
    hand.forEach(c => {
        const d = document.createElement('div');
        d.className = `card ${c.c}`;
        d.innerHTML = `<span>${c.n}</span><span>${c.s}</span>`;
        el.appendChild(d);
    });
}
