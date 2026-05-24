export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { q, lat, lon } = req.query;
  try {
    const r = await fetch(
      `https://www.swiggy.com/mapi/instamart/search?query=${encodeURIComponent(q)}&lat=${lat}&lng=${lon}&version=v2&offset=0`,
      { headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
          'Accept': 'application/json',
          'Referer': 'https://www.swiggy.com/'
      }}
    );
    const d = await r.json();
    const products = d?.data?.products || [];
    const p = products[0] || {};
    res.json({
      name:  p.product_name || null,
      price: p.price?.offer_price || p.price?.mrp || null,
      unit:  p.quantity || p.weight || null
    });
  } catch(e) {
    res.status(500).json({ name: null, price: null, unit: null, error: e.message });
  }
}
