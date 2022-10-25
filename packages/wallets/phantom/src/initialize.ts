import { registerWallet } from './register.js';
import { PhantomWallet } from './wallet.js';
import type { WindowPhantom } from './window.js';

export function initialize(phantom: WindowPhantom): void {
    registerWallet(new PhantomWallet(phantom));
}
