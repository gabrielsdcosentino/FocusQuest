import { TimerManager } from './timer.js';
import { Preferences } from '@capacitor/preferences';

const elTimer = document.getElementById('timer-display');
const elBtnStart = document.getElementById('btn-start');
const elBtnGiveUp = document.getElementById('btn-giveup');
const elGold = document.getElementById('hero-gold');
const elLvl = document.getElementById('hero-lvl');
const elMonsterHp = document.getElementById('monster-hp');

let gameState = { gold: 0, lvl: 1, xp: 0 };

async function loadGame() {
    const { value } = await Preferences.get({ key: 'focusQuestSave' });
    if (value) { gameState = JSON.parse(value); updateUI(); }
}

async function saveGame() {
    await Preferences.set({ key: 'focusQuestSave', value: JSON.stringify(gameState) });
}

function updateUI() {
    elGold.innerText = gameState.gold;
    elLvl.innerText = gameState.lvl;
}

const timer = new TimerManager({
    onTick: (remainingMs) => {
        const totalSeconds = Math.ceil(remainingMs / 1000);
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        elTimer.innerText = `00:${s}`;
        
        // Ajuste da barra para o teste de 10s
        const percent = (totalSeconds / 10) * 100;
        elMonsterHp.style.width = `${percent}%`;
    },
    onComplete: async () => {
        gameState.gold += 50;
        await saveGame();
        updateUI();
        alert("VITÓRIA NO TESTE! Ganhaste 50 de Ouro.");
        resetBattleUI();
    },
    onCancel: () => {
        alert("Desististe do teste!");
        resetBattleUI();
    }
});

function startBattle() {
    elBtnStart.classList.add('hidden');
    elBtnGiveUp.classList.remove('hidden');
    // TESTE: 10 SEGUNDOS (10 / 60 minutos)
    timer.start(10 / 60);
}

function giveUp() {
    if (confirm("Desistir?")) timer.stop();
}

function resetBattleUI() {
    elTimer.innerText = "00:10";
    elMonsterHp.style.width = "100%";
    elBtnStart.classList.remove('hidden');
    elBtnGiveUp.classList.add('hidden');
}

elBtnStart.addEventListener('click', startBattle);
elBtnGiveUp.addEventListener('click', giveUp);
loadGame();
