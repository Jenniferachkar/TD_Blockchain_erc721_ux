import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACTS } from '../contracts.js';
import { useWeb3 } from '../web3/Web3Provider.jsx';

export default function FakeMeebitsPage() {
  const { provider, signer, connect, address } = useWeb3();
  const [supply, setSupply] = useState(null);
  const [tokenInput, setTokenInput] = useState('');
  const [signature, setSignature] = useState('');
  const [tip, setTip] = useState('0');
  const [availability, setAvailability] = useState('');
  const [checking, setChecking] = useState(false);
  const [claimStatus, setClaimStatus] = useState('');
  const [whitelisted, setWhitelisted] = useState(null);
  const [whitelistStatus, setWhitelistStatus] = useState('');

  useEffect(() => {
    if (!provider) return;
    const run = async () => {
      const contract = new ethers.Contract(CONTRACTS.fakeMeebits.address, CONTRACTS.fakeMeebits.abi, provider);
      const total = await contract.totalSupply();
      setSupply(total.toString());
    };
    run().catch(() => {});
  }, [provider]);

  const checkAvailability = async () => {
    if (!tokenInput) {
      setAvailability('Renseignez un tokenId pour verifier sa disponibilite.');
      return;
    }
    if (!provider) {
      setAvailability('Connectez Metamask pour verifier la disponibilite.');
      await connect();
      return;
    }
    setChecking(true);
    setAvailability('');
    try {
      const contract = new ethers.Contract(CONTRACTS.fakeMeebits.address, CONTRACTS.fakeMeebits.abi, provider);
      await contract.ownerOf(tokenInput);
      setAvailability('deja minte');
    } catch (err) {
      setAvailability('Libre, vous pouvez le revendiquer');
    } finally {
      setChecking(false);
    }
  };

  const checkWhitelist = async () => {
    if (!address || !provider) {
      setWhitelistStatus('Connectez Metamask pour interroger la whitelist.');
      await connect();
      return;
    }
    setWhitelistStatus('Interrogation en cours...');
    try {
      const claimer = new ethers.Contract(
        CONTRACTS.fakeMeebitsClaimer.address,
        CONTRACTS.fakeMeebitsClaimer.abi,
        provider,
      );
      const allowed = await claimer.whitelist(address);
      setWhitelisted(allowed);
      setWhitelistStatus('');
    } catch (err) {
      setWhitelisted(false);
      setWhitelistStatus('Impossible de lire la whitelist.');
    }
  };

  const claim = async () => {
    if (!provider || !signer) {
      setClaimStatus('Connectez Metamask pour signer la transaction.');
      await connect();
      return;
    }
    if (!tokenInput || !signature) {
      setClaimStatus('Renseignez tokenId et signature.');
      return;
    }
    setClaimStatus('Envoi de la transaction...');
    try {
      const value = tip ? ethers.utils.parseEther(tip || '0') : ethers.constants.Zero;
      const claimer = new ethers.Contract(
        CONTRACTS.fakeMeebitsClaimer.address,
        CONTRACTS.fakeMeebitsClaimer.abi,
        signer,
      );
      const tx = await claimer.claimAToken(tokenInput, signature, { value });
      setClaimStatus('Mining...');
      await tx.wait();
      setClaimStatus('Token revendique avec succes !');
      setAvailability('');
    } catch (err) {
      setClaimStatus(err?.message || 'Echec du claim');
    }
  };

  return (
    <div className="panel">
      <div className="panel__title">Fake Meebits</div>
      <p className="muted">
        La signature attendue est celle utilisee par le claimer pour autoriser les tokenId libres. Vous pouvez
        verifier si votre adresse est whitelistee, puis soumettre la signature fournie dans le TP.
      </p>
      {!address && (
        <div className="actionRow">
          <button className="btn" onClick={connect}>
            Connecter Metamask
          </button>
          <span className="muted">Necessaire pour whitelist et claim.</span>
        </div>
      )}
      <div className="infoGrid">
        <div className="infoCard">
          <div className="label">Total supply</div>
          <div className="value">{supply ?? '-'}</div>
        </div>
        <div className="infoCard">
          <div className="label">Claimer</div>
          <div className="value small">{CONTRACTS.fakeMeebitsClaimer.address}</div>
        </div>
      </div>

      <div className="panel small">
        <div className="panel__title">Tester un tokenId libre</div>
        <div className="inlineForm">
          <input
            placeholder="tokenId"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
          />
          <button className="btn ghost" onClick={checkAvailability} disabled={checking}>
            {checking ? '...' : 'Verifier'}
          </button>
        </div>
        {availability && <p className="muted">{availability}</p>}
      </div>

      <div className="panel small">
        <div className="panel__title">Claim via signature</div>
        <label className="label">Signature hex (0x...)</label>
        <input
          placeholder="Signature fournie par le prof / script"
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
        />
        <label className="label">Tip (ETH, optionnel)</label>
        <input value={tip} onChange={(e) => setTip(e.target.value)} />
        <button className="btn primary" onClick={claim}>
          Claim ce token
        </button>
        {claimStatus && <p className="muted">{claimStatus}</p>}
      </div>

      <div className="panel small">
        <div className="panel__title">Whitelist</div>
        <p className="muted">La whitelist du claimer peut etre interrogee directement.</p>
        <button className="btn ghost" onClick={checkWhitelist}>
          Verifier mon adresse
        </button>
        {whitelistStatus && <p className="muted">{whitelistStatus}</p>}
        {whitelisted !== null && (
          <p className="muted">{whitelisted ? 'Adresse autorisee' : 'Adresse non whitelistee'}</p>
        )}
      </div>
    </div>
  );
}
