import { Box, DropdownMenu, Text } from '@radix-ui/themes';
import type { UiWallet } from '@wallet-standard/react';
import React, { useState } from 'react';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

import { ErrorDialog } from './ErrorDialog';
import { WalletMenuItemContent } from './WalletMenuItemContent';

type Props = Readonly<{
    error: unknown;
    wallet: UiWallet;
}>;

export function UnconnectableWalletMenuItem({ error, wallet }: Props) {
    const [dialogIsOpen, setDialogIsOpen] = useState(false);
    return (
        <>
            <DropdownMenu.Item disabled onClick={() => setDialogIsOpen(true)}>
                <WalletMenuItemContent wallet={wallet}>
                    <Text style={{ textDecoration: 'line-through' }}>{wallet.name}</Text>
                </WalletMenuItemContent>
                <Box className="rt-BaseMenuShortcut rt-DropdownMenuShortcut">
                    <ExclamationTriangleIcon
                        className="rt-BaseMenuSubTriggerIcon rt-DropdownMenuSubtriggerIcon"
                        style={{ width: 14, height: 14 }}
                    />
                </Box>
            </DropdownMenu.Item>
            {dialogIsOpen ? <ErrorDialog error={error} onClose={() => setDialogIsOpen(false)} /> : null}
        </>
    );
}
