import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Custom AMM DEX',
  // CRITICAL: Get a free ID from https://walletconnect.com
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || 'YOUR_ACTUAL_PROJECT_ID_STRING',
  chains: [mainnet, sepolia],
  ssr: true, // CRITICAL: Tells Wagmi to handle Next.js pre-rendering safely
});
