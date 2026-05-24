export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { q } = req.query;
  try {
    const r = await fetch(
      `https://www.amazon.in/s?k=${encodeURIComponent(q)}&i=amazonfresh&ref=nb_sb_noss`,
      { headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
          'Accept': 'text/html',
          'Accept-Language': 'en-IN'
      }}
    );
    const html = await r.text();
    const priceMatch = html.match(/₹([\d,]+).*?class="a-price-whole"/s)
                    || html.match(/"priceAmount":"([\d.]+)"/);
    const nameMatch  = html.match(/class="a-size-base-plus.*?>(.*?)<\/span>/s);
    const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g,'')) : null;
    const name  = nameMatch  ? nameMatch[1].replace(/<[^>]+>/g,'').trim() : null;
    res.json({ name, price, unit: null });
  } catch(e) {
    res.status(500).json({ name: null, price: null, unit: null, error: e.message });
  }
}
