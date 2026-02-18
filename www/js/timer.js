import { App } from '@capacitor/app';
import { LocalNotifications } from '@capacitor/local-notifications';

export class TimerManager {
    constructor(callbacks) {
        this.timerId = null;
        this.targetTime = null;
        this.duration = 0;
        this.isRunning = false;
        
        // Callbacks para atualizar a UI (quem usar essa classe define o que fazer)
        this.onTick = callbacks.onTick || (() => {});
        this.onComplete = callbacks.onComplete || (() => {});
        this.onCancel = callbacks.onCancel || (() => {});

        // Ouvinte: Quando o app volta do background (Minimizado -> Aberto)
        App.addListener('appStateChange', ({ isActive }) => {
            if (isActive && this.isRunning) {
                this.checkBackgroundTime();
            }
        });
    }

    async start(minutes) {
        if (this.isRunning) return;

        // 1. Configura o tempo
        this.duration = minutes * 60 * 1000;
        this.targetTime = Date.now() + this.duration;
        this.isRunning = true;

        // 2. Agenda a Notificação (Garantia se o app fechar)
        await this.scheduleNotification();

        // 3. Inicia o loop visual
        this.startInterval();
    }

    stop(isComplete = false) {
        this.isRunning = false;
        this.targetTime = null;
        
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }

        // Cancela notificação pendente se o usuário desistiu
        if (!isComplete) {
            LocalNotifications.cancel({ notifications: [{ id: 1 }] });
            this.onCancel();
        }
    }

    startInterval() {
        // Roda a cada 1 segundo para atualizar a tela
        this.timerId = setInterval(() => {
            this.tick();
        }, 1000);
        this.tick(); // Executa imediatamente
    }

    tick() {
        if (!this.isRunning || !this.targetTime) return;

        const now = Date.now();
        const remaining = this.targetTime - now;

        if (remaining <= 0) {
            this.finish();
        } else {
            this.onTick(remaining);
        }
    }

    finish() {
        this.stop(true); // true = parou porque acabou (sucesso)
        this.onComplete();
    }

    // Verifica se o tempo acabou enquanto o app estava minimizado
    checkBackgroundTime() {
        const now = Date.now();
        if (this.targetTime && now >= this.targetTime) {
            this.finish();
        } else {
            // Se ainda tem tempo, apenas atualiza a tela instantaneamente
            this.tick();
        }
    }

    async scheduleNotification() {
        // Pede permissão se ainda não tiver
        const perm = await LocalNotifications.requestPermissions();
        if (perm.display === 'granted') {
            await LocalNotifications.schedule({
                notifications: [{
                    id: 1,
                    title: "FocusQuest",
                    body: "Batalha Vencida! O monstro foi derrotado.",
                    schedule: { at: new Date(this.targetTime) },
                    sound: null // Usa o som padrão do sistema
                }]
            });
        }
    }
}
