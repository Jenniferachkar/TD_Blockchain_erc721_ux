export function ipfsToHttp(uri) {
  if (!uri) return '';
  if (uri.startsWith('ipfs://')) {
    return uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  if (uri.startsWith('ipfs/')) {
    return uri.replace('ipfs/', 'https://ipfs.io/ipfs/');
  }
  return uri;
}

export async function fetchJson(uri) {
  const url = ipfsToHttp(uri);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Impossible de charger ${url}`);
  }
  return response.json();
}

export function shortAddress(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
