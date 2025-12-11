import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import { CONTRACTS } from '../contracts.js';
import { fetchJson, ipfsToHttp } from '../utils.js';
import { useWeb3 } from '../web3/Web3Provider.jsx';

export default function FakeBaycTokenPage() {
  const { tokenId } = useParams();
  const { provider } = useWeb3();
  const [uri, setUri] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!provider || !tokenId) return;
    const run = async () => {
      setLoading(true);
      setError('');
      setMetadata(null);
      try {
        const contract = new ethers.Contract(CONTRACTS.fakeBayc.address, CONTRACTS.fakeBayc.abi, provider);
        const tokenUri = await contract.tokenURI(tokenId);
        setUri(tokenUri);
        const meta = await fetchJson(tokenUri);
        setMetadata(meta);
      } catch (err) {
        setError('Token inexistant ou metadata inaccessible.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [provider, tokenId]);

  return (
    <div className="panel">
      <div className="panel__title">Fake BAYC #{tokenId}</div>
      {loading && <p className="muted">Chargement en cours...</p>}
      {error && <div className="alert">{error}</div>}
      {metadata && (
        <div className="tokenView">
          {metadata.image && <img className="nftImage" src={ipfsToHttp(metadata.image)} alt={metadata.name} />}
          <div>
            <h3>{metadata.name}</h3>
            <p className="muted">{metadata.description}</p>
            <div className="metaRow">
              <div className="label">Token URI</div>
              <div className="value small">{ipfsToHttp(uri)}</div>
            </div>
            <div className="attributes">
              {metadata.attributes?.length ? (
                metadata.attributes.map((attr) => (
                  <div key={`${attr.trait_type}-${attr.value}`} className="attribute">
                    <div className="label">{attr.trait_type}</div>
                    <div className="value">{attr.value}</div>
                  </div>
                ))
              ) : (
                <p className="muted">Aucun attribut trouve.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
