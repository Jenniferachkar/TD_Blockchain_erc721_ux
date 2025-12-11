import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import { CONTRACTS } from '../contracts.js';
import { fetchJson, ipfsToHttp, shortAddress } from '../utils.js';
import { useWeb3 } from '../web3/Web3Provider.jsx';

export default function FakeNefturiansOwnerPage() {
  const { userAddress } = useParams();
  const { provider } = useWeb3();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!provider || !userAddress) return;
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const contract = new ethers.Contract(CONTRACTS.fakeNefturians.address, CONTRACTS.fakeNefturians.abi, provider);
        const balance = await contract.balanceOf(userAddress);
        const ids = [];
        for (let i = 0; i < balance.toNumber(); i += 1) {
          const id = await contract.tokenOfOwnerByIndex(userAddress, i);
          ids.push(id.toString());
        }
        const detailed = [];
        for (const id of ids) {
          const uri = await contract.tokenURI(id);
          const meta = await fetchJson(uri);
          detailed.push({ id, ...meta });
        }
        setTokens(detailed);
      } catch (err) {
        setError(err?.message || 'Impossible de recuperer les tokens.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [provider, userAddress]);

  return (
    <div className="panel">
      <div className="panel__title">Tokens de {shortAddress(userAddress)}</div>
      {loading && <p className="muted">Chargement...</p>}
      {error && <div className="alert">{error}</div>}
      {!loading && !tokens.length && !error && <p className="muted">Aucun token trouve.</p>}
      <div className="tokenList">
        {tokens.map((token) => (
          <div className="tokenCard" key={token.id}>
            {token.image && <img src={ipfsToHttp(token.image)} alt={token.name} />}
            <div className="tokenCard__body">
              <div className="label">Token #{token.id}</div>
              <div className="value">{token.name}</div>
              <p className="muted">{token.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
