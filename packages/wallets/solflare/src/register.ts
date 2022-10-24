import { setupWindowNavigatorWallets } from './setup.js';
import { SolflareWallet } from './wallet.js';

export function register(): void {
    try {
        setupWindowNavigatorWallets(({ register }) => register(new SolflareWallet()));
    } catch (error) {
        console.error(error);
    }
}
