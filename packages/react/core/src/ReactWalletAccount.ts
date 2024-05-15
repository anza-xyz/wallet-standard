import type { ReadonlyUint8Array, WalletAccount } from '@wallet-standard/base';

import type { ReactWallet } from './ReactWallet.js';
import type { WalletHandle } from './WalletHandleRegistry_INTERNAL_ONLY_NOT_FOR_EXPORT.js';
import { getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED } from './WalletHandleRegistry_INTERNAL_ONLY_NOT_FOR_EXPORT.js';

export type ReactWalletAccount = WalletHandle &
    Pick<WalletAccount, 'address' | 'chains' | 'icon' | 'label'> &
    Readonly<{
        publicKey: ReadonlyUint8Array;
    }>;

export function getReactWalletAccountStorageKey(reactWalletAccount: ReactWalletAccount): string {
    const underlyingWallet = getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(reactWalletAccount);
    return `${underlyingWallet.name.replace(':', '_')}:${reactWalletAccount.address}`;
}

export function reactWalletAccountsAreSame(a: ReactWalletAccount, b: ReactWalletAccount): boolean {
    if (a.address !== b.address) {
        return false;
    }
    const underlyingWalletA = getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(a);
    const underlyingWalletB = getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(b);
    return underlyingWalletA === underlyingWalletB;
}

export function reactWalletAccountBelongsToReactWallet(account: ReactWalletAccount, wallet: ReactWallet): boolean {
    const underlyingWalletForReactWallet = getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(wallet);
    const underlyingWalletForReactWalletAccount = getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(account);
    return underlyingWalletForReactWallet === underlyingWalletForReactWalletAccount;
}
