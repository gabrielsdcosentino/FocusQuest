import { TimerManager } from './timer.js';
import { Preferences } from '@capacitor/preferences';

const elTimer = document.getElementById('timer-display');
const elBtnStart = document.getElementById('btn-start');
const elBtnGiveUp = document.getElementById('btn-giveup');
const elGold = document.getElementById('hero-gold');
const elLvl = document.getElementById('hero-lvl');
const elMonsterHp = document.getElementById('monster-hp');

let gameState = { gold: 0, lvl: 1, xp: 0 };
const FOCUS_TIME = 25; // Minutos reais

async function loadGame() {
    const { value } = await Preferences.get({ key: 'focusQuestSave' });
    if (value) { gameState = JSON.parse(value); updateUI(); }
}

function updateUI() {
    elGold.innerText = gameState.gold;
    elLvl.innerText = gameState.lvl;
}

const timer = new TimerManager({
    onTick: (remainingMs) => {
        const totalSeconds = Math.ceil(remainingMs / 1000);
        const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        elTimer.innerText = `${m}:${s}`;
        
        const percent = (totalSeconds / (FOCUS_TIME * 60)) * 100;
        elMonsterHp.style.width = `${percent}%`;
    },
    onComplete: async () => {
        gameState.gold += 50;
        await Preferences.set({ key: 'focusQuestSave', value: JSON.stringify(gameState) });
        updateUI();
        alert("VITÓRIA! O Slime foi derrotado.");
        resetBattleUI();
    },
    onCancel: () => { resetBattleUI(); }
});

function resetBattleUI() {
    elTimer.innerText = "25:00";
    elMonsterHp.style.width = "100%";
    elBtnStart.classList.remove('hidden');
    elBtnGiveUp.classList.add('hidden');
}

elBtnStart.addEventListener('click', () => {
    elBtnStart.classList.add('hidden');
    elBtnGiveUp.classList.remove('hidden');
    timer.start(FOCUS_TIME);
});

elBtnGiveUp.addEventListener('click', () => {
    if (confirm("Desistir da honra?")) timer.stop();
});

loadGame();
