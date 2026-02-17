// api/proxy.js

export default async function handler(request, response) {
  // 1. Obtener la URL de destino desde el parámetro ?target=
  const targetUrl = request.query.target;

  if (!targetUrl) {
    return response.status(400).send('Error: Falta el parámetro ?target=');
  }

  try {
    // 2. Cargar el contenido de la página web de destino
    // La petición desde el servidor de Vercel no tiene problemas de CORS.
    const res = await fetch(targetUrl);
    let body = await res.text();

    // 3. Crear las URLs base necesarias para el script de reescritura
    const targetOriginUrl = new URL(targetUrl);
    const targetOrigin = `${targetOriginUrl.protocol}//${targetOriginUrl.host}`;
    
    // La URL de este mismo proxy
    const proxyUrl = `https://${request.headers.host}/api/proxy`;

    // 4. Inyectar la etiqueta <base> para arreglar rutas relativas de assets (CSS, etc.)
    const baseTag = `<base href="${targetOrigin}">`;
    if (body.includes('<head>')) {
      body = body.replace('<head>', `<head>\n    ${baseTag}`);
    } else {
      body = baseTag + body;
    }

    // 5. Script final y definitivo que será inyectado.
    // Incluye: Bloqueo de red local, reescritura de URLs para evitar CORS, y ajustes de estilo.
    const scriptKiosco = `
      (function(){
        const proxyUrl = '${proxyUrl}';
        const targetOrigin = '${targetOrigin}';

        // --- FUNCIÓN CENTRAL DE REESCRITURA DE URLS ---
        function rewriteUrl(originalUrl) {
            if (!originalUrl) return originalUrl;

            // Bloquear llamadas a la red local
            if (originalUrl.includes('//localhost')) {
                console.log('PROXY: Bloqueando llamada a red local:', originalUrl);
                return null; // Devuelve null para indicar que debe ser bloqueada
            }

            // Convertir URL relativa (ej: /dataKiosco.php) en absoluta
            const absoluteUrl = new URL(originalUrl, targetOrigin).toString();

            // Si la URL pertenece al dominio de destino, reescribirla para que pase por el proxy.
            // Si no, se deja intacta (ej: llamadas a google-analytics, etc.)
            if (absoluteUrl.startsWith(targetOrigin)) {
                const newUrl = \`\${proxyUrl}?target=\${encodeURIComponent(absoluteUrl)}\`;
                console.log('PROXY: Reescribiendo URL para evitar CORS: ', originalUrl, '->', newUrl);
                return newUrl;
            }

            return absoluteUrl;
        }

        // --- INTERCEPTOR PARA 'FETCH' ---
        const originalFetch = window.fetch;
        window.fetch = function(url, options) {
            const newUrl = rewriteUrl(url);
            if (newUrl === null) {
                return Promise.reject(new Error('Llamada a red local bloqueada por el proxy.'));
            }
            return originalFetch.call(this, newUrl, options);
        };

        // --- INTERCEPTOR PARA 'XMLHTTPREQUEST' ---
        const originalXhrOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url, ...args) {
            const newUrl = rewriteUrl(url);
            if (newUrl === null) {
                // Al lanzar aquí, la petición muere antes de empezar.
                throw new Error('XHR a red local bloqueada por el proxy.');
            }
            // Guardamos la URL reescrita para usarla en 'send' si fuera necesario.
            this._rewrittenUrl = newUrl;
            return originalXhrOpen.apply(this, [method, newUrl, ...args]);
        };
        
        // --- FUNCIÓN DE AJUSTE DE ESTILOS (sin cambios) ---
        function ajustarKiosco(){
            if(!document.querySelector('meta[name=viewport]')){
                var meta = document.createElement('meta');
                meta.name='viewport';
                meta.content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
                document.head.appendChild(meta);
            }
            var contenedor = document.getElementById("contenedor");
            if(contenedor){ contenedor.style.width="100%"; contenedor.style.maxWidth="100vw"; contenedor.style.margin="0 auto"; contenedor.style.transform="scale(0.92)"; contenedor.style.transformOrigin="top center"; }
            var contenido = document.getElementById("contenidoPagKiosco");
            if(contenido){ contenido.style.width="95%"; contenido.style.margin="0 auto"; contenido.style.left="0"; }
            var botones = document.querySelectorAll(".botones");
            botones.forEach(function(b){ b.style.fontSize="18px"; b.style.padding="10px 15px"; });
            var inputs = document.querySelectorAll("input[type=button], button, .botones");
            inputs.forEach(function(btn){ btn.style.color = "#ffffff"; btn.style.webkitTextFillColor = "#ffffff"; btn.style.opacity = "1"; btn.style.visibility = "visible"; });
            var dialogs=document.querySelectorAll(".ui-dialog");
            dialogs.forEach(function(d){ d.style.width="95vw"; d.style.maxWidth="95vw"; d.style.left="50%"; d.style.transform="translateX(-50%)"; });
            var objs=document.querySelectorAll(".ui-dialog-content object");
            objs.forEach(function(o){ o.style.width="100%"; o.style.height="70vh"; });
        }
        setInterval(ajustarKiosco, 800);
      })();
    `;

    // 6. Inyectar el script final antes del cierre del body
    const scriptTag = `<script>${scriptKiosco}</script>`;
    if (body.includes('</body>')) {
      body = body.replace('</body>', `${scriptTag}</body>`);
    } else {
      body += scriptTag;
    }

    // 7. Devolver el HTML modificado
    return response.status(200).setHeader('Content-Type', 'text/html').send(body);

  } catch (error) {
    console.error(error);
    return response.status(500).send(`Error en el proxy: ${error.message}`);
  }
}
