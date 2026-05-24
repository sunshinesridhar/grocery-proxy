export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { q, lat, lon } = req.query;
  try {
    const r = await fetch(
      `https://blinkit.com/v2/product/search/?q=${encodeURIComponent(q)}&lat=${lat}&lon=${lon}`,
      { headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
          'app_client': 'consumer_web',
          'Accept': 'application/json',
          'Referer': 'https://blinkit.com/'
      }}
    );
    const d = await r.json();
    const products = d?.objects?.find(o => o.type === 'product_list')
                      ?.data?.objects || [];
    const p = products[0]?.data || {};
    res.json({
      name:  p.name || null,
      price: p.price?.selling_price || p.selling_price || null,
      unit:  p.unit || p.quantity || null
    });
  } catch(e) {
    res.status(500).json({ name: null, price: null, unit: null, error: e.message });
  }
}
