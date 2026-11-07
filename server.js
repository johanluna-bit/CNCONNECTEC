/**
 * CN ConnectEC — server.js
 * Servidor HTTP nativo en Node.js (sin frameworks externos)
 * Maneja API REST con persistencia en archivos JSON y sirve archivos estáticos.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');

// Tokens de sesión en memoria
const activeTokens = new Set();

// ── Helpers de persistencia JSON ──
function readJson(filename, defaultVal = []) {
  try {
    const file = path.join(DATA_DIR, filename);
    if (!fs.existsSync(file)) return defaultVal;
    const content = fs.readFileSync(file, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error leyendo ${filename}:`, err.message);
    return defaultVal;
  }
}

function writeJson(filename, data) {
  try {
    const file = path.join(DATA_DIR, filename);
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error guardando ${filename}:`, err.message);
    return false;
  }
}

// ── Helpers HTTP ──
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

function isAuthorized(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return false;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  return activeTokens.has(token);
}

// ── Tipos MIME para archivos estáticos ──
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp'
};

function serveStatic(req, res, pathname) {
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  
  // Normalizar ruta para evitar directory traversal
  const safePath = path.normalize(filePath);
  if (!safePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Acceso denegado');
    return;
  }

  if (fs.existsSync(safePath) && fs.statSync(safePath).isDirectory()) {
    filePath = path.join(safePath, 'index.html');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 — Archivo no encontrado');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

// ── Servidor Principal ──
const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // ══════════════════════════════════════
  //  API REST
  // ══════════════════════════════════════
  if (pathname.startsWith('/api/')) {

    // ── AUTH ──
    if (pathname === '/api/auth/login' && method === 'POST') {
      const { username, password } = await getRequestBody(req);
      const users = readJson('users.json');
      const hash = crypto.createHash('sha256').update(password || '').digest('hex');
      const user = users.find(u => u.username === username && u.passwordHash === hash);

      // Compatibilidad demo (admin/admin)
      if (user || (username === 'admin' && password === 'admin')) {
        const token = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
        activeTokens.add(token);
        return sendJson(res, 200, { ok: true, token, username: username || 'admin' });
      }
      return sendJson(res, 401, { error: 'Credenciales inválidas' });
    }

    if (pathname === '/api/auth/logout' && method === 'POST') {
      const auth = req.headers['authorization'] || '';
      const token = auth.replace(/^Bearer\s+/i, '').trim();
      activeTokens.delete(token);
      return sendJson(res, 200, { ok: true });
    }

    // ── SERVICES ──
    if (pathname === '/api/services' && method === 'GET') {
      const onlyActive = parsedUrl.searchParams.get('onlyActive') === 'true';
      let services = readJson('services.json');
      if (onlyActive) services = services.filter(s => s.active);
      return sendJson(res, 200, services);
    }

    if (pathname === '/api/services' && method === 'POST') {
      if (!isAuthorized(req)) return sendJson(res, 401, { error: 'No autorizado' });
      const newService = await getRequestBody(req);
      newService.id = newService.id || 'svc-' + Date.now();
      newService.createdAt = newService.createdAt || new Date().toISOString();
      const services = readJson('services.json');
      services.push(newService);
      writeJson('services.json', services);
      return sendJson(res, 201, newService);
    }

    const svcMatch = pathname.match(/^\/api\/services\/([a-zA-Z0-9_-]+)$/);
    if (svcMatch) {
      const id = svcMatch[1];
      if (method === 'PUT') {
        if (!isAuthorized(req)) return sendJson(res, 401, { error: 'No autorizado' });
        const updated = await getRequestBody(req);
        const services = readJson('services.json');
        const idx = services.findIndex(s => s.id === id);
        if (idx === -1) return sendJson(res, 404, { error: 'Servicio no encontrado' });
        services[idx] = { ...services[idx], ...updated, id };
        writeJson('services.json', services);
        return sendJson(res, 200, services[idx]);
      }
      if (method === 'DELETE') {
        if (!isAuthorized(req)) return sendJson(res, 401, { error: 'No autorizado' });
        let services = readJson('services.json');
        services = services.filter(s => s.id !== id);
        writeJson('services.json', services);
        return sendJson(res, 200, { ok: true });
      }
    }

    const toggleMatch = pathname.match(/^\/api\/services\/([a-zA-Z0-9_-]+)\/toggle$/);
    if (toggleMatch && method === 'PATCH') {
      if (!isAuthorized(req)) return sendJson(res, 401, { error: 'No autorizado' });
      const id = toggleMatch[1];
      const { active } = await getRequestBody(req);
      const services = readJson('services.json');
      const svc = services.find(s => s.id === id);
      if (!svc) return sendJson(res, 404, { error: 'No encontrado' });
      svc.active = (active !== undefined) ? active : !svc.active;
      writeJson('services.json', services);
      return sendJson(res, 200, svc);
    }

    // ── PROVIDERS ──
    if (pathname === '/api/providers' && method === 'GET') {
      if (!isAuthorized(req)) return sendJson(res, 401, { error: 'No autorizado' });
      return sendJson(res, 200, readJson('providers.json'));
    }

    if (pathname === '/api/providers' && method === 'POST') {
      const provider = await getRequestBody(req);
      provider.id = provider.id || 'prov-' + Date.now();
      provider.status = provider.status || 'pending';
      provider.createdAt = provider.createdAt || new Date().toISOString();
      const providers = readJson('providers.json');
      providers.push(provider);
      writeJson('providers.json', providers);
      return sendJson(res, 201, provider);
    }

    const provMatch = pathname.match(/^\/api\/providers\/([a-zA-Z0-9_-]+)$/);
    if (provMatch && method === 'PUT') {
      if (!isAuthorized(req)) return sendJson(res, 401, { error: 'No autorizado' });
      const id = provMatch[1];
      const data = await getRequestBody(req);
      const providers = readJson('providers.json');
      const p = providers.find(item => item.id === id);
      if (!p) return sendJson(res, 404, { error: 'No encontrado' });
      Object.assign(p, data);
      writeJson('providers.json', providers);
      return sendJson(res, 200, p);
    }

    // ── QUOTES / LEADS ──
    if (pathname === '/api/quotes' && method === 'GET') {
      if (!isAuthorized(req)) return sendJson(res, 401, { error: 'No autorizado' });
      return sendJson(res, 200, readJson('quotes.json'));
    }

    if (pathname === '/api/quotes' && method === 'POST') {
      const quote = await getRequestBody(req);
      quote.id = quote.id || 'quote-' + Date.now();
      quote.status = quote.status || 'pending';
      quote.createdAt = quote.createdAt || new Date().toISOString();
      const quotes = readJson('quotes.json');
      quotes.unshift(quote);
      writeJson('quotes.json', quotes);
      return sendJson(res, 201, quote);
    }

    const quoteStatusMatch = pathname.match(/^\/api\/quotes\/([a-zA-Z0-9_-]+)\/status$/);
    if (quoteStatusMatch && method === 'PATCH') {
      if (!isAuthorized(req)) return sendJson(res, 401, { error: 'No autorizado' });
      const id = quoteStatusMatch[1];
      const { status } = await getRequestBody(req);
      const quotes = readJson('quotes.json');
      const q = quotes.find(item => item.id === id);
      if (!q) return sendJson(res, 404, { error: 'No encontrado' });
      q.status = status;
      writeJson('quotes.json', quotes);
      return sendJson(res, 200, q);
    }

    // ── SETTINGS ──
    if (pathname === '/api/settings' && method === 'GET') {
      return sendJson(res, 200, readJson('settings.json', {}));
    }

    if (pathname === '/api/settings' && method === 'PUT') {
      if (!isAuthorized(req)) return sendJson(res, 401, { error: 'No autorizado' });
      const newSettings = await getRequestBody(req);
      const current = readJson('settings.json', {});
      const merged = { ...current, ...newSettings };
      
      // Si se envió cambio de contraseña
      if (newSettings.password) {
        const users = readJson('users.json');
        const admin = users.find(u => u.username === 'admin');
        if (admin) {
          admin.passwordHash = crypto.createHash('sha256').update(newSettings.password).digest('hex');
          writeJson('users.json', users);
        }
        delete merged.password;
      }

      writeJson('settings.json', merged);
      return sendJson(res, 200, merged);
    }

    return sendJson(res, 404, { error: 'Ruta API no encontrada' });
  }

  // ══════════════════════════════════════
  //  ARCHIVOS ESTÁTICOS
  // ══════════════════════════════════════
  serveStatic(req, res, pathname);
});

server.listen(PORT, () => {
  console.log(`\n🚀 [CN ConnectEC] Servidor web iniciado en http://localhost:${PORT}`);
  console.log(`📁 Catálogo: 5 servicios activos en Manta, Ecuador`);
  console.log(`🛡️ Panel Admin: http://localhost:${PORT}/admin.html\n`);
});
