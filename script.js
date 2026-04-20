let myName = "", pBalance = 1000, myCards = [], gameId = "main_room";

const suits = [{s:'♥',c:'red',k:'h'}, {s:'♦',c:'red',k:'d'}, {s:'♣',c:'black',k:'c'}, {s:'♠',c:'black',k:'s'}];
const ranks = [{n:'6',v:6}, {n:'7',v:7}, {n:'8',v:8}, {n:'9',v:9}, {n:'10',v:10}, {n:'J',v:10}, {n:'Q',v:10}, {n:'K',v:10}, {n:'A',v:11}];

document.getElementById('join-btn').onclick = () => {
    myName = document.getElementById('username').value.trim();
    if (!myName) return alert("Введи ник!");
    document.getElementById('auth-screen').style.display = "none";
    initGame();
};

function initGame() {
    const status = document.getElementById('score-display');

    // ПРОВЕРКА СВЯЗИ
    db.ref(".info/connected").on("value", (snap) => {
        if (snap.val() === true) {
            status.innerText = "Связь установлена! Можно играть.";
        } else {
            status.innerText = "Поиск сервера...";
        }
    });

    // Слушаем базу
    db.ref(`games/${gameId}`).on('value', (snap) => {
        const data = snap.val() || {};
        document.getElementById('pot-display').innerText = `Банк: ${data.pot || 0} 🪙`;
        if (data.lastAction) status.innerText = data.lastAction;

        // Рисуем рубашки врагов
        const oppEl = document.getElementById('opponent-hand');
        oppEl.innerHTML = '';
        if (data.players) {
            Object.keys(data.players).forEach(p => {
                if (p !== myName && data.players[p].status === "playing") {
                    for(let i=0; i<3; i++) {
                        let c = document.createElement('div');
                        c.className = 'card';
                        c.style.background = 'linear-gradient(#2196f3, #1565c0)';
                        c.innerHTML = '<div style="color:white;font-size:10px;margin-top:40px">SEKA</div>';
                        oppEl.appendChild(c);
                    }
                }
            });
        }
        document.getElementById('show-btn').style.display = (data.status === "playing") ? "inline-block" : "none";
    });
}

document.getElementById('ante-btn').onclick = () => {
    pBalance -= 10;
    document.getElementById('player-balance').innerText = pBalance;
    myCards = [draw(), draw(), draw()];
    renderCards('player-hand', myCards);

    // Отправляем в онлайн
    db.ref(`games/${gameId}/players/${myName}`).set({ status: "playing", cards: myCards });
    db.ref(`games/${gameId}`).update({
        pot: firebase.database.ServerValue.increment(10),
        status: "playing",
        lastAction: `${myName} сделал ставку!`
    });
    document.getElementById('ante-btn').style.display = "none";
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
