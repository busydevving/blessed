import { createConfig, http, cookieStorage, createStorage } from 'wagmi';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';
import { hyperEvm, elysium } from './chains';

const wcProjectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;

export const wagmiConfig = createConfig({
  chains: [hyperEvm, elysium],
  connectors: [
    injected({ shimDisconnect: true }),
    ...(wcProjectId
      ? [walletConnect({
          projectId: wcProjectId,
          showQrModal: true,
          metadata: {
            name: 'Blessed',
            description: 'Every meme, blessed by a stock.',
            url: 'https://blessed.fun',
            icons: ['https://blessed.fun/icon.svg'],
          },
        })]
      : []),
    coinbaseWallet({ appName: 'Blessed' }),
  ],
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
