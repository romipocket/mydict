// === DATA STORAGE ===
const STORAGE_KEY = 'mydict_data';

function loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    return { groups: [] };
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let appData = loadData();

// === NAVIGATION ===
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.screen === screenId);
    });
    
    // Show/hide bottom nav for secondary screens
    const bottomNav = document.getElementById('bottom-nav');
    if (screenId === 'screen-search' || screenId === 'screen-groups') {
        bottomNav.style.display = 'flex';
    } else {
        bottomNav.style.display = 'none';
    }
    
    if (screenId === 'screen-groups') renderGroups();
}

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => showScreen(btn.dataset.screen));
});

// === DICTIONARY SEARCH ===
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const resultsContainer = document.getElementById('search-results');

let lastSearchedWord = null;
let lastSearchData = null;
let lastTranslation = null;

async function searchWord(word) {
    if (!word.trim()) return;
    
    resultsContainer.innerHTML = '<div class="loading">Buscando...</div>';
    
    try {
        // Llamadas en paralelo: diccionario + traducción principal + sinónimos en inglés
        const [dictRes, transRes, synRes] = await Promise.allSettled([
            fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.trim().toLowerCase())}`),
            fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word.trim())}&langpair=en|es`),
            fetch(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word.trim().toLowerCase())}&max=5`)
        ]);
        
        if (dictRes.status !== 'fulfilled' || !dictRes.value.ok) {
            throw new Error('Palabra no encontrada');
        }
        
        const data = await dictRes.value.json();
        lastSearchedWord = word.trim().toLowerCase();
        lastSearchData = data;
        
        // Recolectar traducciones
        const translations = [];
        
        // 1. Traducción principal
        if (transRes.status === 'fulfilled' && transRes.value.ok) {
            try {
                const transData = await transRes.value.json();
                const mainTrans = transData.responseData?.translatedText;
                if (mainTrans && mainTrans.toLowerCase() !== word.trim().toLowerCase()) {
                    translations.push(mainTrans);
                }
            } catch (e) {}
        }
        
        // 2. Traducir sinónimos para obtener más opciones
        if (synRes.status === 'fulfilled' && synRes.value.ok) {
            try {
                const synonyms = await synRes.value.json();
                if (synonyms.length > 0) {
                    const synWords = synonyms.slice(0, 4).map(s => s.word);
                    const synQuery = synWords.join(', ');
                    const synTransRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(synQuery)}&langpair=en|es`);
                    if (synTransRes.ok) {
                        const synTransData = await synTransRes.json();
                        if (synTransData.responseData?.translatedText) {
                            // Separar por comas o "y"
                            const synTranslations = synTransData.responseData.translatedText
                                .split(/,| y /)
                                .map(t => t.trim())
                                .filter(t => t.length > 1 && t.toLowerCase() !== word.trim().toLowerCase());
                            translations.push(...synTranslations);
                        }
                    }
                }
            } catch (e) {}
        }
        
        // Limpiar duplicados (sin distinguir mayúsculas) y limitar
        const seen = new Set();
        const uniqueTranslations = [];
        for (const t of translations) {
            const lower = t.toLowerCase();
            if (!seen.has(lower)) {
                seen.add(lower);
                uniqueTranslations.push(t);
                if (uniqueTranslations.length >= 5) break;
            }
        }
        
        lastTranslation = uniqueTranslations.join(', ');
        
        renderResults(data, lastTranslation);
    } catch (err) {
        resultsContainer.innerHTML = `
            <div class="error-card">
                <p>😕 No encontramos "${word}"</p>
                <p style="font-size:14px; margin-top:8px;">Verifica la ortografía o intenta con otra palabra.</p>
            </div>
        `;
    }
}

function renderResults(data, translation = '') {
    const entry = data[0];
    let html = '';
    
    const phonetic = entry.phonetics?.find(p => p.text)?.text || '';
    const audio = entry.phonetics?.find(p => p.audio)?.audio || '';
    
    html += `<div class="word-card">`;
    html += `<h2>${entry.word}</h2>`;
    if (phonetic) html += `<div class="phonetic">${phonetic} ${audio ? `<button onclick="playAudio('${audio}')" style="background:none;border:none;font-size:18px;cursor:pointer;">🔊</button>` : ''}</div>`;
    
    // Mostrar traducción editable
    html += `<div class="translation-box" style="background:#E3F2FD; padding:12px; border-radius:10px; margin-bottom:12px;">`;
    html += `<div style="font-size:13px; color:#1976D2; font-weight:600; margin-bottom:4px;">🇪🇸 Traducción:</div>`;
    html += `<input type="text" id="manual-translation" value="${translation}" placeholder="Escribe la traducción..." style="width:100%; padding:10px; border:1px solid #90CAF9; border-radius:8px; font-size:16px; outline:none;">`;
    html += `<div style="font-size:12px; color:#1976D2; margin-top:6px; opacity:0.8;">💡 Puedes editar o agregar más traducciones</div>`;
    html += `</div>`;
    
    entry.meanings.forEach((meaning, idx) => {
        if (idx > 2) return; // Limit to 3 meanings
        html += `<div class="meaning">`;
        html += `<div class="part-of-speech">${meaning.partOfSpeech}</div>`;
        
        meaning.definitions.slice(0, 2).forEach(def => {
            html += `<div class="definition">${def.definition}</div>`;
            if (def.example) html += `<div class="example">"${def.example}"</div>`;
        });
        
        if (meaning.synonyms && meaning.synonyms.length > 0) {
            html += `<div class="synonyms"><strong>Sinónimos:</strong> ${meaning.synonyms.slice(0, 5).join(', ')}</div>`;
        }
        
        html += `</div>`;
    });
    
    html += `<button class="btn-save" onclick="openAddToGroup('${entry.word}')">➕ Guardar en un grupo</button>`;
    html += `</div>`;
    
    resultsContainer.innerHTML = html;
}

function playAudio(url) {
    const audio = new Audio(url);
    audio.play().catch(() => {});
}

searchBtn.addEventListener('click', () => searchWord(searchInput.value));
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchWord(searchInput.value);
});

// === ADD TO GROUP ===
const modalAdd = document.getElementById('modal-add-to-group');
const addGroupList = document.getElementById('add-group-list');

let pendingWord = null;

function openAddToGroup(word) {
    const data = getWordData(word);
    pendingWord = {
        word: data.word,
        translation: data.translation,
        definition: data.definition,
        date: new Date().toISOString()
    };
    
    renderAddGroupList();
    modalAdd.classList.add('active');
}

function getWordData(word) {
    const wordLower = word.toLowerCase();
    let definition = '';
    let translation = lastTranslation || '';
    
    // Capturar traducción manual si existe
    const manualInput = document.getElementById('manual-translation');
    if (manualInput && manualInput.value.trim()) {
        translation = manualInput.value.trim();
    }
    
    if (lastSearchData) {
        const entry = lastSearchData.find(e => e.word.toLowerCase() === wordLower);
        if (entry) {
            const meaning = entry.meanings[0];
            if (meaning) {
                const def = meaning.definitions[0];
                definition = def ? def.definition : '';
            }
        }
    }
    
    return { word, definition, translation };
}

function renderAddGroupList() {
    addGroupList.innerHTML = '';
    
    if (appData.groups.length === 0) {
        addGroupList.innerHTML = `
            <div class="empty-state">
                <p>Aún no tienes grupos</p>
            </div>
        `;
    } else {
        appData.groups.forEach((group, idx) => {
            const div = document.createElement('div');
            div.className = 'group-option';
            div.textContent = `${group.name} (${group.words.length} palabras)`;
            div.onclick = () => addWordToGroup(idx);
            addGroupList.appendChild(div);
        });
    }
    
    const newDiv = document.createElement('div');
    newDiv.className = 'group-option new-group-opt';
    newDiv.textContent = '＋ Crear nuevo grupo';
    newDiv.onclick = () => {
        modalAdd.classList.remove('active');
        openNewGroupModal(true);
    };
    addGroupList.appendChild(newDiv);
}

function addWordToGroup(groupIndex) {
    const group = appData.groups[groupIndex];
    // Check if word already exists
    const exists = group.words.some(w => w.word.toLowerCase() === pendingWord.word.toLowerCase());
    if (exists) {
        alert('Esta palabra ya está en el grupo');
        modalAdd.classList.remove('active');
        return;
    }
    
    group.words.push(pendingWord);
    saveData(appData);
    modalAdd.classList.remove('active');
    
    // Show saved message
    const saveBtn = document.querySelector('.btn-save');
    if (saveBtn) {
        const msg = document.createElement('div');
        msg.className = 'saved-message';
        msg.textContent = `✅ Guardada en "${group.name}"`;
        saveBtn.parentElement.appendChild(msg);
        setTimeout(() => msg.remove(), 3000);
    }
}

document.getElementById('btn-cancel-add').addEventListener('click', () => {
    modalAdd.classList.remove('active');
});

// === GROUPS ===
function renderGroups() {
    const list = document.getElementById('groups-list');
    
    if (appData.groups.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="icon">📚</div>
                <p>No tienes grupos aún</p>
                <p style="font-size:14px; margin-top:8px;">Toca el + arriba para crear uno</p>
            </div>
        `;
        return;
    }
    
    list.innerHTML = '';
    appData.groups.forEach((group, idx) => {
        const card = document.createElement('div');
        card.className = 'group-card';
        card.innerHTML = `
            <div>
                <h3>${group.name}</h3>
                <div class="word-count">${group.words.length} palabra${group.words.length !== 1 ? 's' : ''}</div>
            </div>
            <div class="arrow">›</div>
        `;
        card.addEventListener('click', () => openGroup(idx));
        list.appendChild(card);
    });
}

// New Group Modal
const modalNewGroup = document.getElementById('modal-new-group');
let newGroupAfterAdd = false;

function openNewGroupModal(afterAdd = false) {
    newGroupAfterAdd = afterAdd;
    document.getElementById('new-group-name').value = '';
    modalNewGroup.classList.add('active');
    setTimeout(() => document.getElementById('new-group-name').focus(), 100);
}

document.getElementById('btn-new-group').addEventListener('click', () => openNewGroupModal(false));
document.getElementById('btn-cancel-group').addEventListener('click', () => {
    modalNewGroup.classList.remove('active');
    if (newGroupAfterAdd) modalAdd.classList.add('active');
});

document.getElementById('btn-create-group').addEventListener('click', () => {
    const name = document.getElementById('new-group-name').value.trim();
    if (!name) return;
    
    const newGroup = {
        name: name,
        words: [],
        created: new Date().toISOString()
    };
    
    appData.groups.push(newGroup);
    saveData(appData);
    modalNewGroup.classList.remove('active');
    
    if (newGroupAfterAdd && pendingWord) {
        addWordToGroup(appData.groups.length - 1);
    } else {
        renderGroups();
    }
});

document.getElementById('new-group-name').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('btn-create-group').click();
});

// === GROUP DETAIL ===
let currentGroupIndex = null;

function openGroup(index) {
    currentGroupIndex = index;
    const group = appData.groups[index];
    document.getElementById('group-detail-title').textContent = group.name;
    renderWordsList();
    showScreen('screen-group-detail');
}

function renderWordsList() {
    const list = document.getElementById('words-list');
    const group = appData.groups[currentGroupIndex];
    
    if (group.words.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="icon">📝</div>
                <p>Este grupo está vacío</p>
                <p style="font-size:14px; margin-top:8px;">Busca palabras y guárdalas aquí</p>
            </div>
        `;
        return;
    }
    
    list.innerHTML = '';
    group.words.forEach((word, idx) => {
        const item = document.createElement('div');
        item.className = 'word-item';
        
        // Formatear traducciones: separar por comas y mostrar como pills
        let transHtml = '';
        if (word.translation) {
            const transList = word.translation.split(',').map(t => t.trim()).filter(Boolean);
            transHtml = transList.map(t => `<span class="translation-tag">${t}</span>`).join(' ');
        }
        
        const subText = word.definition ? `<div style="font-size:12px; color:#999; margin-top:6px; font-style:italic; line-height:1.4;">${word.definition}</div>` : '';
        
        item.innerHTML = `
            <div style="flex:1; min-width:0;">
                <div class="word-text">${word.word}</div>
                ${transHtml ? `<div style="margin-top:4px;">${transHtml}</div>` : ''}
                ${subText}
            </div>
            <button class="btn-delete">🗑</button>
        `;
        item.querySelector('.btn-delete').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteWord(idx);
        });
        list.appendChild(item);
    });
}

function deleteWord(wordIndex) {
    if (!confirm('¿Eliminar esta palabra?')) return;
    appData.groups[currentGroupIndex].words.splice(wordIndex, 1);
    saveData(appData);
    renderWordsList();
}

document.getElementById('btn-back-from-group').addEventListener('click', () => {
    showScreen('screen-groups');
});

document.getElementById('btn-study-group').addEventListener('click', () => {
    const group = appData.groups[currentGroupIndex];
    if (group.words.length === 0) {
        alert('Este grupo está vacío. Agrega palabras primero.');
        return;
    }
    startFlashcards();
});

// === FLASHCARDS ===
let flashcardsQueue = [];
let currentCardIndex = 0;

function startFlashcards() {
    const group = appData.groups[currentGroupIndex];
    flashcardsQueue = [...group.words];
    // Shuffle
    flashcardsQueue.sort(() => Math.random() - 0.5);
    currentCardIndex = 0;
    
    showScreen('screen-flashcards');
    showCard();
}

function showCard() {
    const finishedDiv = document.getElementById('flashcard-finished');
    const flashcard = document.getElementById('flashcard');
    const controls = document.querySelector('.flashcard-controls');
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.getElementById('flashcard-progress-text');
    
    if (currentCardIndex >= flashcardsQueue.length) {
        flashcard.style.display = 'none';
        controls.style.display = 'none';
        progressBar.style.display = 'none';
        progressText.style.display = 'none';
        finishedDiv.style.display = 'block';
        return;
    }
    
    flashcard.style.display = 'block';
    controls.style.display = 'flex';
    progressBar.style.display = 'block';
    progressText.style.display = 'block';
    finishedDiv.style.display = 'none';
    flashcard.classList.remove('flipped');
    
    const card = flashcardsQueue[currentCardIndex];
    document.getElementById('flashcard-word').textContent = card.word;
    document.getElementById('flashcard-translation').textContent = 'Toca para ver traducción';
    
    // Preparar contenido del reverso
    let backContent = '';
    if (card.translation) {
        const transList = card.translation.split(',').map(t => t.trim()).filter(Boolean);
        const transHtml = transList.map(t => `<span style="display:inline-block; background:rgba(255,255,255,0.25); padding:4px 10px; border-radius:8px; margin:2px; font-size:18px;">${t}</span>`).join('');
        backContent += `<div style="margin-bottom:12px; text-align:center;">${transHtml}</div>`;
    }
    if (card.definition) {
        backContent += `<div style="font-size:15px; opacity:0.9; line-height:1.4;">${card.definition}</div>`;
    }
    if (!backContent) {
        backContent = '<div style="font-size:16px; opacity:0.9;">Sin traducción ni definición</div>';
    }
    document.getElementById('flashcard-definition').innerHTML = backContent;
    
    const progress = ((currentCardIndex + 1) / flashcardsQueue.length) * 100;
    document.getElementById('flashcard-progress').style.width = progress + '%';
    document.getElementById('flashcard-progress-text').textContent = `${currentCardIndex + 1} / ${flashcardsQueue.length}`;
}

document.getElementById('flashcard').addEventListener('click', () => {
    document.getElementById('flashcard').classList.toggle('flipped');
});

document.getElementById('btn-hard').addEventListener('click', () => {
    // Put card at the end to review again
    const card = flashcardsQueue[currentCardIndex];
    flashcardsQueue.splice(currentCardIndex, 1);
    flashcardsQueue.push(card);
    showCard();
});

document.getElementById('btn-easy').addEventListener('click', () => {
    currentCardIndex++;
    showCard();
});

document.getElementById('btn-restart-flashcards').addEventListener('click', () => {
    currentCardIndex = 0;
    flashcardsQueue.sort(() => Math.random() - 0.5);
    showCard();
});

document.getElementById('btn-back-from-flashcards').addEventListener('click', () => {
    showScreen('screen-group-detail');
});

// === BACKUP / EXPORT / IMPORT ===
const modalBackup = document.getElementById('modal-backup');

function openBackupModal() {
    modalBackup.classList.add('active');
}

document.getElementById('btn-backup').addEventListener('click', openBackupModal);
document.getElementById('btn-cancel-backup').addEventListener('click', () => {
    modalBackup.classList.remove('active');
});

// Exportar
function exportData() {
    const dataStr = JSON.stringify(appData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `mydict-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('✅ Archivo descargado. Guárdalo para importarlo en otro dispositivo.');
    modalBackup.classList.remove('active');
}

document.getElementById('btn-export').addEventListener('click', exportData);

// Importar
const importFileInput = document.getElementById('import-file');

document.getElementById('btn-import').addEventListener('click', () => {
    importFileInput.click();
});

importFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const importedData = JSON.parse(event.target.result);
            
            // Validar estructura básica
            if (!importedData.groups || !Array.isArray(importedData.groups)) {
                throw new Error('El archivo no tiene el formato correcto');
            }
            
            if (!confirm(`¿Importar ${importedData.groups.length} grupo(s)? Esto reemplazará tus listas actuales.`)) {
                return;
            }
            
            appData = importedData;
            saveData(appData);
            renderGroups();
            
            alert('✅ Listas importadas correctamente');
            modalBackup.classList.remove('active');
            importFileInput.value = '';
        } catch (err) {
            alert('❌ Error al importar: ' + err.message);
            importFileInput.value = '';
        }
    };
    reader.readAsText(file);
});

// === SERVICE WORKER ===
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .catch(err => console.log('SW registration failed:', err));
}

// === INIT ===
renderGroups();
