import { registerWallet } from './register.js';
import { SolflareWallet } from './wallet.js';

export function initialize(): void {
    registerWallet(new SolflareWallet());
}
