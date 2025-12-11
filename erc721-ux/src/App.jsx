import { NavLink, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import { useWeb3 } from './web3/Web3Provider.jsx';
import ChainInfoPage from './pages/ChainInfoPage.jsx';
import FakeBaycPage from './pages/FakeBaycPage.jsx';
import FakeBaycTokenPage from './pages/FakeBaycTokenPage.jsx';
import FakeNefturiansPage from './pages/FakeNefturiansPage.jsx';
import FakeNefturiansOwnerPage from './pages/FakeNefturiansOwnerPage.jsx';
import FakeMeebitsPage from './pages/FakeMeebitsPage.jsx';
import WrongNetworkPage from './pages/WrongNetworkPage.jsx';

const NetworkGuard = ({ children }) => {
  const { chainId, isSepolia } = useWeb3();
  if (chainId && !isSepolia) {
    return <Navigate to="/wrong-network" replace />;
  }
  return children;
};

const Home = () => (
  <div className="panel">
    <div className="panel__title">erc721-ux</div>
    <p className="muted">
      Interface unifiee pour Fake BAYC, Fake Nefturians, Fake Meebits (reseau Sepolia uniquement).
    </p>
    <div className="grid">
      <NavLink className="cardLink" to="/chain-info">
        <div className="cardLink__title">/chain-info</div>
        <p>Connexion Metamask, chainId, bloc courant, adresse.</p>
      </NavLink>
      <NavLink className="cardLink" to="/fakeBayc">
        <div className="cardLink__title">/fakeBayc</div>
        <p>Nom, totalSupply et mint gratuit via claimAToken().</p>
      </NavLink>
      <NavLink className="cardLink" to="/fakeNefturians">
        <div className="cardLink__title">/fakeNefturians</div>
        <p>Prix minimal et achat payant d un token.</p>
      </NavLink>
      <NavLink className="cardLink" to="/fakeMeebits">
        <div className="cardLink__title">/fakeMeebits</div>
        <p>Choix d un token libre et claim via signature avec le claimer.</p>
      </NavLink>
    </div>
  </div>
);

function App() {
  const { address, connect, connecting, error, clearError, chainId } = useWeb3();

  return (
    <div className="app">
      <header className="topbar">
        <NavLink to="/" className="brand">
          ERC721 UX - Jennifer El Achkar
        </NavLink>
        <nav className="nav">
          <NavLink to="/chain-info">Chain</NavLink>
          <NavLink to="/fakeBayc">Fake BAYC</NavLink>
          <NavLink to="/fakeNefturians">Fake Nefturians</NavLink>
          <NavLink to="/fakeMeebits">Fake Meebits</NavLink>
        </nav>
        <div className="walletBox">
          {address ? (
            <span className="pill success">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          ) : (
            <button className="btn" onClick={connect} disabled={connecting}>
              {connecting ? 'Connexion...' : 'Connecter Metamask'}
            </button>
          )}
          {chainId && <span className="chip">chain: {chainId}</span>}
        </div>
      </header>

      {error && (
        <div className="alert" onClick={clearError}>
          {error}
        </div>
      )}

      <main className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/chain-info"
            element={
              <NetworkGuard>
                <ChainInfoPage />
              </NetworkGuard>
            }
          />
          <Route
            path="/fakeBayc"
            element={
              <NetworkGuard>
                <FakeBaycPage />
              </NetworkGuard>
            }
          />
          <Route
            path="/fakeBayc/:tokenId"
            element={
              <NetworkGuard>
                <FakeBaycTokenPage />
              </NetworkGuard>
            }
          />
          <Route
            path="/fakeNefturians"
            element={
              <NetworkGuard>
                <FakeNefturiansPage />
              </NetworkGuard>
            }
          />
          <Route
            path="/fakeNefturians/:userAddress"
            element={
              <NetworkGuard>
                <FakeNefturiansOwnerPage />
              </NetworkGuard>
            }
          />
          <Route
            path="/fakeMeebits"
            element={
              <NetworkGuard>
                <FakeMeebitsPage />
              </NetworkGuard>
            }
          />
          <Route path="/wrong-network" element={<WrongNetworkPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="footer muted">Developpe par Jennifer El Achkar - Sepolia playground.</footer>
    </div>
  );
}

export default App;
