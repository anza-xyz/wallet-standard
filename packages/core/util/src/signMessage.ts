import { ed25519 } from '@noble/curves/ed25519';
import type { SolanaSignMessageInput, SolanaSignMessageOutput } from '@solana/wallet-standard-features';
import { addressMatchesPublicKey, bytesEqual, copyBytes } from './util.js';

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
    // Copy the bytes so the message that's compared is the message that's verified.
    const messageBytes = copyBytes(message);
    const signedMessageBytes = copyBytes(signedMessage);
    const signatureBytes = copyBytes(signature);
    const publicKeyBytes = copyBytes(publicKey);
    if (!messageBytes || !signedMessageBytes || !signatureBytes || !publicKeyBytes) return false;
    return (
        bytesEqual(messageBytes, signedMessageBytes) &&
        // Use strict RFC 8032 verification. The default (ZIP 215) accepts small-order public keys, for which a fixed
        // signature is valid for any message.
        ed25519.verify(signatureBytes, signedMessageBytes, publicKeyBytes, { zip215: false })
    );
}

/**
 * TODO: docs
 */
export function verifySignMessage(input: SolanaSignMessageInput, output: SolanaSignMessageOutput): boolean {
    const {
        message,
        account: { address, publicKey },
    } = input;
    const { signedMessage, signature } = output;
    // Copy the public key so the key that's checked against the address is the key that's verified.
    const publicKeyBytes = copyBytes(publicKey);
    return (
        !!publicKeyBytes &&
        addressMatchesPublicKey(address, publicKeyBytes) &&
        verifyMessageSignature({ message, signedMessage, signature, publicKey: publicKeyBytes })
    );
}
