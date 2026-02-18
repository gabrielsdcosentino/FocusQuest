import { TimerManager } from './timer.js';
import { Preferences } from '@capacitor/preferences';

// --- Elementos da UI ---
const elTimer = document.getElementById('timer-display');
const elBtnStart = document.getElementById('btn-start');
const elBtnGiveUp = document.getElementById('btn-giveup');
const elGold = document.getElementById('hero-gold');
const elLvl = document.getElementById('hero-lvl');
const elMonsterHp = document.getElementById('monster-hp');

// --- Estado do Jogo ---
let gameState = {
    gold: 0,
    lvl: 1,
    xp: 0
};

// --- Funções de Salvamento (Persistência) ---
async function loadGame() {
    const { value } = await Preferences.get({ key: 'focusQuestSave' });
    if (value) {
        gameState = JSON.parse(value);
        updateUI();
    }
}

async function saveGame() {
    await Preferences.set({
        key: 'focusQuestSave',
        value: JSON.stringify(gameState)
    });
}

function updateUI() {
    elGold.innerText = gameState.gold;
    elLvl.innerText = gameState.lvl;
}

// --- Configuração do Timer ---
const timer = new TimerManager({
    onTick: (remainingMs) => {
        // Formata MM:SS
        const totalSeconds = Math.ceil(remainingMs / 1000);
        const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        elTimer.innerText = `${m}:${s}`;
        
        // Atualiza barra de vida do monstro (Visual)
        // 25 min = 1500 seg. Proporção simples.
        const totalDuration = 25 * 60; 
        const percent = (totalSeconds / totalDuration) * 100;
        elMonsterHp.style.width = `${percent}%`;
    },
    onComplete: async () => {
        // Vitória!
        gameState.gold += 50;
        gameState.xp += 100;
        await saveGame();
        updateUI();
        alert("VITÓRIA! Você ganhou 50 de Ouro.");
        resetBattleUI();
    },
    onCancel: () => {
        // Derrota!
        alert("Você fugiu da batalha! O monstro riu de você.");
        resetBattleUI();
    }
});

// --- Controles ---
function startBattle() {
    elBtnStart.classList.add('hidden');
    elBtnGiveUp.classList.remove('hidden');
    timer.start(25); // 25 Minutos
}

function giveUp() {
    if (confirm("Tem certeza? O Herói vai perder honra!")) {
        timer.stop();
    }
}

function resetBattleUI() {
    elTimer.innerText = "25:00";
    elMonsterHp.style.width = "100%";
    elBtnStart.classList.remove('hidden');
    elBtnGiveUp.classList.add('hidden');
}

// Event Listeners
elBtnStart.addEventListener('click', startBattle);
elBtnGiveUp.addEventListener('click', giveUp);

// Inicialização
loadGame();
