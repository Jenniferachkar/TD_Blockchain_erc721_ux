import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import { CONTRACTS } from '../contracts.js';
import { useWeb3 } from '../web3/Web3Provider.jsx';

export default function FakeNefturiansPage() {
  const { provider, signer, connect, address } = useWeb3();
  const navigate = useNavigate();
  const [price, setPrice] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [supply, setSupply] = useState(null);
  const [ownerInput, setOwnerInput] = useState('');

  const loadData = async () => {
    if (!provider) return;
    const contract = new ethers.Contract(CONTRACTS.fakeNefturians.address, CONTRACTS.fakeNefturians.abi, provider);
    const [p, total] = await Promise.all([contract.tokenPrice(), contract.totalSupply()]);
    setPrice(p);
    setSupply(total.toString());
  };

  useEffect(() => {
    loadData().catch(() => {});
  }, [provider]);

  const buy = async () => {
    if (!signer) {
      await connect();
      return;
    }
    if (!price) return;
    setLoading(true);
    setStatus('Envoi de la transaction...');
    try {
      const contract = new ethers.Contract(CONTRACTS.fakeNefturians.address, CONTRACTS.fakeNefturians.abi, signer);
      const tx = await contract.buyAToken({ value: price });
      setStatus('Mining...');
      await tx.wait();
      setStatus('Token achete !');
      await loadData();
    } catch (err) {
      setStatus(err?.message || 'Achat impossible');
    } finally {
      setLoading(false);
    }
  };

  const goToOwner = () => {
    const target = ownerInput.trim();
    if (!target) {
      setStatus('Renseignez une adresse valide.');
      return;
    }
    navigate(`/fakeNefturians/${target}`);
  };

  return (
    <div className="panel">
      <div className="panel__title">Fake Nefturians</div>
      <p className="muted">Contrat Sepolia : {CONTRACTS.fakeNefturians.address}</p>
      {!address && (
        <button className="btn" onClick={connect}>
          Connecter Metamask
        </button>
      )}
      <div className="infoGrid">
        <div className="infoCard">
          <div className="label">Prix min</div>
          <div className="value">{price ? `${ethers.utils.formatEther(price)} ETH` : '-'}</div>
        </div>
        <div className="infoCard">
          <div className="label">Total supply</div>
          <div className="value">{supply ?? '-'}</div>
        </div>
      </div>
      <div className="actionRow">
        <button className="btn primary" onClick={buy} disabled={loading}>
          {loading ? 'Tx en cours...' : 'Acheter un token'}
        </button>
        {status && <span className="muted">{status}</span>}
      </div>

      <div className="panel small">
        <div className="panel__title">Lister les tokens d une adresse</div>
        <p className="muted">Recupere tous les tokenIds via ERC721Enumerable et affiche les metadonnees.</p>
        <div className="inlineForm">
          <input
            placeholder="0x1234..."
            value={ownerInput}
            onChange={(e) => setOwnerInput(e.target.value)}
          />
          <button className="btn ghost" onClick={goToOwner}>
            Ouvrir
          </button>
        </div>
      </div>
    </div>
  );
}
