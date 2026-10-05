import { ed25519 } from '@noble/curves/ed25519';
import { getAddressDecoder } from '@solana/addresses';
import type { SolanaSignMessageInput, SolanaSignMessageOutput } from '@solana/wallet-standard-features';
import { verifySignMessage } from '../signMessage.js';

describe('verifySignMessage()', () => {
    const secretKey = ed25519.utils.randomPrivateKey();
    const publicKey = ed25519.getPublicKey(secretKey);
    const address = getAddressDecoder().decode(publicKey);
    const otherAddress = getAddressDecoder().decode(ed25519.getPublicKey(ed25519.utils.randomPrivateKey()));
    const message = new TextEncoder().encode('hello');

    function signMessage(accountAddress = address): [SolanaSignMessageInput, SolanaSignMessageOutput] {
        return [
            { account: { address: accountAddress, publicKey, chains: [], features: [] }, message },
            { signedMessage: message, signature: ed25519.sign(message, secretKey), signatureType: 'ed25519' },
        ];
    }

    it('verifies a valid signed message', () => {
        expect(verifySignMessage(...signMessage())).toBe(true);
    });

    it('rejects an account address that does not match the public key', () => {
        expect(verifySignMessage(...signMessage(otherAddress))).toBe(false);
    });

    it('rejects a public key that is not 32 bytes', () => {
        const [input, output] = signMessage();
        const account = { ...input.account, publicKey: publicKey.slice(0, 31) };
        expect(verifySignMessage({ ...input, account }, output)).toBe(false);
    });

    it('rejects an invalid signature', () => {
        const [input, output] = signMessage();
        expect(verifySignMessage(input, { ...output, signature: new Uint8Array(64) })).toBe(false);
    });

    it('rejects a small-order public key', () => {
        // An all-zero public key (the address `11111111111111111111111111111111`) is a point of order 4, so a
        // signature with an identity point R and S = 0 is valid for any message under ZIP 215 verification.
        const smallOrderPublicKey = new Uint8Array(32);
        const smallOrderAddress = getAddressDecoder().decode(smallOrderPublicKey);
        const signature = new Uint8Array(64);
        signature[0] = 1;
        expect(
            verifySignMessage(
                {
                    account: { address: smallOrderAddress, publicKey: smallOrderPublicKey, chains: [], features: [] },
                    message,
                },
                { signedMessage: message, signature }
            )
        ).toBe(false);
    });

    it('rejects a public key that returns different bytes on each read', () => {
        // The address check reads the bytes with methods, and signature verification reads them with an iterator.
        const victimPublicKey = ed25519.getPublicKey(ed25519.utils.randomPrivateKey());
        const victimAddress = getAddressDecoder().decode(victimPublicKey);
        const proxy = new Proxy(new Uint8Array(victimPublicKey), {
            get(target, property) {
                if (property === Symbol.iterator) return publicKey[Symbol.iterator].bind(publicKey);
                const value = Reflect.get(target, property, target);
                return typeof value === 'function' ? value.bind(target) : value;
            },
        });
        const [input, output] = signMessage(victimAddress);
        expect(verifySignMessage({ ...input, account: { ...input.account, publicKey: proxy } }, output)).toBe(false);
    });
});
