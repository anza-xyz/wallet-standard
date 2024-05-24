import type { ReadonlyUint8Array } from '@wallet-standard/core';
import type { UiWalletAccount } from '@wallet-standard/react';
import { useSignMessage } from '@wallet-standard/react';
import React, { useCallback } from 'react';

import { BaseSignMessageFeaturePanel } from './BaseSignMessageFeaturePanel';

type Props = Readonly<{
    account: UiWalletAccount;
}>;

export function ExperimentalSignMessageFeaturePanel({ account }: Props) {
    const signMessageImpl = useSignMessage(account);
    const signMessage = useCallback(
        async (message: ReadonlyUint8Array) => {
            const { signature } = await signMessageImpl(message);
            return signature;
        },
        [signMessageImpl]
    );
    return <BaseSignMessageFeaturePanel signMessage={signMessage} />;
}
