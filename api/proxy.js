// api/proxy.js
import { Readable } from 'stream'; // Importar Readable para Node.js streaming

export default async function handler(request, response) {
  // 1. Obtener la URL de destino desde el parámetro ?target=
  const targetUrl = request.query.target;

  if (!targetUrl) {
    return response.status(400).send('Error: Falta el parámetro ?target=');
  }

  try {
    // Interceptar la petición de popper.js y servirla desde una CDN
    if (targetUrl === 'https://olinweb.net/libs/bootstrap-4.3.1/popper.js') {
      console.log('PROXY: Interceptando popper.js y sirviendo desde CDN.');
      const cdnUrl = 'https://cdn.jsdelivr.net/npm/popper.js@1.14.7/dist/umd/popper.min.js';
      const cdnResponse = await fetch(cdnUrl);

      response.status(cdnResponse.status);
      cdnResponse.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'content-encoding' && key.toLowerCase() !== 'transfer-encoding' && key.toLowerCase() !== 'connection') {
          response.setHeader(key, value);
        }
      });
      if (cdnResponse.body) {
        const nodeReadable = Readable.fromWeb(cdnResponse.body);
        nodeReadable.pipe(response);
      } else {
        response.end();
      }
      return; // Importante: terminar la ejecución aquí para no seguir procesando
    }

    const originResponse = await fetch(targetUrl);

    // 3. Revisar el tipo de contenido de la respuesta
    const contentType = originResponse.headers.get('content-type') || '';

    // 4. SI ES HTML, lo modificamos. SI NO (ej: JSON, CSS, JS), lo pasamos tal cual.
    if (contentType.includes('text/html')) {
      let body = await originResponse.text();
      const targetOrigin = new URL(targetUrl).origin;
      const proxyUrl = `https://${request.headers.host}/api/proxy`;
      const baseTag = `<base href="${targetOrigin}">`;

      if (body.includes('<head>')) {
        body = body.replace('<head>', `<head>\n    ${baseTag}`);
      } else {
        body = baseTag + body;
      }

      const scriptKiosco = `
        (function(){
          const proxyUrl = '${proxyUrl}';
          const targetOrigin = '${targetOrigin}';

          function rewriteUrl(originalUrl) {
              if (!originalUrl) return originalUrl;
              if (originalUrl.includes('//localhost')) {
                  console.log('PROXY: Bloqueando llamada a red local:', originalUrl);
                  return null;
              }
              const absoluteUrl = new URL(originalUrl, targetOrigin).toString();
              if (absoluteUrl.startsWith(targetOrigin)) {
                  const newUrl = \`\${proxyUrl}?target=\${encodeURIComponent(absoluteUrl)}\`;
                  console.log('PROXY: Reescribiendo URL para evitar CORS: ', originalUrl);
                  return newUrl;
              }
              return absoluteUrl;
          }

          const originalFetch = window.fetch;
          window.fetch = function(url, options) {
              const newUrl = rewriteUrl(url);
              if (newUrl === null) return Promise.reject(new Error('Llamada a red local bloqueada por el proxy.'));
              return originalFetch.call(this, newUrl, options);
          };

          const originalXhrOpen = XMLHttpRequest.prototype.open;
          XMLHttpRequest.prototype.open = function(method, url, ...args) {
              const newUrl = rewriteUrl(url);
              if (newUrl === null) throw new Error('XHR a red local bloqueada por el proxy.');
              return originalXhrOpen.apply(this, [method, newUrl, ...args]);
          };
          
          function ajustarKiosco(){
              if(!document.querySelector('meta[name=viewport]')){
                  var meta = document.createElement('meta');
                  meta.name='viewport';
                  meta.content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
                  document.head.appendChild(meta);
              }
              var contenedor = document.getElementById("contenedor");
              if(contenedor){ contenedor.style.cssText += 'width:100%; max-width:100vw; margin:0 auto; transform:scale(0.92); transform-origin:top center;'; }
              var contenido = document.getElementById("contenidoPagKiosco");
              if(contenido){ contenido.style.cssText += 'width:95%; margin:0 auto; left:0;'; }
              document.querySelectorAll(".botones").forEach(b => b.style.cssText += 'font-size:18px; padding:10px 15px;');
              document.querySelectorAll("input[type=button], button, .botones").forEach(btn => btn.style.cssText += 'color:#ffffff; -webkit-text-fill-color:#ffffff; opacity:1; visibility:visible;');
              document.querySelectorAll(".ui-dialog").forEach(d => d.style.cssText += 'width:95vw; max-width:95vw; left:50%; transform:translateX(-50%);');
              document.querySelectorAll(".ui-dialog-content object").forEach(o => o.style.cssText += 'width:100%; height:70vh;');
          }
          setInterval(ajustarKiosco, 800);
        })();
      `;

      const scriptTag = `<script>${scriptKiosco}</script>`;
      if (body.includes('</body>')) {
        body = body.replace('</body>', `${scriptTag}</body>`);
      } else {
        body += scriptTag;
      }
      response.status(200).setHeader('Content-Type', 'text/html').send(body);

    } else {
      // Para cualquier otro tipo de contenido (JSON, CSS, JS, etc.), lo transmitimos directamente.
      console.log(`PROXY: Pasando contenido de tipo '${contentType}' sin modificar.`);
      
      response.status(originResponse.status);
      originResponse.headers.forEach((value, key) => {
        // Excluir headers que Node.js/Vercel manejan automáticamente o que causan problemas
        if (key.toLowerCase() !== 'content-encoding' && key.toLowerCase() !== 'transfer-encoding' && key.toLowerCase() !== 'connection') {
          response.setHeader(key, value);
        }
      });
      
      // Convertir el ReadableStream Web al ReadableStream de Node.js y luego hacer pipe.
      // Esto es crucial para el streaming de datos correctamente en funciones Serverless de Vercel.
      if (originResponse.body) {
        const nodeReadable = Readable.fromWeb(originResponse.body);
        nodeReadable.pipe(response);
      } else {
        response.end();
      }
    }

  } catch (error) {
    console.error(error);
    response.status(500).send(`Error en el proxy: ${error.message}`);
  }
}
