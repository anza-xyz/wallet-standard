import { registerWallet } from './register.js';
import { XDEFIWalletWallet } from './wallet.js';
import type { XDEFIWallet } from './window.js';

export function initialize(xdefiWallet: XDEFIWallet): void {
    registerWallet(new XDEFIWalletWallet(xdefiWallet));
}
