export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { q, lat, lon } = req.query;
  try {
    const url = `https://blinkit.com/v2/product/search/?q=${encodeURIComponent(q)}&lat=${lat}&lon=${lon}`;
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Blinkit/18.1 (iPhone; iOS 16.0; Scale/3.00)',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-IN,en;q=0.9',
        'app_client': 'consumer_app',
        'app_version': '18.1.0',
        'web-app-version': '1000065',
        'device_id': '1234567890abcdef',
        'Referer': 'https://blinkit.com/',
        'Origin': 'https://blinkit.com'
      }
    });

    const text = await r.text();

    // Check if response is HTML (bot detection triggered)
    if (text.trim().startsWith('<')) {
      // Fallback: try the web search endpoint
      const r2 = await fetch(
        `https://blinkit.com/search?q=${encodeURIComponent(q)}`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
            'Accept': 'text/html,application/xhtml+xml',
            'Accept-Language': 'en-IN',
          }
        }
      );
      const html = await r2.text();
      // Extract price from meta tags or JSON-LD
      const priceMatch = html.match(/"selling_price"\s*:\s*(\d+)/)||
                         html.match(/"price"\s*:\s*(\d+)/);
      const nameMatch  = html.match(/"name"\s*:\s*"([^"]+)"/);
      return res.json({
        name:  nameMatch  ? nameMatch[1]  : null,
        price: priceMatch ? parseInt(priceMatch[1]) : null,
        unit:  null,
        source: 'html-fallback'
      });
    }

    const d = JSON.parse(text);
    const products = d?.objects?.find(o => o.type === 'product_list')
                      ?.data?.objects || [];
    const p = products[0]?.data || {};
    res.json({
      name:  p.name || null,
      price: p.price?.selling_price || p.selling_price || null,
      unit:  p.unit || p.quantity || null,
      source: 'api'
    });

  } catch(e) {
    res.status(500).json({ name: null, price: null, unit: null, error: e.message });
  }
}
