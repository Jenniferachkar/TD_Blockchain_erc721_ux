import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';

const Web3Context = createContext(null);
export const SEPOLIA_CHAIN_ID = 11155111;

export function Web3Provider({ children }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState('');
  const [chainId, setChainId] = useState(null);
  const [blockNumber, setBlockNumber] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  const clearError = () => setError('');

  const attachProvider = (ethProvider) => {
    if (provider) {
      provider.removeListener('block', setBlockNumber);
    }
    setProvider(ethProvider);
    const nextSigner = ethProvider.getSigner();
    setSigner(nextSigner);
    nextSigner.getAddress().then(setAddress).catch(() => setAddress(''));
    ethProvider
      .getNetwork()
      .then((network) => setChainId(network.chainId))
      .catch(() => setChainId(null));
    ethProvider
      .getBlockNumber()
      .then(setBlockNumber)
      .catch(() => setBlockNumber(null));
    ethProvider.on('block', setBlockNumber);
  };

  const switchToSepolia = async () => {
    if (!window.ethereum) {
      setError('Installez Metamask pour continuer.');
      return;
    }
    const sepoliaHex = `0x${SEPOLIA_CHAIN_ID.toString(16)}`;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: sepoliaHex }],
      });
      const nextProvider = new ethers.providers.Web3Provider(window.ethereum, 'any');
      attachProvider(nextProvider);
      setError('');
    } catch (err) {
      if (err?.code === 4902) {
        // Reseau non ajoute, on tente de l'ajouter puis on re-switch
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: sepoliaHex,
                chainName: 'Sepolia',
                rpcUrls: ['https://rpc.sepolia.org', 'https://ethereum-sepolia.blockpi.network/v1/rpc/public'],
                nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: sepoliaHex }],
          });
          const nextProvider = new ethers.providers.Web3Provider(window.ethereum, 'any');
          attachProvider(nextProvider);
          setError('');
        } catch (addErr) {
          setError(addErr?.message || 'Impossible de changer de reseau.');
        }
      } else {
        setError(err?.message || 'Impossible de changer de reseau.');
      }
    }
  };

  const connect = async () => {
    if (!window.ethereum) {
      setError('Installez Metamask pour continuer.');
      return;
    }
    setConnecting(true);
    try {
      const ethProvider = new ethers.providers.Web3Provider(window.ethereum, 'any');
      await ethProvider.send('eth_requestAccounts', []);
      const network = await ethProvider.getNetwork();
      if (network.chainId !== SEPOLIA_CHAIN_ID) {
        await switchToSepolia();
      } else {
        attachProvider(ethProvider);
      }
      setError('');
    } catch (err) {
      setError(err?.message || 'Connexion Metamask impossible.');
    } finally {
      setConnecting(false);
    }
  };

  useEffect(() => {
    if (!window.ethereum) return;
    const handleAccountsChanged = (accounts) => {
      setAddress(accounts[0] || '');
      if (!accounts.length) {
        setSigner(null);
      }
    };
    const handleChainChanged = (hexId) => {
      const numericId = parseInt(hexId, 16);
      setChainId(numericId);
      if (window.ethereum) {
        const ethProvider = new ethers.providers.Web3Provider(window.ethereum, 'any');
        attachProvider(ethProvider);
      }
    };
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    window.ethereum
      .request({ method: 'eth_accounts' })
      .then((accounts) => {
        if (accounts?.length) {
          const ethProvider = new ethers.providers.Web3Provider(window.ethereum, 'any');
          attachProvider(ethProvider);
        }
      })
      .catch(() => {});

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
      if (provider) {
        provider.removeAllListeners('block');
      }
    };
  }, []);

  const value = useMemo(
    () => ({
      provider,
      signer,
      address,
      chainId,
      blockNumber,
      connecting,
      error,
      isSepolia: chainId === SEPOLIA_CHAIN_ID,
      connect,
      switchToSepolia,
      clearError,
    }),
    [provider, signer, address, chainId, blockNumber, connecting, error],
  );

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export function useWeb3() {
  const ctx = useContext(Web3Context);
  if (!ctx) {
    throw new Error('useWeb3 must be used inside Web3Provider');
  }
  return ctx;
}
