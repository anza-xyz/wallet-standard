import type { Adapter } from '@solana/wallet-adapter-base';
import { initialize } from '@wallet-standard/app';
import { isWalletAdapterCompatibleWallet, StandardWalletAdapter } from '@solana/wallet-standard-wallet-adapter-base';
import { useEffect, useState } from 'react';

export function useStandardWalletAdapters(wallets: Adapter[]): Adapter[] {
    // Start with the adapters provided by the app.
    const [adapters, setAdapters] = useState(wallets);

    useEffect(() => {
        // Initialize the `window.navigator.wallets` interface.
        const { get, on } = initialize();
        // Get wallets that have been registered already that can be wrapped as adapters.
        const walletAdapterCompatibleWallets = get().filter(isWalletAdapterCompatibleWallet);

        // Add an adapter for standard wallets that have been registered already.
        if (walletAdapterCompatibleWallets.length) {
            setAdapters((adapters) => [
                ...walletAdapterCompatibleWallets.map((wallet) => new StandardWalletAdapter({ wallet })),
                // Filter out adapters with the same name as registered standard wallets.
                ...adapters.filter(
                    (adapter) => !walletAdapterCompatibleWallets.some((wallet) => wallet.name === adapter.name)
                ),
            ]);
        }

        const destructors = [
            // Add an event listener to add adapters for standard wallets that are registered after this point.
            on('register', (...registered) => {
                const walletAdapterCompatibleWallets = registered.filter(isWalletAdapterCompatibleWallet);
                if (walletAdapterCompatibleWallets.length) {
                    setAdapters((adapters) => [
                        ...walletAdapterCompatibleWallets.map((wallet) => new StandardWalletAdapter({ wallet })),
                        // Filter out adapters with the same name as registered standard wallets.
                        ...adapters.filter(
                            (adapter) => !walletAdapterCompatibleWallets.some((wallet) => wallet.name === adapter.name)
                        ),
                    ]);
                }
            }),
            // Add an event listener to remove any adapters for wallets that are unregistered after this point.
            on('unregister', (...unregistered) => {
                const walletAdapterCompatibleWallets = unregistered.filter(isWalletAdapterCompatibleWallet);
                if (walletAdapterCompatibleWallets.length) {
                    setAdapters((adapters) =>
                        // Filter out adapters with the same name as unregistered wallets.
                        adapters.filter((adapter) =>
                            walletAdapterCompatibleWallets.some((wallet) => wallet.name === adapter.name)
                        )
                    );
                }
            }),
        ];

        return () => destructors.forEach((destroy) => destroy());
    }, []);

    return adapters;
}
