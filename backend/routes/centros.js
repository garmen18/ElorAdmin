const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const raw = fs.readFileSync(path.join(__dirname, '..', 'data', 'EuskadiLatLon.json'), 'utf8');
const data = JSON.parse(raw).CENTROS || [];

const centros = data.map(c => ({
  ccen: c.CCEN,
  nombre: c.NOM,
  nombre_eu: c.NOME,
  dgenr: c.DGENRC,
  dgenr_eu: c.DGENRE,
  genr: c.GENR,
  muni: c.MUNI,
  dmunic: c.DMUNIC,
  dmunic_eu: c.DMUNIE,
  dterr: c.DTERRE,
  dtituc: c.DTITUC,
  domicilio: c.DOMI,
  cp: c.CPOS,
  telefono: c.TEL1,
  fax: c.TFAX,
  email: c.EMAIL,
  pagina: c.PAGINA,
  coor_x: c.COOR_X,
  coor_y: c.COOR_Y,
  lat: c.LONGITUD,   //  LONGITUD es la latitud real
lon: c.LATITUD     //  LATITUD es la longitud real

}));

router.get('/', (req, res) => {
  try {
    const { dtituc, dterre, dmunic, q } = req.query;
    let page = parseInt(req.query.page) || 1;
    let pageSize = parseInt(req.query.pageSize) || 20;
    if (page < 1) page = 1;
    if (pageSize < 1) pageSize = 20;

    let list = centros;

    if (dtituc && dtituc !== 'Todos') {
      const v = dtituc.toLowerCase();
      list = list.filter(c => (c.dtituc || '').toLowerCase() === v);
    }
    if (dterre && dterre !== 'Todos') {
      const v = dterre.toLowerCase();
      list = list.filter(c => (c.dterr || '').toLowerCase() === v);
    }
    if (dmunic && dmunic !== 'Todos') {
      const v = dmunic.toLowerCase();
      list = list.filter(c => (c.dmunic || '').toLowerCase() === v);
    }
    if (q) {
      const ql = q.toLowerCase();
      list = list.filter(c =>
        (c.nombre || '').toLowerCase().includes(ql) ||
        (c.dmunic || '').toLowerCase().includes(ql)
      );
    }

    const total = list.length;
    const start = (page - 1) * pageSize;
    const items = list.slice(start, start + pageSize);

    res.json({ total, page, pageSize, items });
  } catch (err) {
    console.error('Error /centros', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// OPCIONES PARA FILTROS (DTITUC, DTERRE, DMUNIC)
router.get('/options/all', (req, res) => {
  try {
    const dtitucSet = new Set();
    const dterrSet = new Set();
    const dmunicSet = new Set();

    centros.forEach(c => {
      if (c.dtituc) dtitucSet.add(c.dtituc);
      if (c.dterr) dterrSet.add(c.dterr);
      if (c.dmunic) dmunicSet.add(c.dmunic);
    });

    const dtituc = ['Todos', ...Array.from(dtitucSet).sort()];
    const dterr = ['Todos', ...Array.from(dterrSet).sort()];
    const dmunic = ['Todos', ...Array.from(dmunicSet).sort()];

    res.json({ dtituc, dterr, dmunic });
  } catch (err) {
    console.error('Error en /centros/options/all:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// DETALLE DE CENTRO (DEBE IR DESPUÉS)
router.get('/:ccen', (req, res) => {
  const ccen = parseInt(req.params.ccen);
  const centro = centros.find(c => c.ccen === ccen);
  if (!centro) return res.status(404).json({ error: 'Centro no encontrado' });
  res.json(centro);
});



module.exports = router;
