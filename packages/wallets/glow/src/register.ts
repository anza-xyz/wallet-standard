import type { WalletsWindow } from '@wallet-standard/base';
import { GlowWallet } from './wallet.js';

declare const window: WalletsWindow;

export function register(): void {
    try {
        (window.navigator.wallets ||= []).push(({ register }) => register(new GlowWallet()));
    } catch (error) {
        console.error(error);
    }
}
