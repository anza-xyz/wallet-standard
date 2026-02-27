# Wallet Standard for Wallets

This guide is for wallets that want to implement the Wallet Standard. This can be done in essentially two ways.

- A. Write a wallet with a Wallet Standard compatible API.
- B. Wrap your existing API with a Wallet Standard compatible API.

These methods are similar, but since wallets that exist today already have their own APIs, we'll focus on the latter.

Take a look at the [reference implementation](https://github.com/solana-labs/wallet-standard/tree/master/packages/wallets/ghost) for our imaginary wallet, **Ghost**.

Ghost has an API very similar to Phantom's. Because many Solana wallets have a similar API, it should be simple to modify.

## 1. Make a copy
```shell
git clone https://github.com/solana-labs/wallet-standard --depth=1
cp -R wallet-standard/packages/wallets/ghost ghost
```

## 2. Setup git history
```shell
cd ghost
git init
git add .
git commit -m "Initial commit"
cd ..
```

## 3. Configure your wallet name
```shell
# Name of your wallet. This should be unique to your wallet. This will be the name dapps display for your wallet.
export MY_WALLET_NAME='Unique New York'
# Name of your wallet as a class in `PascalCase`.
export MY_WALLET_CLASS_NAME='UniqueNewYork'
# Name of your wallet as a variable in `camelCase`.
export MY_WALLET_VARIABLE_NAME='uniqueNewYork'
# Name of your wallet as a package in `dash-lower-case`.
export MY_WALLET_PACKAGE_NAME='unique-new-york'
```

## 4. Find and replace
```shell
mv ghost $MY_WALLET_PACKAGE_NAME
cd $MY_WALLET_PACKAGE_NAME

find . -name "package.json" -type f -exec sed -i '' "s/@solana\/wallet-standard-ghost/${MY_WALLET_PACKAGE_NAME}-standard-wallet/g" {} +
find src -type f -exec sed -i '' "s/'Ghost'/'${MY_WALLET_NAME}'/g" {} +
find src -type f -exec sed -i '' "s/Ghost/${MY_WALLET_CLASS_NAME}/g" {} +
find src -type f -exec sed -i '' "s/ghost/${MY_WALLET_VARIABLE_NAME}/g" {} +

git add .
git commit -m "Rename to ${MY_WALLET_NAME}"
```

The package is marked private since it doesn't need to be published on npm. It will only be used internally by your wallet.

If you want to customize the package name or metadata, open the `package.json` file and change these lines however you like.
```json
    "name": "unique-new-york-standard-wallet",
    "author": "Solana Maintainers <maintainers@solana.foundation>",
    "repository": "https://github.com/solana-labs/wallet-standard",
```

## 5. Install dependencies

```shell
npm install
git add .
git commit -m "Add package-lock.json"
```

## 6. Tùy chỉnh biểu tượng của bạn

Mở tệp ` src/icon.ts` . Tệp này chứa URI dữ liệu được mã hóa base64 của hình ảnh SVG, PNG, WebP hoặc GIF. Đây sẽ là biểu tượng mà ứng dụng phi tập trung (dapp) hiển thị cho ví của bạn.

``` ts
import { WalletIcon } from '@wallet-standard/base';

export const icon: WalletIcon =
    'data:image/svg+xml;base64,PHN2Zy......ZnPg==' as const;
```

Bạn có thể sử dụng một công cụ như https://base64.guru/converter/encode/image để mã hóa hình ảnh bằng cách sử dụng cài đặt "Data URI". Tốt hơn hết là bạn nên nén hình ảnh của mình không mất dữ liệu bằng một công cụ như https://imageoptim.com trước.

Tùy chỉnh kiểu MIME và dữ liệu biểu tượng của bạn, và đảm bảo giữ lại câu lệnh ` as const` của TypeScript ở cuối.

``` vỏ
git add .
git commit -m "Tùy chỉnh biểu tượng"
```

## 7. Xây dựng gói

``` vỏ
npm run build
```

Thao tác này sẽ xuất các tệp .js vào thư mục ` lib` .

## 8. Tùy chỉnh ví của bạn

Bước này phụ thuộc vào khả năng tài chính của bạn. Một số hoặc tất cả các thay đổi này có thể không áp dụng cho bạn, hoặc có thể cần được thực hiện theo cách khác.

Nếu ví của bạn có API hoặc sự kiện khác, hãy mở tệp ` src/window.ts` và tùy chỉnh chúng. Nếu bạn làm vậy, bạn sẽ cần thay đổi những thứ tương ứng trong tệp ` src/ wallet.ts` .

Nếu ví của bạn không hỗ trợ giao dịch có phiên bản, bạn nên thêm hỗ trợ cho chúng vào ví của mình thay vì thay đổi API trong ` src/ wallet.ts` .

Ideally, you should support all Solana clusters. If your wallet doesn't, open the `src/solana.ts` file. You can remove any you don't support, and remove them from the `SOLANA_CHAINS` constant.

```shell
npm run build
git add .
git commit -m "Customize wallet"
```

## 9. Consume the package

Your wallet probably does something like this in your extension's `contentScript` or in a webview.
```ts
window.uniqueNewYork = new UniqueNewYork();
```
Or, perhaps if you're being crafty,
```ts
Object.defineProperty(window, 'uniqueNewYork', { value: new UniqueNewYork() });
```

Instead, do this.
```ts
// Import the `initialize` function from your package.
import { initialize } from 'unique-new-york-standard-wallet';

// Create a reference to your wallet's existing API.
const uniqueNewYork = new UniqueNewYork();

// Register your wallet using the Wallet Standard, passing the reference.
initialize(uniqueNewYork);

// New wallets no longer need to register wallet globals - and can 
// ignore the code below. However if you have legacy apps relying on globals, 
// this is the safest way to attach the reference to the window, guarding against errors.
try {
    Object.defineProperty(window, 'uniqueNewYork', { value: uniqueNewYork });
}
catch (error) {
    console.error(error);
}
```

Your wallet now implements the Wallet Standard and registers itself on the window. This is all dapps need to detect and use it.

Even if another wallet uses "your" namespace (e.g. `window.solana`), the Standard Wallet you registered will work correctly.

## 10. Test your wallet

Open the Wallet Adapter demo https://solana-labs.github.io/wallet-adapter/example/ to test your wallet.

If your wallet implements the Wallet Standard, it will be detected by this example dapp.

## Appendix: Reference implementations

- [Ghost](https://github.com/solana-labs/wallet-standard/tree/master/packages/wallets/ghost)
- [Glow](https://github.com/glow-xyz/glow-js/tree/master/packages/wallet-standard) (owned by `glow-xyz` org)
- [Backpack](https://github.com/coral-xyz/backpack/tree/master/packages/wallet-standard) (owned by `coral-xyz` org)
