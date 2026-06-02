const express = require('express');
const path = require('path');
const app = express();

// Dokploy y la mayoría de nubes pasan el puerto en la variable PORT. Por defecto usaremos 3000.
const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, 'dist/frontend/browser');

// Servir los archivos estáticos compilados de Angular
app.use(express.static(DIST_DIR));

// Redirigir todas las demás peticiones al index.html para soportar el enrutador de Angular (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
});

// Escuchar en el puerto especificado en todas las interfaces de red (0.0.0.0)
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Frontend está corriendo y escuchando en el puerto ${PORT}`);
});
