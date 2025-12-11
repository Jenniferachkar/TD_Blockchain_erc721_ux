import { useWeb3, SEPOLIA_CHAIN_ID } from '../web3/Web3Provider.jsx';

export default function ChainInfoPage() {
  const { address, chainId, blockNumber, connect, connecting } = useWeb3();

  return (
    <div className="panel">
      <div className="panel__title">/chain-info</div>
      <p className="muted">Connexion Metamask, controle Sepolia, infos reseau courantes.</p>
      {!address && (
        <button className="btn" onClick={connect} disabled={connecting}>
          {connecting ? 'Connexion...' : 'Connecter Metamask'}
        </button>
      )}
      <div className="infoGrid">
        <div className="infoCard">
          <div className="label">Adresse</div>
          <div className="value">{address || 'Non connectee'}</div>
        </div>
        <div className="infoCard">
          <div className="label">Chain ID</div>
          <div className="value">
            {chainId || 'Inconnu'} {chainId === SEPOLIA_CHAIN_ID ? '(Sepolia)' : ''}
          </div>
        </div>
        <div className="infoCard">
          <div className="label">Dernier bloc</div>
          <div className="value">{blockNumber ?? '-'}</div>
        </div>
      </div>
    </div>
  );
}
