import type { IdentifierArray, Wallet, WalletAccount } from '@wallet-standard/base';
import {
    WALLET_STANDARD_ERROR__REGISTRY__WALLET_ACCOUNT_NOT_FOUND,
    WALLET_STANDARD_ERROR__REGISTRY__WALLET_NOT_FOUND,
    WalletStandardError,
    safeCaptureStackTrace,
} from '@wallet-standard/errors';
import type { ReactWalletAccount } from './ReactWalletAccount.js';

export type WalletHandle = {
    readonly '~walletHandle': unique symbol;
    readonly features: IdentifierArray;
};

const walletHandlesToWallets = new WeakMap<WalletHandle, Wallet>();

export function registerWalletHandle_INTERNAL_ONLY_NOT_FOR_EXPORT(walletHandle: WalletHandle, wallet: Wallet): void {
    walletHandlesToWallets.set(walletHandle, wallet);
}

export function getWalletAccountForReactWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(
    reactWalletAccount: ReactWalletAccount
): WalletAccount {
    const wallet = getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(reactWalletAccount);
    const account = wallet.accounts.find(({ address }) => address === reactWalletAccount.address);
    if (!account) {
        const err = new WalletStandardError(WALLET_STANDARD_ERROR__REGISTRY__WALLET_ACCOUNT_NOT_FOUND, {
            address: reactWalletAccount.address,
            walletName: wallet.name,
        });
        safeCaptureStackTrace(err, getWalletAccountForReactWalletAccount_DO_NOT_USE_OR_YOU_WILL_BE_FIRED);
        throw err;
    }
    return account;
}

export function getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(walletHandle: WalletHandle): Wallet {
    const wallet = walletHandlesToWallets.get(walletHandle);
    if (!wallet) {
        const err = new WalletStandardError(WALLET_STANDARD_ERROR__REGISTRY__WALLET_NOT_FOUND);
        safeCaptureStackTrace(err, getWalletForHandle_DO_NOT_USE_OR_YOU_WILL_BE_FIRED);
        throw err;
    }
    return wallet;
}
