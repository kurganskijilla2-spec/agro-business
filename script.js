
// Переключение вкладок
function openTab(tabId, btn) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    btn.classList.add('active');
}

// Поиск по карточкам культур
function filterCrops() {
    const query = document.getElementById('searchCrop').value.toLowerCase();
    document.querySelectorAll('.crop-item').forEach(card => {
        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(query) ? 'block' : 'none';
    });
}

// Поиск по бюджетным тракторам и комплектующим
function filterTractors() {
    const query = document.getElementById('searchTractor').value.toLowerCase();
    document.querySelectorAll('.tractor-item').forEach(card => {
        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(query) ? 'block' : 'none';
    });
}

// Калькулятор прибыли
function calculateProfit() {
    const area = parseFloat(document.getElementById('area').value) || 0;
    const cost = parseFloat(document.getElementById('cost').value) || 0;
    const yieldPerHa = parseFloat(document.getElementById('yield').value) || 0;
    const price = parseFloat(document.getElementById('price').value) || 0;

    const totalRevenue = area * yieldPerHa * price;
    const totalCost = area * cost;
    const profit = totalRevenue - totalCost;

    document.getElementById('profitResult').innerText =
        `Чистая прибыль: ${profit.toLocaleString()} (Выручка: ${totalRevenue.toLocaleString()})`;
}

// Калькулятор семян и топлива
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

// Проекты сообщества (localStorage)
let projects = JSON.parse(localStorage.getItem('agroProjects')) || [
    {
        title: 'Выращивание тыквы на семечку на малых площадях',
        category: 'Нишевое земледелие',
        author: 'Участник сообщества',
        desc: 'Отработка схемы посева, междурядной обработки и сушки урожая для стабильного качества семечки.'
    },
    {
        title: 'Бюджетный минитрактор под культивацию и прицеп',
        category: 'Техника и DIY',
        author: 'Мастерская',
        desc: 'Подбор доступных узлов, усиление навески и оптимизация расхода топлива для сезонных работ.'
    }
];

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function renderProjects() {
    const list = document.getElementById('projectsList');
    if (!list) return;
    list.innerHTML = '';
    projects.forEach((proj, index) => {
        const card = document.createElement('div');
        card.className = 'card project-item';
        card.innerHTML = `
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
    const titleInput = document.getElementById('projTitle');
    const catInput = document.getElementById('projCategory');
    const authorInput = document.getElementById('projAuthor');
    const descInput = document.getElementById('projDesc');

    const title = titleInput.value.trim();
    const category = catInput.value.trim() || 'Общий проект';
    const author = authorInput.value.trim() || 'Участник';
    const desc = descInput.value.trim();

    if (!title || !desc) return;

    projects.unshift({ title, category, author, desc });
    titleInput.value = '';
    catInput.value = '';
    authorInput.value = '';
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
        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(query) ? 'block' : 'none';
    });
}

// Агро-журнал (localStorage)
let notes = JSON.parse(localStorage.getItem('agroNotes')) || [
    'Подготовить семена тыквы сорт Ольга к посеву',
    'Проверить лапы культиватора и масло в тракторе'
];

function renderNotes() {
    const list = document.getElementById('notesList');
    list.innerHTML = '';
    notes.forEach((note, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${escapeHtml(note)}</span><button class="del-btn" onclick="deleteNote(${index})">Удалить</button>`;
        list.appendChild(li);
    });
    localStorage.setItem('agroNotes', JSON.stringify(notes));
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

renderProjects();
renderNotes();

