import { initializeWallet } from './initialize.js';
import { SolflareWallet } from './wallet.js';

export function setup(): void {
    initializeWallet(new SolflareWallet());
}
