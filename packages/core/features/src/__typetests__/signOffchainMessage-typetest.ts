import type { ReadonlyUint8Array, WalletAccount } from '@wallet-standard/base';

import type {
    SolanaOffchainMessageVersion,
    SolanaSignOffchainMessageFeature,
    SolanaSignOffchainMessageInput,
    SolanaSignOffchainMessageInputV1,
    SolanaSignOffchainMessageMethod,
    SolanaSignOffchainMessageOutput,
    SolanaSignOffchainMessageVersion,
} from '../signOffchainMessage.js';

const account = null as unknown as WalletAccount;

// [DESCRIBE] `SolanaSignOffchainMessageInput`
{
    // The only input variant is currently the version 1 input.
    {
        const input = null as unknown as SolanaSignOffchainMessageInput;
        input satisfies SolanaSignOffchainMessageInputV1;
    }
}

// [DESCRIBE] `SolanaSignOffchainMessageInputV1`
{
    // A fully specified version 1 input satisfies the type.
    {
        ({
            account,
            message: "",
            messageVersion: 1,
            requiredSigners: [new Uint8Array()],
        }) satisfies SolanaSignOffchainMessageInputV1;
    }

    // The `messageVersion` must be exactly `1`.
    {
        // @ts-expect-error Version 0 is not a supported message version.
        0 satisfies SolanaSignOffchainMessageInputV1['messageVersion'];
    }
}

// [DESCRIBE] `requiredSigners` ergonomics with `WalletAccount`
{
    // It accepts the public key of a `WalletAccount` directly, without casting.
    // `WalletAccount['publicKey']` is a `ReadonlyUint8Array`, so requiring `Uint8Array` here would
    // force callers to cast.
    {
        ({
            account,
            message: "",
            messageVersion: 1,
            requiredSigners: [account.publicKey],
        }) satisfies SolanaSignOffchainMessageInputV1;
    }

    // It accepts an array of `WalletAccount` public keys built with `.map()`, without casting.
    // A plain array (rather than a non-empty tuple) means `.map()` results need no `as [...]` cast.
    {
        const accounts = null as unknown as WalletAccount[];
        const requiredSigners = accounts.map((a) => a.publicKey);
        requiredSigners satisfies SolanaSignOffchainMessageInputV1['requiredSigners'];
    }

    // Its elements are `ReadonlyUint8Array` (the same type as `WalletAccount['publicKey']`).
    {
        const element = null as unknown as SolanaSignOffchainMessageInputV1['requiredSigners'][number];
        element satisfies ReadonlyUint8Array;
        element satisfies WalletAccount['publicKey'];
    }

    // It rejects values that are not byte arrays.
    {
        // @ts-expect-error A list of strings is not a list of public keys.
        const requiredSigners: SolanaSignOffchainMessageInputV1['requiredSigners'] = ['not a public key'];
    }
}

// [DESCRIBE] `SolanaSignOffchainMessageOutput`
{
    // A minimal output satisfies the type.
    {
        ({
            signature: new Uint8Array(),
            signedOffchainMessage: new Uint8Array(),
        }) satisfies SolanaSignOffchainMessageOutput;
    }

    // `signatureType`, when present, must be `'ed25519'`.
    {
        ({
            signature: new Uint8Array(),
            signatureType: 'ed25519',
            signedOffchainMessage: new Uint8Array(),
        }) satisfies SolanaSignOffchainMessageOutput;

        ({
            signature: new Uint8Array(),
            // @ts-expect-error Only `'ed25519'` is a supported signature type.
            signatureType: 'secp256k1',
            signedOffchainMessage: new Uint8Array(),
        }) satisfies SolanaSignOffchainMessageOutput;
    }

    // The `signature` can be readonly.
    {
        null as unknown as ReadonlyUint8Array satisfies SolanaSignOffchainMessageOutput['signature'];
    }

    // The `signedOffchainMessage` can be readonly.
    {
        null as unknown as ReadonlyUint8Array satisfies SolanaSignOffchainMessageOutput['signedOffchainMessage'];
    }
}

// [DESCRIBE] `SolanaSignOffchainMessageMethod`
{
    // It is variadic over inputs and resolves to a list of outputs.
    {
        const signOffchainMessage = null as unknown as SolanaSignOffchainMessageMethod;
        const input = null as unknown as SolanaSignOffchainMessageInput;
        signOffchainMessage(input, input) satisfies Promise<readonly SolanaSignOffchainMessageOutput[]>;
    }
}

// [DESCRIBE] `SolanaSignOffchainMessageFeature`
{
    // The feature is keyed by the `solana:signOffchainMessage` identifier.
    {
        const feature = null as unknown as SolanaSignOffchainMessageFeature;
        feature['solana:signOffchainMessage'].version satisfies SolanaSignOffchainMessageVersion;
        feature['solana:signOffchainMessage']
            .supportedMessageVersions satisfies readonly SolanaOffchainMessageVersion[];
        feature['solana:signOffchainMessage'].signOffchainMessage satisfies SolanaSignOffchainMessageMethod;
    }
}

// [DESCRIBE] `SolanaSignOffchainMessageVersion`
{
    // The current feature API version is `'1.0.0'`.
    {
        '1.0.0' satisfies SolanaSignOffchainMessageVersion;
        // @ts-expect-error `'2.0.0'` is not a supported feature API version.
        '2.0.0' satisfies SolanaSignOffchainMessageVersion;
    }
}

// [DESCRIBE] `SolanaOffchainMessageVersion`
{
    // The only supported offchain message specification version is `1`.
    {
        1 satisfies SolanaOffchainMessageVersion;
        // @ts-expect-error `0` is not a supported offchain message specification version.
        0 satisfies SolanaOffchainMessageVersion;
    }
}
