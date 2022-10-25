import { initializeWallet } from './initialize.js';
import { PhantomWallet } from './wallet.js';
import type { WindowPhantom } from './window.js';

export function setup(phantom: WindowPhantom): void {
    initializeWallet(new PhantomWallet(phantom));
}
