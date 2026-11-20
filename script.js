
// --- ТЕМА: ПОЛЕ (ДЕНЬ) / ГАРАЖ (НОЧЬ) ---
function applySavedTheme() {
    const saved = localStorage.getItem('agroTheme');
    const isGarage = saved === 'garage';
    document.body.classList.toggle('garage-mode', isGarage);
    const btn = document.getElementById('themeToggleBtn');
    if (btn) btn.innerText = isGarage ? '☀️ Поле / День' : '🌙 Гараж / Ночь';
}

function toggleTheme() {
    const isGarage = !document.body.classList.contains('garage-mode');
    document.body.classList.toggle('garage-mode', isGarage);
    localStorage.setItem('agroTheme', isGarage ? 'garage' : 'field');
    const btn = document.getElementById('themeToggleBtn');
    if (btn) btn.innerText = isGarage ? '☀️ Поле / День' : '🌙 Гараж / Ночь';
}

// --- ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК ---
function openTab(tabId, btn) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    btn.classList.add('active');
}

// --- ПОИСК ---
function filterCrops() {
    const query = document.getElementById('searchCrop').value.toLowerCase();
    document.querySelectorAll('.crop-item').forEach(card => {
        card.style.display = card.innerText.toLowerCase().includes(query) ? 'block' : 'none';
    });
}

function filterTractors() {
    const query = document.getElementById('searchTractor').value.toLowerCase();
    document.querySelectorAll('.tractor-item').forEach(card => {
        card.style.display = card.innerText.toLowerCase().includes(query) ? 'block' : 'none';
    });
}

// --- КАЛЬКУЛЯТОР ПРИБЫЛИ + СТРЕСС-ТЕСТ ---
let stressYieldMult = 1;
let stressPriceMult = 1;
let stressCostMult = 1;
let stressLabel = 'Базовый сценарий';

function applyStress(mode) {
    if (mode === 'drought') {
        stressYieldMult = 0.75;
        stressPriceMult = 1;
        stressCostMult = 1;
        stressLabel = 'Засуха: урожай -25%';
    } else if (mode === 'priceDrop') {
        stressYieldMult = 1;
        stressPriceMult = 0.8;
        stressCostMult = 1;
        stressLabel = 'Просадка рынка: цена -20%';
    } else if (mode === 'hard') {
        stressYieldMult = 0.75;
        stressPriceMult = 0.85;
        stressCostMult = 1.2;
        stressLabel = 'Жёсткий шторм: урожай -25%, цена -15%, затраты +20%';
    } else {
        stressYieldMult = 1;
        stressPriceMult = 1;
        stressCostMult = 1;
        stressLabel = 'Базовый сценарий';
    }
    calculateProfit();
}

function calculateProfit() {
    const area = parseFloat(document.getElementById('area').value) || 0;
    const cost = (parseFloat(document.getElementById('cost').value) || 0) * stressCostMult;
    const yieldPerHa = (parseFloat(document.getElementById('yield').value) || 0) * stressYieldMult;
    const price = (parseFloat(document.getElementById('price').value) || 0) * stressPriceMult;

    const totalRevenue = area * yieldPerHa * price;
    const totalCost = area * cost;
    const profit = totalRevenue - totalCost;

    document.getElementById('profitResult').innerHTML =
        `[${stressLabel}]<br>Чистая прибыль: ${Math.round(profit).toLocaleString()} (Выручка: ${Math.round(totalRevenue).toLocaleString()})`;
}

// --- КАЛЬКУЛЯТОР СЕМЯН И ТОПЛИВА ---
function calculateResources() {
    const area = parseFloat(document.getElementById('seedArea').value) || 0;
    const rate = parseFloat(document.getElementById('seedRate').value) || 0;
    const reserve = parseFloat(document.getElementById('seedReserve').value) || 0;
    const fuel = parseFloat(document.getElementById('fuelRate').value) || 0;

    const totalSeeds = area * rate * (1 + reserve / 100);
    const totalFuel = area * fuel;

    document.getElementById('resourceResult').innerText =
        `Нужно семян: ${totalSeeds.toFixed(1)} кг | Дизтоплива: ${totalFuel.toFixed(0)} л`;
}

// --- ЧЕК-ЛИСТ ТЕХНИКИ И ПРОГРЕСС ГОТОВНОСТИ К СЕЗОНУ ---
function loadChecklist() {
    const saved = JSON.parse(localStorage.getItem('agroTechChecklist')) || {};
    document.querySelectorAll('#techChecklistContainer input[type="checkbox"]').forEach(cb => {
        const id = cb.getAttribute('data-check-id');
        cb.checked = !!saved[id];
    });
    updateSeasonProgress();
}

function saveChecklist() {
    const state = {};
    document.querySelectorAll('#techChecklistContainer input[type="checkbox"]').forEach(cb => {
        const id = cb.getAttribute('data-check-id');
        state[id] = cb.checked;
    });
    localStorage.setItem('agroTechChecklist', JSON.stringify(state));
    updateSeasonProgress();
}

function resetChecklist() {
    localStorage.removeItem('agroTechChecklist');
    document.querySelectorAll('#techChecklistContainer input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    updateSeasonProgress();
}

function updateSeasonProgress() {
    const boxes = document.querySelectorAll('#techChecklistContainer input[type="checkbox"]');
    const total = boxes.length || 1;
    let checked = 0;
    boxes.forEach(cb => { if (cb.checked) checked++; });

    const noteBonus = Math.min(notes.length * 3, 15);
    const rawPercent = Math.round((checked / total) * 85) + noteBonus;
    const percent = Math.min(rawPercent, 100);

    const fill = document.getElementById('seasonBarFill');
    const txt = document.getElementById('seasonPercentText');
    if (fill) fill.style.width = `${percent}%`;
    if (txt) txt.innerText = `${percent}%`;
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// --- АККАУНТЫ ПО ПОЧТЕ ---
let authMode = 'login';
let users = JSON.parse(localStorage.getItem('agroUsers')) || [];
let currentUser = JSON.parse(localStorage.getItem('agroCurrentUser')) || null;

function openAuthModal(mode) {
    authMode = mode;
    document.getElementById('authError').innerText = '';
    document.getElementById('authPassword').value = '';
    syncAuthModalUI();
    document.getElementById('authModal').classList.add('open');
}

function closeAuthModal() {
    document.getElementById('authModal').classList.remove('open');
}

function toggleAuthMode() {
    authMode = authMode === 'login' ? 'register' : 'login';
    document.getElementById('authError').innerText = '';
    syncAuthModalUI();
}

function syncAuthModalUI() {
    const isRegister = authMode === 'register';
    document.getElementById('authTitle').innerText = isRegister ? 'Создание аккаунта' : 'Вход по почте';
    document.getElementById('nameFieldWrap').style.display = isRegister ? 'block' : 'none';
    document.getElementById('authSubmitBtn').innerText = isRegister ? 'Зарегистрироваться' : 'Войти';
    document.getElementById('authSwitchText').innerText = isRegister ? 'Уже есть аккаунт?' : 'Нет аккаунта?';
    document.getElementById('authSwitchBtn').innerText = isRegister ? 'Войти' : 'Зарегистрироваться';
}

function handleAuthSubmit(event) {
    event.preventDefault();
    const email = document.getElementById('authEmail').value.trim().toLowerCase();
    const password = document.getElementById('authPassword').value;
    const nameInput = document.getElementById('authName').value.trim();
    const errorEl = document.getElementById('authError');

    if (!email || !password) return;

    if (authMode === 'register') {
        if (users.some(u => u.email === email)) {
            errorEl.innerText = 'Аккаунт с такой почтой уже зарегистрирован.';
            return;
        }
        const displayName = nameInput || email.split('@')[0];
        const newUser = { name: displayName, email, password };
        users.push(newUser);
        localStorage.setItem('agroUsers', JSON.stringify(users));
        currentUser = { name: newUser.name, email: newUser.email };
        localStorage.setItem('agroCurrentUser', JSON.stringify(currentUser));
        closeAuthModal();
        onUserChanged();
    } else {
        const found = users.find(u => u.email === email && u.password === password);
        if (!found) {
            errorEl.innerText = 'Неверная почта или пароль.';
            return;
        }
        currentUser = { name: found.name, email: found.email };
        localStorage.setItem('agroCurrentUser', JSON.stringify(currentUser));
        closeAuthModal();
        onUserChanged();
    }
}

function logoutUser() {
    currentUser = null;
    localStorage.removeItem('agroCurrentUser');
    onUserChanged();
}

function renderAuthPanel() {
    const panel = document.getElementById('authPanel');
    const authorInput = document.getElementById('projAuthor');
    if (!panel) return;

    if (currentUser) {
        panel.innerHTML = `
            <span class="user-badge">👤 ${escapeHtml(currentUser.name)}</span>
            <button class="auth-btn auth-btn-outline" onclick="logoutUser()">Выйти</button>
        `;
        if (authorInput && !authorInput.value) {
            authorInput.value = currentUser.name;
        }
    } else {
        panel.innerHTML = `
            <button class="auth-btn" onclick="openAuthModal('login')">Войти по почте</button>
            <button class="auth-btn auth-btn-outline" onclick="openAuthModal('register')">Создать аккаунт</button>
        `;
    }
}

function onUserChanged() {
    renderAuthPanel();
    loadNotesForUser();
}

// --- АГРО-РУЛЕТКА НИШЕВЫХ ИДЕЙ ---
const rouletteIdeas = [
    {
        title: 'Тыква на семечку + своя сушилка + фасовка',
        category: 'Нишевое земледелие и переработка',
        desc: 'Выращивание голосемянной или крупноплодной тыквы на 3–5 га с быстрой сушкой, чтобы сдавать сухую светлую семечку по максимальной цене без потерь на влажности.'
    },
    {
        title: 'Услуги культивации и перевозки прицепом по селу',
        category: 'Техника и услуги',
        desc: 'Окупаемость минитрактора и навесного оборудования за счёт обработки огородов и участков соседей (культивация, фреза, доставка дров/зерна).'
    },
    {
        title: 'Чеснок озимый на малых площадях (от 0.5 до 2 га)',
        category: 'Высокомаржинальные культуры',
        desc: 'Высокий выход продукции с сотки и хороший спрос на посадочный материал, но требует ручной или полумеханизированной посадки и прополки.'
    },
    {
        title: 'Сборка и восстановление бюджетных минитракторов под заказ',
        category: 'Гараж и DIY-техника',
        desc: 'Покупка уставших доноров, переборка узлов, усиление навески и адаптация под задачи конкретного фермера.'
    },
    {
        title: 'Выращивание кормовых культур и сена для локальных хозяйств',
        category: 'Кормовая база',
        desc: 'Стабильный локальный сбыт тюкованного сена или зернофуража в радиусе 20–30 км без дальних перевозок.'
    }
];

let currentRouletteIdea = null;

function spinAgroRoulette() {
    const idx = Math.floor(Math.random() * rouletteIdeas.length);
    currentRouletteIdea = rouletteIdeas[idx];
    document.getElementById('rouletteTitle').innerText = currentRouletteIdea.title;
    document.getElementById('rouletteDesc').innerText = `[${currentRouletteIdea.category}] ${currentRouletteIdea.desc}`;
    document.getElementById('adoptIdeaBtn').style.display = 'inline-block';
}

function adoptRouletteIdea() {
    if (!currentRouletteIdea) return;
    const author = currentUser ? currentUser.name : 'Участник из рулетки';
    projects.unshift({
        type: 'Проект / Идея',
        title: currentRouletteIdea.title,
        category: currentRouletteIdea.category,
        author,
        desc: currentRouletteIdea.desc
    });
    renderProjects();
}

// --- ПРОЕКТЫ, КЕЙСЫ И СТЕНА ОПЫТА ---
let projects = JSON.parse(localStorage.getItem('agroProjects')) || [
    {
        type: 'Проект / Идея',
        title: 'Выращивание тыквы на семечку на 3 гектарах',
        category: 'Нишевое земледелие',
        author: 'Участник сообщества',
        desc: 'Отработка схемы посева, междурядной культивации и сушки урожая для стабильного качества семечки.'
    },
    {
        type: 'Факап / Урок',
        title: 'Задержка с сушкой после уборки — семечка начала темнеть',
        category: 'Переработка и хранение',
        author: 'Практик',
        desc: 'Урок: сушилку и вентиляцию нужно проверять и запускать в день уборки, даже один день простоя в мешках резко бьёт по цене приёмки.'
    },
    {
        type: 'Успешный кейс',
        title: 'Бюджетный минитрактор + культиватор и прицеп',
        category: 'Техника и DIY',
        author: 'Мастерская',
        desc: 'Усиление навески и подбор передаточных чисел позволили уверенно закрывать сезонные работы с минимальным расходом ДТ.'
    }
];

function renderProjects() {
    const list = document.getElementById('projectsList');
    if (!list) return;
    list.innerHTML = '';
    projects.forEach((proj, index) => {
        const typeText = proj.type || 'Проект / Идея';
        const badgeClass = typeText.includes('Факап') ? 'badge badge-warn' : (typeText.includes('кейс') ? 'badge badge-gold' : 'badge');
        const card = document.createElement('div');
        card.className = 'card project-item';
        card.innerHTML = `
            <span class="${badgeClass}">${escapeHtml(typeText)}</span>
            <span class="badge">${escapeHtml(proj.category || 'Проект')}</span>
            <h3>${escapeHtml(proj.title)}</h3>
            <p>${escapeHtml(proj.desc)}</p>
            <div class="project-meta"><strong>Автор:</strong> ${escapeHtml(proj.author || 'Аноним')}</div>
            <div class="project-actions">
                <button class="del-btn" onclick="deleteProject(${index})">Удалить</button>
            </div>
        `;
        list.appendChild(card);
    });
    localStorage.setItem('agroProjects', JSON.stringify(projects));
    filterProjects();
}

function addProject() {
    const typeInput = document.getElementById('projType');
    const titleInput = document.getElementById('projTitle');
    const catInput = document.getElementById('projCategory');
    const authorInput = document.getElementById('projAuthor');
    const descInput = document.getElementById('projDesc');

    const type = typeInput ? typeInput.value : 'Проект / Идея';
    const title = titleInput.value.trim();
    const category = catInput.value.trim() || 'Общий проект';
    const defaultAuthor = currentUser ? `${currentUser.name} (${currentUser.email})` : 'Участник';
    const author = authorInput.value.trim() || defaultAuthor;
    const desc = descInput.value.trim();

    if (!title || !desc) return;

    projects.unshift({ type, title, category, author, desc });
    titleInput.value = '';
    catInput.value = '';
    descInput.value = '';
    renderProjects();
}

function deleteProject(index) {
    projects.splice(index, 1);
    renderProjects();
}

function filterProjects() {
    const searchEl = document.getElementById('searchProject');
    const query = searchEl ? searchEl.value.toLowerCase() : '';
    document.querySelectorAll('.project-item').forEach(card => {
        card.style.display = card.innerText.toLowerCase().includes(query) ? 'block' : 'none';
    });
}

// --- АГРО-ЖУРНАЛ ---
let notes = [];

function getNotesStorageKey() {
    return currentUser ? `agroNotes_${currentUser.email}` : 'agroNotes_guest';
}

function loadNotesForUser() {
    const hintEl = document.getElementById('notesScopeHint');
    if (hintEl) {
        hintEl.innerText = currentUser
            ? `Личный журнал аккаунта ${currentUser.email} (сохраняется в этом браузере).`
            : 'Гостевой режим: войдите по почте, чтобы вести отдельный журнал под своим аккаунтом.';
    }
    const saved = localStorage.getItem(getNotesStorageKey());
    notes = saved ? JSON.parse(saved) : [
        'Подготовить семена тыквы к посеву',
        'Проверить лапы культиватора и масло в тракторе'
    ];
    renderNotes();
}

function renderNotes() {
    const list = document.getElementById('notesList');
    list.innerHTML = '';
    notes.forEach((note, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${escapeHtml(note)}</span><button class="del-btn" onclick="deleteNote(${index})">Удалить</button>`;
        list.appendChild(li);
    });
    localStorage.setItem(getNotesStorageKey(), JSON.stringify(notes));
    updateSeasonProgress();
}

function addNote() {
    const input = document.getElementById('noteText');
    const text = input.value.trim();
    if (!text) return;
    notes.unshift(`${new Date().toLocaleDateString()} — ${text}`);
    input.value = '';
    renderNotes();
}

function deleteNote(index) {
    notes.splice(index, 1);
    renderNotes();
}

applySavedTheme();
renderAuthPanel();
renderProjects();
loadNotesForUser();
loadChecklist();

