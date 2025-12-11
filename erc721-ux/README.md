# ERC721 UX - playground Sepolia

Interface React pour manipuler trois collections NFT de TP sur Sepolia : Fake BAYC (mint gratuit), Fake Nefturians (mint payant) et Fake Meebits (mint via signature + whitelist). Tout est en francais et centre sur Metamask.

## Apercu rapide
- Vue `/chain-info` : connexion Metamask, chainId, dernier bloc et adresse active.
- Vue `/fakeBayc` : infos du contrat, mint gratuit via `claimAToken()`, consultation d un token par ID (image + attributs IPFS).
- Vue `/fakeNefturians` : prix minimal, achat avec ETH, listing des tokens possedes par une adresse.
- Vue `/fakeMeebits` : test de disponibilite d un tokenId, claim par signature (avec tip optionnel) et verif de whitelist.

## Prerequis
- Node.js 18+ (testé avec Vite 7 et React 19).
- Metamask dans le navigateur et reseau Sepolia avec un peu de faucet ETH.

## Installation et lancement
```bash
npm install
npm run dev   # lance Vite en mode dev
```
L appli est servie par Vite (http://localhost:5173 par defaut). Le bouton "Connecter Metamask" est visible dans la topbar et sur chaque page qui en a besoin.

## Contrats utilises (Sepolia)
- Fake BAYC : `0x1dA89342716B14602664626CD3482b47D5C2005E`
- Fake Nefturians : `0x9bAADf70BD9369F54901CF3Ee1b3c63b60F4F0ED`
- Fake Meebits : `0xD1d148Be044AEB4948B48A03BeA2874871a26003`
- Claimer Meebits : `0x5341e225Ab4D29B838a813E380c28b0eFD6FBa55`

## Mode d emploi
- Si vous n etes pas sur Sepolia, vous serez redirige vers `/wrong-network` avec un bouton pour basculer (RPC publics ajoutes).
- Sur `/fakeBayc`, le mint est gratuit ; utilisez le mini formulaire pour ouvrir un token specifique.
- Sur `/fakeNefturians`, l achat requiert le prix minimal retourne par le contrat. Le sous-formulaire permet de lister les NFTs d une adresse.
- Sur `/fakeMeebits`, verifiez un tokenId avant de soumettre la signature fournie dans le TP. La section whitelist verifie directement votre adresse Metamask.

## Scripts npm
- `npm run dev` : mode developpement avec HMR.
- `npm run build` : build de production Vite.
- `npm run preview` : previsualisation du build.
- `npm run lint` : eslint.

## Notes
- Les metadonnees IPFS sont converties en HTTPS (gateway ipfs.io) pour l affichage.
- Les erreurs Metamask ou reseau sont affichees sous forme d alertes clicables pour etre nettoyees.
