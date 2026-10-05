import { ed25519 } from '@noble/curves/ed25519';
import { getAddressDecoder } from '@solana/addresses';
import type { SolanaSignInInput, SolanaSignInOutput } from '@solana/wallet-standard-features';
import {
    createSignInMessage,
    createSignInMessageText,
    deriveSignInMessage,
    deriveSignInMessageText,
    parseSignInMessage,
    parseSignInMessageText,
    type SolanaSignInInputWithRequiredFields,
    verifySignIn,
} from '../signIn.js';

const signInMessageTests = {
    'with `domain` and `address`': {
        parsed: {
            domain: 'solana.com',
            address: 'A',
        },
        text: 'solana.com wants you to sign in with your Solana account:\nA',
    },
    'with `statement`': {
        parsed: {
            domain: 'solana.com',
            address: 'A',
            statement: 'S',
        },
        text: 'solana.com wants you to sign in with your Solana account:\nA\n\nS',
    },
    'with multi-line `statement`': {
        parsed: {
            domain: 'solana.com',
            address: 'A',
            statement: 'S\n\nS',
        },
        text: 'solana.com wants you to sign in with your Solana account:\nA\n\nS\n\nS',
    },
    'with fields': {
        parsed: {
            domain: 'solana.com',
            address: 'A',
            uri: 'https://solana.com',
        },
        text: 'solana.com wants you to sign in with your Solana account:\nA\n\nURI: https://solana.com',
    },
    'with `statement` and fields': {
        parsed: {
            domain: 'solana.com',
            address: 'A',
            statement: 'S',
            uri: 'https://solana.com',
        },
        text: 'solana.com wants you to sign in with your Solana account:\nA\n\nS\n\nURI: https://solana.com',
    },
    'with multi-line `statement` and fields': {
        parsed: {
            domain: 'solana.com',
            address: 'A',
            statement: 'S\n\nS',
            uri: 'https://solana.com',
        },
        text: 'solana.com wants you to sign in with your Solana account:\nA\n\nS\n\nS\n\nURI: https://solana.com',
    },
};

describe('verifySignIn()', () => {
    const secretKey = ed25519.utils.randomPrivateKey();
    const publicKey = ed25519.getPublicKey(secretKey);
    const address = getAddressDecoder().decode(publicKey);
    const otherAddress = getAddressDecoder().decode(ed25519.getPublicKey(ed25519.utils.randomPrivateKey()));

    function signIn(
        input: SolanaSignInInput,
        { messageAddress = address, accountAddress = address } = {}
    ): SolanaSignInOutput {
        const signedMessage = createSignInMessage({ ...input, domain: 'solana.com', address: messageAddress });
        return {
            account: { address: accountAddress, publicKey, chains: [], features: [] },
            signedMessage,
            signature: ed25519.sign(signedMessage, secretKey),
            signatureType: 'ed25519',
        };
    }

    it('verifies a valid sign in', () => {
        const input = { domain: 'solana.com', address };
        expect(verifySignIn(input, signIn(input))).toBe(true);
    });

    it('verifies a valid sign in without an input address', () => {
        const input = { domain: 'solana.com' };
        expect(verifySignIn(input, signIn(input))).toBe(true);
    });

    it('rejects an account address that does not match the public key', () => {
        const input = { domain: 'solana.com' };
        expect(verifySignIn(input, signIn(input, { messageAddress: otherAddress, accountAddress: otherAddress }))).toBe(
            false
        );
    });

    it('rejects a message address that does not match the account address', () => {
        const input = { domain: 'solana.com' };
        expect(verifySignIn(input, signIn(input, { messageAddress: otherAddress }))).toBe(false);
    });

    it('rejects a public key that is not 32 bytes', () => {
        const input = { domain: 'solana.com' };
        const output = signIn(input);
        const account = { ...output.account, publicKey: new Uint8Array([...publicKey, 0]) };
        expect(verifySignIn(input, { ...output, account })).toBe(false);
    });

    it('rejects an invalid signature', () => {
        const input = { domain: 'solana.com' };
        const output = signIn(input);
        expect(verifySignIn(input, { ...output, signature: new Uint8Array(64) })).toBe(false);
    });

    it('rejects a small-order public key', () => {
        // An all-zero public key (the address `11111111111111111111111111111111`) is a point of order 4, so a
        // signature with an identity point R and S = 0 is valid for any message under ZIP 215 verification.
        const smallOrderPublicKey = new Uint8Array(32);
        const smallOrderAddress = getAddressDecoder().decode(smallOrderPublicKey);
        const signature = new Uint8Array(64);
        signature[0] = 1;
        const input = { domain: 'solana.com' };
        const output: SolanaSignInOutput = {
            account: { address: smallOrderAddress, publicKey: smallOrderPublicKey, chains: [], features: [] },
            signedMessage: createSignInMessage({ ...input, address: smallOrderAddress }),
            signature,
        };
        expect(verifySignIn(input, output)).toBe(false);
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
        const input = { domain: 'solana.com' };
        const output = signIn(input, { messageAddress: victimAddress, accountAddress: victimAddress });
        expect(verifySignIn(input, { ...output, account: { ...output.account, publicKey: proxy } })).toBe(false);
    });
});

// `deriveSignInMessage()` and `deriveSignInMessageText()` don't verify signatures, so a dummy key and arbitrary
// address strings are enough to exercise them.
function signInOutput(
    message: SolanaSignInInputWithRequiredFields,
    accountAddress: string = message.address
): SolanaSignInOutput {
    return {
        account: { address: accountAddress, publicKey: new Uint8Array(32), chains: [], features: [] },
        signedMessage: createSignInMessage(message),
        signature: new Uint8Array(64),
        signatureType: 'ed25519',
    };
}

describe('deriveSignInMessage()', () => {
    it('derives the signed message when the input matches', () => {
        const input = { domain: 'solana.com', address: 'A' };
        const output = signInOutput(input);
        expect(deriveSignInMessage(input, output)).toEqual(output.signedMessage);
    });

    it('returns null when the input does not match', () => {
        const input = { domain: 'solana.com', address: 'A' };
        expect(deriveSignInMessage({ ...input, nonce: 'N' }, signInOutput(input))).toBeNull();
    });
});

describe('deriveSignInMessageText()', () => {
    for (const [name, test] of Object.entries(signInMessageTests)) {
        it(name, () => {
            expect(deriveSignInMessageText(test.parsed, signInOutput(test.parsed))).toBe(test.text);
        });
    }

    it('derives the message text without an input address', () => {
        const message = { domain: 'solana.com', address: 'A' };
        const { address: _, ...input } = message;
        expect(deriveSignInMessageText(input, signInOutput(message))).toBe(createSignInMessageText(message));
    });

    it('derives the message text without an input domain', () => {
        const message = { domain: 'solana.com', address: 'A' };
        const { domain: _, ...input } = message;
        expect(deriveSignInMessageText(input, signInOutput(message))).toBe(createSignInMessageText(message));
    });

    it('returns null when the message address does not match the account address', () => {
        const message = { domain: 'solana.com', address: 'A' };
        expect(deriveSignInMessageText({ domain: 'solana.com' }, signInOutput(message, 'B'))).toBeNull();
    });

    it('returns null when the input address does not match the message address', () => {
        const message = { domain: 'solana.com', address: 'A' };
        expect(deriveSignInMessageText({ ...message, address: 'B' }, signInOutput(message))).toBeNull();
    });

    it('returns null when the input domain does not match the message domain', () => {
        const message = { domain: 'solana.com', address: 'A' };
        expect(deriveSignInMessageText({ ...message, domain: 'example.com' }, signInOutput(message))).toBeNull();
    });

    it('returns null when a field does not match', () => {
        const message = { domain: 'solana.com', address: 'A', nonce: 'N' };
        expect(deriveSignInMessageText({ ...message, nonce: 'M' }, signInOutput(message))).toBeNull();
        expect(deriveSignInMessageText({ domain: 'solana.com', address: 'A' }, signInOutput(message))).toBeNull();
    });

    it('returns null when the signed message cannot be parsed', () => {
        const input = { domain: 'solana.com', address: 'A' };
        const output = { ...signInOutput(input), signedMessage: new TextEncoder().encode('not a sign in message') };
        expect(deriveSignInMessageText(input, output)).toBeNull();
    });
});

describe.skip('parseSignInMessage()', () => {});

describe('parseSignInMessageText()', () => {
    for (const [name, test] of Object.entries(signInMessageTests)) {
        it(name, () => {
            const parsed = parseSignInMessageText(test.text);
            expect(parsed).toEqual(test.parsed);
        });
    }
});

describe.skip('createSignInMessage()', () => {});

describe('createSignInMessageText()', () => {
    for (const [name, test] of Object.entries(signInMessageTests)) {
        it(name, () => {
            const text = createSignInMessageText(test.parsed);
            expect(text).toBe(test.text);
        });
    }
});
