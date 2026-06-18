# @solana/wallet-standard-features

## 1.4.0

### Minor Changes

- 38d855c: Add the `solana:signOffchainMessage` feature, allowing dapps to request that a wallet sign offchain messages conforming to the Solana offchain message signing specification.

### Patch Changes

- 8c6fc57: Loosen the `node` and `pnpm` engine constraints (`node` to `>=22`, `pnpm` to `^10`) so the packages can be installed in a wider range of environments.

## 1.3.0

### Minor Changes

- 013d501: Add solana:signAndSendAllTransactions feature

### Patch Changes

- 013d501: Update dependencies and fix types

## 1.2.0

### Minor Changes

- f8618d5: Add `mode` option to `signAndSendTransaction` input

## 1.1.0

### Minor Changes

- f10d202: Add `solana:signIn` (Sign In With Solana) feature

## 1.0.1

### Patch Changes

- 9be9ef3: Use latest @solana/wallet-adapter-base, export reusable feature names

## 1.0.0

### Major Changes

- ba56499: Release v1.0.0 of all packages
