---
'@solana/wallet-standard': patch
'@solana/wallet-standard-core': patch
'@solana/wallet-standard-chains': patch
'@solana/wallet-standard-features': patch
'@solana/wallet-standard-util': patch
'@solana/wallet-standard-wallet-adapter': patch
'@solana/wallet-standard-wallet-adapter-base': patch
'@solana/wallet-standard-wallet-adapter-react': patch
---

Loosen the `node` and `pnpm` engine constraints (`node` to `>=22`, `pnpm` to `^10`) so the packages can be installed in a wider range of environments.
