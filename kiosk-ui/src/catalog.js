export async function getLocalCatalog() {
  const res = await fetch(`/catalog.json?t=${Date.now()}`);
  if (!res.ok) throw new Error('catalog unavailable');
  return res.json();
}
