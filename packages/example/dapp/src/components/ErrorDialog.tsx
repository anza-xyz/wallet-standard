import { AlertDialog, Blockquote, Button, Flex } from '@radix-ui/themes';
import React from 'react';
import { getErrorMessage } from '../errors';

type Props = Readonly<{
    error: unknown;
    onClose(): void;
}>;

export function ErrorDialog({ error, onClose }: Props) {
    return (
        <AlertDialog.Root
            open={true}
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
        >
            <AlertDialog.Content>
                <AlertDialog.Title color="red">We encountered the following error</AlertDialog.Title>
                <AlertDialog.Description>
                    <Blockquote>{getErrorMessage(error, 'Unknown')}</Blockquote>
                </AlertDialog.Description>
                <Flex mt="4" justify="end">
                    <AlertDialog.Action>
                        <Button variant="solid">Close</Button>
                    </AlertDialog.Action>
                </Flex>
            </AlertDialog.Content>
        </AlertDialog.Root>
    );
}
