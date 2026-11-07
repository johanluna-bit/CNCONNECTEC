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

// Límite exclusivo de upload: base64 de 5 MB más el envoltorio JSON.
function getUploadBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let exceeded = false;
    req.on('data', chunk => {
      size += chunk.length;
      if (size > 7 * 1024 * 1024) {
        if (!exceeded) {
          exceeded = true;
          chunks.length = 0;
          reject(Object.assign(new Error('La carga supera el límite permitido.'), { status: 413 }));
        }
        return;
      }
      if (!exceeded) chunks.push(chunk);
    });
    req.on('end', () => {
      if (exceeded) return;
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(Object.assign(new Error('JSON inválido.'), { status: 400 }));
      }
    });
    req.on('error', reject);
  });
}

// El mismo respaldo alimenta la API cuando aún no existe el archivo persistido.
function readCategories() {
  if (!fs.existsSync(path.join(DATA_DIR, 'categories.json'))) {
    const source = fs.readFileSync(path.join(__dirname, 'js/data/categories-data.js'), 'utf8');
    const defaults = JSON.parse(source.slice(source.indexOf('['), source.lastIndexOf(']') + 1));
    if (!writeJson('categories.json', defaults)) throw new Error('No se pudo crear el catálogo');
  }
  return readJson('categories.json');
}
function validCategory(c) {
  return c && typeof c.id === 'string' && /^[a-z0-9-]{2,32}$/.test(c.id) &&
    typeof c.label === 'string' && c.label.trim().length >= 1 && c.label.trim().length <= 40 &&
    typeof c.icon === 'string' && /^fa-[a-z0-9-]+$/.test(c.icon) &&
    typeof c.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(c.color);
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
  '.webp': 'image/webp',
  '.gif':  'image/gif'
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

    // ── IMAGE UPLOAD ──
    if (pathname === '/api/upload' && method === 'POST') {
      if (!isAuthorized(req)) return sendJson(res, 401, { error: 'No autorizado' });
      try {
        const body = await getUploadBody(req);
        const { filename, dataUrl } = body || {};
        const match = typeof dataUrl === 'string' &&
          dataUrl.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/]+={0,2})$/);
        if (typeof filename !== 'string' || !filename.trim() || filename.length > 255 || !match) {
          return sendJson(res, 400, { error: 'Enviá un nombre y una imagen JPEG, PNG, WebP o GIF válida.' });
        }
        const image = Buffer.from(match[2], 'base64');
        if (!image.length || image.toString('base64') !== match[2]) {
          return sendJson(res, 400, { error: 'Imagen base64 inválida.' });
        }
        if (image.length > 5 * 1024 * 1024) {
          return sendJson(res, 413, { error: 'La imagen supera los 5 MB.' });
        }
        const extensions = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };
        const base = path.parse(filename.replace(/\\/g, '/').split('/').pop()).name
          .replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 80) || 'imagen';
        const savedName = base + '-' + crypto.randomBytes(16).toString('hex') + extensions[match[1]];
        const directory = path.join(__dirname, 'assets', 'uploads');
        await fs.promises.mkdir(directory, { recursive: true });
        await fs.promises.writeFile(path.join(directory, savedName), image, { flag: 'wx' });
        return sendJson(res, 200, { ok: true, url: '/assets/uploads/' + savedName });
      } catch (err) {
        return sendJson(res, err.status || 500, {
          error: err.status ? err.message : 'No se pudo guardar la imagen.'
        });
      }
    }

    // ── CATEGORIES ──
    const categoryMatch = pathname.match(/^\/api\/categories\/([a-z0-9-]+)$/);
    if (pathname === '/api/categories' || categoryMatch) {
      if (method !== 'GET' && !isAuthorized(req)) return sendJson(res, 401, { error: 'No autorizado' });
      try {
        const categories = readCategories();
        if (pathname === '/api/categories' && method === 'GET') return sendJson(res, 200, categories);
        if (pathname === '/api/categories' && method === 'POST') {
          const body = await getRequestBody(req);
          if (!validCategory(body)) return sendJson(res, 400, { error: 'Categoría inválida: revisá id, nombre, icono y color hexadecimal.' });
          if (categories.some(c => c.id === body.id)) return sendJson(res, 409, { error: 'El ID ya existe.' });
          const category = { id: body.id, label: body.label.trim(), icon: body.icon, color: body.color };
          categories.push(category);
          if (!writeJson('categories.json', categories)) throw new Error('No se pudo guardar');
          return sendJson(res, 201, category);
        }
        if (categoryMatch) {
          const id = categoryMatch[1];
          const idx = categories.findIndex(c => c.id === id);
          if (idx === -1) return sendJson(res, 404, { error: 'Categoría no encontrada' });
          if (method === 'PUT') {
            const body = await getRequestBody(req);
            if (body.id !== undefined && body.id !== id) return sendJson(res, 400, { error: 'El ID no se puede cambiar.' });
            const category = { ...categories[idx], ...Object.fromEntries(['label', 'icon', 'color'].filter(k => body[k] !== undefined).map(k => [k, body[k]])), id };
            if (!validCategory(category)) return sendJson(res, 400, { error: 'Nombre, icono o color inválido.' });
            category.label = category.label.trim();
            categories[idx] = category;
            if (!writeJson('categories.json', categories)) throw new Error('No se pudo guardar');
            return sendJson(res, 200, category);
          }
          if (method === 'DELETE') {
            const usedBy = readJson('services.json').filter(s => s.category === id).length;
            if (usedBy) return sendJson(res, 409, { error: 'Categoría utilizada por servicios.', usedBy });
            categories.splice(idx, 1);
            if (!writeJson('categories.json', categories)) throw new Error('No se pudo guardar');
            return sendJson(res, 200, { ok: true });
          }
        }
        return sendJson(res, 405, { error: 'Método no permitido' });
      } catch {
        return sendJson(res, 500, { error: 'No se pudo guardar el catálogo.' });
      }
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
