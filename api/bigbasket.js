export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { q } = req.query;
  try {
    const r = await fetch(
      `https://www.bigbasket.com/product/get-products/?slug=${encodeURIComponent(q)}-price-online&page=1&tab_type=%5B%22pc%22%5D`,
      { headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
          'Accept': 'application/json',
          'Referer': 'https://www.bigbasket.com/',
          'x-channel': 'BB-WEB'
      }}
    );
    const d = await r.json();
    const products = d?.tabs?.[0]?.product_info?.products || [];
    const p = products[0] || {};
    res.json({
      name:  p.product?.desc || null,
      price: p.pricing?.discount?.prim_price?.sp || null,
      unit:  p.product?.w || null
    });
  } catch(e) {
    res.status(500).json({ name: null, price: null, unit: null, error: e.message });
  }
}
