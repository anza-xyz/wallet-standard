import type { Adapter, WalletName } from '@solana/wallet-adapter-base';
import { isWalletAdapterCompatibleWallet, StandardWalletAdapter } from '@solana/wallet-standard-wallet-adapter-base';
import { DEPRECATED_getWallets } from '@wallet-standard/app';
import type { Wallet } from '@wallet-standard/base';
import { useEffect, useMemo, useRef, useState } from 'react';

export function useStandardWalletAdapters(adapters: Adapter[]): Adapter[] {
    const warnings = useConstant(() => new Set<WalletName>());
    const { get, on } = useConstant(() => DEPRECATED_getWallets());
    const [standardAdapters, setStandardAdapters] = useState(() => wrapWalletsWithAdapters(get()));

    useEffect(() => {
        const listeners = [
            on('register', (...wallets) =>
                setStandardAdapters((standardAdapters) => [...standardAdapters, ...wrapWalletsWithAdapters(wallets)])
            ),
            on('unregister', (...wallets) =>
                setStandardAdapters((standardAdapters) =>
                    standardAdapters.filter((standardAdapter) =>
                        wallets.some((wallet) => wallet === standardAdapter.wallet)
                    )
                )
            ),
        ];
        return () => listeners.forEach((off) => off());
    }, [on]);

    const prevStandardAdapters = usePrevious(standardAdapters);
    useEffect(() => {
        if (!prevStandardAdapters) return;

        const currentAdapters = new Set(standardAdapters);
        const removedAdapters = new Set(
            prevStandardAdapters.filter((previousAdapter) => !currentAdapters.has(previousAdapter))
        );
        removedAdapters.forEach((adapter) => adapter.destroy());
    }, [prevStandardAdapters, standardAdapters]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => () => standardAdapters.forEach((adapter) => adapter.destroy()), []);

    return useMemo(
        () => [
            ...standardAdapters,
            ...adapters.filter(({ name }) => {
                if (standardAdapters.some((standardAdapter) => standardAdapter.name === name)) {
                    if (!warnings.has(name)) {
                        warnings.add(name);
                        console.warn(
                            `${name} was registered as a Standard Wallet. The Wallet Adapter for ${name} can be removed from your app.`
                        );
                    }
                    return false;
                }
                return true;
            }),
        ],
        [standardAdapters, adapters, warnings]
    );
}

function useConstant<T>(fn: () => T): T {
    const ref = useRef<{ value: T }>();
    if (!ref.current) {
        ref.current = { value: fn() };
    }
    return ref.current.value;
}

function usePrevious<T>(state: T): T | undefined {
    const ref = useRef<T>();
    useEffect(() => {
        ref.current = state;
    });
    return ref.current;
}

function wrapWalletsWithAdapters(wallets: readonly Wallet[]): readonly StandardWalletAdapter[] {
    return wallets.filter(isWalletAdapterCompatibleWallet).map((wallet) => new StandardWalletAdapter({ wallet }));
}
