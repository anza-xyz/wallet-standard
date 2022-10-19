import type { WalletsWindow } from '@wallet-standard/base';
import { PhantomWallet } from './wallet.js';
import type { WindowPhantom } from './window.js';

declare const window: WalletsWindow;

export function register(phantom: WindowPhantom): void {
    try {
        (window.navigator.wallets ||= []).push(({ register }) => register(new PhantomWallet(phantom)));
    } catch (error) {
        console.error(error);
    }
}
