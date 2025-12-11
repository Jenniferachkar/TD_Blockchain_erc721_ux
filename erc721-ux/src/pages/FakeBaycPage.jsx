import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';
import { CONTRACTS } from '../contracts.js';
import { useWeb3 } from '../web3/Web3Provider.jsx';

export default function FakeBaycPage() {
  const { provider, signer, connect, address } = useWeb3();
  const [name, setName] = useState('');
  const [totalSupply, setTotalSupply] = useState(null);
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState('');
  const [tokenToInspect, setTokenToInspect] = useState('');

  const loadInfo = async () => {
    if (!provider) return;
    const contract = new ethers.Contract(CONTRACTS.fakeBayc.address, CONTRACTS.fakeBayc.abi, provider);
    const [n, supply] = await Promise.all([contract.name(), contract.totalSupply()]);
    setName(n);
    setTotalSupply(supply.toString());
  };

  useEffect(() => {
    loadInfo().catch(() => {});
  }, [provider]);

  const claim = async () => {
    if (!signer) {
      await connect();
      return;
    }
    setLoading(true);
    setTxStatus('Envoi de la transaction...');
    try {
      const contract = new ethers.Contract(CONTRACTS.fakeBayc.address, CONTRACTS.fakeBayc.abi, signer);
      const tx = await contract.claimAToken();
      setTxStatus('Mining...');
      await tx.wait();
      setTxStatus('Token minte !');
      await loadInfo();
    } catch (err) {
      setTxStatus(err?.message || 'Erreur lors du mint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel__title">Fake BAYC</div>
      <p className="muted">
        Contrat Sepolia : {CONTRACTS.fakeBayc.address}. Mint gratuit via <code>claimAToken()</code>.
      </p>
      {!address && (
        <button className="btn" onClick={connect}>
          Connecter Metamask
        </button>
      )}
      <div className="infoGrid">
        <div className="infoCard">
          <div className="label">Nom</div>
          <div className="value">{name || '-'}</div>
        </div>
        <div className="infoCard">
          <div className="label">Total supply</div>
          <div className="value">{totalSupply ?? '-'}</div>
        </div>
      </div>

      <div className="actionRow">
        <button className="btn primary" onClick={claim} disabled={loading}>
          {loading ? 'Transaction en cours...' : 'Claim un nouveau token'}
        </button>
        {txStatus && <span className="muted">{txStatus}</span>}
      </div>

      <div className="panel small">
        <div className="panel__title">Consulter un token</div>
        <div className="inlineForm">
          <input
            placeholder="Token ID"
            value={tokenToInspect}
            onChange={(e) => setTokenToInspect(e.target.value)}
          />
          <Link className="btn ghost" to={`/fakeBayc/${tokenToInspect || 0}`}>
            Ouvrir
          </Link>
        </div>
        <p className="muted">Affiche l'image et les attributs depuis le metadata URI.</p>
      </div>
    </div>
  );
}
