import type { WalletsWindow } from '@wallet-standard/base';
import { GhostWallet } from './wallet.js';
import type { Ghost } from './window.js';

declare const window: WalletsWindow;

export function register(ghost: Ghost): void {
    try {
        (window.navigator.wallets ||= []).push(({ register }) => register(new GhostWallet(ghost)));
    } catch (error) {
        console.error(error);
    }
}
