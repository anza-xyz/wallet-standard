import { ed25519 } from '@noble/curves/ed25519';
import type { SolanaSignMessageInput, SolanaSignMessageOutput } from '@solana/wallet-standard-features';
import { bytesEqual } from './util.js';

/**
 * TODO: docs
 */
export function verifyMessageSignature({
    message,
    signedMessage,
    signature,
    publicKey,
}: {
    message: Uint8Array;
    signedMessage: Uint8Array;
    signature: Uint8Array;
    publicKey: Uint8Array;
}): boolean {
    // TODO: implement https://github.com/solana-labs/solana/blob/master/docs/src/proposals/off-chain-message-signing.md
    return bytesEqual(message, signedMessage) && ed25519.verify(signature, signedMessage, publicKey);
}

/**
 * TODO: docs
 */
export function verifySignMessage(input: SolanaSignMessageInput, output: SolanaSignMessageOutput): boolean {
    const {
        message,
        account: { publicKey },
    } = input;
    const { signedMessage, signature } = output;
    return verifyMessageSignature({ message, signedMessage, signature, publicKey });
}
