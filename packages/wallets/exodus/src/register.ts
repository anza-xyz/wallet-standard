import type { WalletsWindow } from '@wallet-standard/base';
import { ExodusWallet } from './wallet.js';

declare const window: WalletsWindow;

export function register(): void {
    try {
        (window.navigator.wallets ||= []).push(({ register }) => register(new ExodusWallet()));
    } catch (error) {
        console.error(error);
    }
}
