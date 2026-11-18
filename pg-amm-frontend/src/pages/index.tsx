import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract } from 'wagmi';
import { parseEther } from 'viem';

// Set your deployed addresses from Remix here
const AMM_CONTRACT_ADDRESS = "0xYourAMMContractAddress";
const TOKEN0_ADDRESS = "0xYourToken0Address";
const TOKEN1_ADDRESS = "0xYourToken1Address";

const AMM_ABI = [
  {
    inputs: [
      { name: "amount0", type: "uint256" },
      { name: "amount1", type: "uint256" }
    ],
    name: "addLiquidity",
    outputs: [],
    stateMutability: "external",
    type: "function"
  },
  {
    inputs: [
      { name: "tokenIn", type: "address" },
      { name: "amountIn", type: "uint256" }
    ],
    name: "swap",
    outputs: [],
    stateMutability: "external",
    type: "function"
  }
] as const;

const ERC20_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "external",
    type: "function"
  }
] as const;

const Home: NextPage = () => {
  const { isConnected } = useAccount();
  const { writeContract, isPending } = useWriteContract();

  // Safety flag to prevent WebSocket compilation crashes during Next.js SSR hydration
  const [mounted, setMounted] = useState<boolean>(false);

  const [swapAmount, setSwapAmount] = useState<string>('');
  const [selectedTokenIn, setSelectedTokenIn] = useState<string>(TOKEN0_ADDRESS);
  const [liqAmount0, setLiqAmount0] = useState<string>('');
  const [liqAmount1, setLiqAmount1] = useState<string>('');

  // Runs instantly upon browser mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleApprove = (tokenAddress: string) => {
    writeContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [AMM_CONTRACT_ADDRESS, parseEther('1000000')],
    });
  };

  const handleAddLiquidity = () => {
    if (!liqAmount0 || !liqAmount1) return;
    writeContract({
      address: AMM_CONTRACT_ADDRESS,
      abi: AMM_ABI,
      functionName: 'addLiquidity',
      args: [parseEther(liqAmount0), parseEther(liqAmount1)],
    });
  };

  const handleSwap = () => {
    if (!swapAmount) return;
    writeContract({
      address: AMM_CONTRACT_ADDRESS,
      abi: AMM_ABI,
      functionName: 'swap',
      args: [selectedTokenIn as `0x${string}`, parseEther(swapAmount)],
    });
  };

  // Halt rendering if the execution thread is on the node server environment
  if (!mounted) return null;

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <h1>🦄 Custom AMM DEX</h1>
        <ConnectButton />
      </header>

      {isConnected ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <section style={{ border: '1px solid #333', padding: '1.5rem', borderRadius: '12px' }}>
            <h3>Step 1: Token Permissions</h3>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button onClick={() => handleApprove(TOKEN0_ADDRESS)} style={btnStyle}>Approve Token 0</button>
              <button onClick={() => handleApprove(TOKEN1_ADDRESS)} style={btnStyle}>Approve Token 1</button>
            </div>
          </section>

          <section style={{ border: '1px solid #333', padding: '1.5rem', borderRadius: '12px' }}>
            <h3>Step 2: Pool Liquidity</h3>
            <div style={{ display: 'flex', gap: '1rem', margin: '1rem 0' }}>
              <input type="number" placeholder="Token 0 Amount" value={liqAmount0} onChange={(e) => setLiqAmount0(e.target.value)} style={inputStyle} />
              <input type="number" placeholder="Token 1 Amount" value={liqAmount1} onChange={(e) => setLiqAmount1(e.target.value)} style={inputStyle} />
            </div>
            <button onClick={handleAddLiquidity} disabled={isPending} style={{ ...btnStyle, width: '100%', background: '#10b981' }}>
              Deposit Initial Liquidity
            </button>
          </section>

          <section style={{ border: '1px solid #333', padding: '1.5rem', borderRadius: '12px' }}>
            <h3>Step 3: Swap Assets</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '1rem 0' }}>
              <select value={selectedTokenIn} onChange={(e) => setSelectedTokenIn(e.target.value)} style={inputStyle}>
                <option value={TOKEN0_ADDRESS}>Token 0 ➔ Token 1</option>
                <option value={TOKEN1_ADDRESS}>Token 1 ➔ Token 0</option>
              </select>
              <input type="number" placeholder="Amount to trade" value={swapAmount} onChange={(e) => setSwapAmount(e.target.value)} style={inputStyle} />
            </div>
            <button onClick={handleSwap} disabled={isPending} style={{ ...btnStyle, width: '100%', background: '#6366f1' }}>
              {isPending ? 'Signing Transaction...' : 'Execute Swap'}
            </button>
          </section>

        </div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '4rem', color: '#666' }}>
          <p>Please connect your Web3 wallet using the header button to access the AMM interface panels.</p>
        </div>
      )}
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '8px',
  border: '1px solid #444',
  backgroundColor: '#fff',
  fontSize: '1rem'
};

const btnStyle = {
  padding: '0.75rem 1.2rem',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: '#2563eb',
  color: 'white',
  fontWeight: 'bold' as const,
  cursor: 'pointer'
};

export default Home;