import { setupWindowNavigatorWallets } from './setup.js';
import { GhostWallet } from './wallet.js';
import type { Ghost } from './window.js';

export function register(ghost: Ghost): void {
    try {
        setupWindowNavigatorWallets(({ register }) => register(new GhostWallet(ghost)));
    } catch (error) {
        console.error(error);
    }
}
