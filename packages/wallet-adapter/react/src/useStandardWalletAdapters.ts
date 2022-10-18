import type { Adapter } from '@solana/wallet-adapter-base';
import { isWalletAdapterCompatibleWallet, StandardWalletAdapter } from '@solana/wallet-standard-wallet-adapter-base';
import { initialize } from '@wallet-standard/app';
import type { Wallet } from '@wallet-standard/base';
import { useEffect, useState } from 'react';

export function useStandardWalletAdapters(initialAdapters: Adapter[]): Adapter[] {
    // Start with the adapters provided by the app.
    const [adapters, setAdapters] = useState(initialAdapters);

    useEffect(() => {
        function wrapWalletsWithAdapters(wallets: ReadonlyArray<Wallet>) {
            const standardAdapters = wallets
                .filter(isWalletAdapterCompatibleWallet)
                .map((wallet) => new StandardWalletAdapter({ wallet }));
            if (standardAdapters.length) {
                setAdapters((adapters) => [
                    ...standardAdapters,
                    // Filter out adapters with the same name as registered standard wallets.
                    ...adapters.filter((adapter) => {
                        if (standardAdapters.some((standardAdapter) => standardAdapter.name === adapter.name)) {
                            if (!(adapter instanceof StandardWalletAdapter)) {
                                console.warn(
                                    `${adapter.name} was registered as a Standard Wallet. The Wallet Adapter for ${adapter.name} can be removed from your app.`
                                );
                            }
                            return false;
                        }
                        return true;
                    }),
                ]);
            }
        }

        // Initialize the `window.navigator.wallets` interface.
        const { get, on } = initialize();
        // Get wallets that have been registered already and wrap them with adapters.
        wrapWalletsWithAdapters(get());

        const destructors = [
            // Add an event listener to add adapters for wallets that are registered after this point.
            on('register', (...wallets) => wrapWalletsWithAdapters(wallets)),
            // Add an event listener to remove adapters for wallets that are unregistered after this point.
            on('unregister', (...wallets) => {
                wallets = wallets.filter(isWalletAdapterCompatibleWallet);
                if (wallets.length) {
                    setAdapters((adapters) =>
                        // Filter out adapters with the same name as unregistered wallets.
                        adapters.filter((adapter) => wallets.some((wallet) => wallet.name === adapter.name))
                    );
                }
            }),
        ];

        return () => destructors.forEach((destroy) => destroy());
    }, []);

    return adapters;
}
