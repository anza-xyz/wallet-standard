import { setupWindowNavigatorWallets } from './setup.js';
import { PhantomWallet } from './wallet.js';
import type { WindowPhantom } from './window.js';

export function register(phantom: WindowPhantom): void {
    try {
        setupWindowNavigatorWallets(({ register }) => register(new PhantomWallet(phantom)));
    } catch (error) {
        console.error(error);
    }
}
