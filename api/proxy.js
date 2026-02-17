// api/proxy.js

export default async function handler(request, response) {
  const targetUrl = request.query.target;

  if (!targetUrl) {
    return response.status(400).json({ error: "Falta el parámetro ?target=" });
  }

  try {
    // Timeout de 8 segundos
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    // Hacemos la petición con headers tipo navegador
    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    clearTimeout(timeout);

    // Verificar si la respuesta es HTML
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return response.status(415).json({ error: "Solo se permite contenido HTML" });
    }

    let body = await res.text();

    // Script de kiosco (tu adaptación)
    const scriptKiosco = `
      (function(){
        function ajustarKiosco(){
            if(!document.querySelector('meta[name=viewport]')){
                var meta = document.createElement('meta');
                meta.name='viewport';
                meta.content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
                document.head.appendChild(meta);
            }
            var contenedor = document.getElementById("contenedor");
            if(contenedor){
                contenedor.style.width="100%";
                contenedor.style.maxWidth="100vw";
                contenedor.style.margin="0 auto";
                contenedor.style.transform="scale(0.92)";
                contenedor.style.transformOrigin="top center";
            }
            var contenido = document.getElementById("contenidoPagKiosco");
            if(contenido){
                contenido.style.width="95%";
                contenido.style.margin="0 auto";
                contenido.style.left="0";
            }
            var botones = document.querySelectorAll(".botones");
            botones.forEach(function(b){
                b.style.fontSize="18px";
                b.style.padding="10px 15px";
            });
            var inputs = document.querySelectorAll("input[type=button], button, .botones");
            inputs.forEach(function(btn){
                btn.style.color = "#ffffff";
                btn.style.webkitTextFillColor = "#ffffff";
                btn.style.opacity = "1";
                btn.style.visibility = "visible";
            });
            var dialogs=document.querySelectorAll(".ui-dialog");
            dialogs.forEach(function(d){
                d.style.width="95vw";
                d.style.maxWidth="95vw";
                d.style.left="50%";
                d.style.transform="translateX(-50%)";
            });
            var objs=document.querySelectorAll(".ui-dialog-content object");
            objs.forEach(function(o){
                o.style.width="100%";
                o.style.height="70vh";
            });
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

    return response.status(200).setHeader('Content-Type', 'text/html').send(body);

  } catch (err) {
    console.error("Error en proxy:", err.message);

    // Diferenciar timeout de otros errores
    if (err.name === "AbortError") {
      return response.status(504).json({
        error: {
          code: "TIMEOUT",
          message: "El servidor tardó demasiado en responder (timeout)."
        }
      });
    }

    return response.status(500).json({
      error: {
        code: "PROXY_ERROR",
        message: "No se pudo acceder al target. Posible bloqueo o fallo del servidor.",
        details: err.message
      }
    });
  }
}
