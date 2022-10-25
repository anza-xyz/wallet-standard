import { initializeWallet } from './initialize.js';
import { GhostWallet } from './wallet.js';
import type { Ghost } from './window.js';

export function setup(ghost: Ghost): void {
    initializeWallet(new GhostWallet(ghost));
}
