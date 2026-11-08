const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/procesar-producto', async (req, res) => {
  const { url_shein, margen_ganancia } = req.body;
  try {
    const { data } = await axios.get(url_shein, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const $ = cheerio.load(data);
    let imagenUrl = $('meta[property="og:image"]').attr('content');
    if (imagenUrl && imagenUrl.startsWith('//')) { imagenUrl = 'https:' + imagenUrl; }
    const nombre = $('meta[property="og:title"]').attr('content') || 'Producto SheIn';
    const precioOriginalRaw = $('meta[property="product:price:amount"]').attr('content') || "10";
    const precioOriginal = parseFloat(precioOriginalRaw);
    const precioVenta = (precioOriginal + parseFloat(margen_ganancia)).toFixed(2);

    res.json({
      success: true,
      producto: { nombre, imagen_url: imagenUrl, precio_venta: precioVenta }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'No se pudo procesar el enlace' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor activo en puerto ${PORT}`));
