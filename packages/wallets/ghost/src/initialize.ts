import { registerWallet } from './register.js';
import { GhostWallet } from './wallet.js';
import type { Ghost } from './window.js';

export function initialize(ghost: Ghost): void {
    registerWallet(new GhostWallet(ghost));
}
