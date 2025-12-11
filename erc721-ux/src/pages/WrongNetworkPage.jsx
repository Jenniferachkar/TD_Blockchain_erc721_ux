import { NavLink } from 'react-router-dom';
import { SEPOLIA_CHAIN_ID, useWeb3 } from '../web3/Web3Provider.jsx';

export default function WrongNetworkPage() {
  const { chainId, switchToSepolia } = useWeb3();
  return (
    <div className="panel error">
      <div className="panel__title">Mauvaise chaine</div>
      <p className="muted">
        Vous etes connecte sur la chaine {chainId || 'inconnue'}. Merci de passer sur Sepolia (chainId {SEPOLIA_CHAIN_ID})
        puis de revenir.
      </p>
      <div className="actionRow">
        <button className="btn primary" onClick={switchToSepolia}>
          Basculer sur Sepolia
        </button>
        <NavLink className="btn ghost" to="/chain-info">
          Retour /chain-info
        </NavLink>
      </div>
    </div>
  );
}
