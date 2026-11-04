import { createConfig, http, cookieStorage, createStorage, injected } from 'wagmi';
import { hyperEvm, elysium } from './chains';

// Only the injected connector, imported from 'wagmi' itself. Importing from 'wagmi/connectors' pulls in every
// connector SDK (Base Account → Coinbase CDP → optional x402 packages), and that breaks the Next build.
// EIP-6963 discovery is on by default, so MetaMask, Rabby, Phantom, OKX and other browser wallets each show
// up by name.
// TODO(backend): to add WalletConnect, `npm i @wagmi/connectors @walletconnect/ethereum-provider` and import
// walletConnect from '@wagmi/connectors/walletConnect' (a deep import, not the barrel).
export const wagmiConfig = createConfig({
  chains: [hyperEvm, elysium],
  connectors: [injected({ shimDisconnect: true })],
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
  transports: {
    [hyperEvm.id]: http(),
    [elysium.id]: http(),
  },
});

declare module 'wagmi' {
  interface Register { config: typeof wagmiConfig }
}
