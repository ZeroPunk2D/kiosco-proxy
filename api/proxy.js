// api/proxy.js

export default async function handler(request, response) {
  const targetUrl = request.query.target;

  if (!targetUrl) {
    return response.status(400).json({ error: "Falta el parámetro ?target=" });
  }

  try {
    const url = new URL(targetUrl);

    // 🔒 Solo permitir HTTPS
    if (url.protocol !== "https:") {
      return response.status(403).json({ error: "Solo se permite HTTPS" });
    }

    // 🔒 WHITELIST de dominios
    const allowedDomains = ["olinweb.net"];
    if (!allowedDomains.includes(url.hostname)) {
      return response.status(403).json({ error: "Dominio no permitido" });
    }

    // ⏳ Timeout de 8 segundos
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": request.headers["user-agent"] || "Mozilla/5.0",
        "Accept": "text/html",
      },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return response.status(res.status).json({
        error: "Error al acceder al target",
        status: res.status,
      });
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return response.status(415).json({
        error: "Solo se permite contenido HTML",
      });
    }

    let body = await res.text();

    // 🌐 Insertar <base> para que rutas relativas funcionen
    const baseTag = `<base href="https://${url.hostname}/">`;
    if (body.includes("<head>")) {
      body = body.replace("<head>", `<head>${baseTag}`);
    }

    // 🎯 Script kiosco optimizado
    const scriptKiosco = `
      (function(){
        function ajustar(){
          if(!document.querySelector('meta[name=viewport]')){
            var meta=document.createElement('meta');
            meta.name='viewport';
            meta.content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
            document.head.appendChild(meta);
          }
          var cont=document.getElementById("contenedor");
          if(cont){
            cont.style.width="100%";
            cont.style.maxWidth="100vw";
            cont.style.margin="0 auto";
            cont.style.transform="scale(0.92)";
            cont.style.transformOrigin="top center";
          }
        }

        // Ejecutar al cargar
        ajustar();

        // Detectar cambios dinámicos en el DOM
        const observer = new MutationObserver(ajustar);
        observer.observe(document.body, { childList:true, subtree:true });
      })();
    `;

    const scriptTag = `<script>${scriptKiosco}</script>`;

    if (body.includes("</body>")) {
      body = body.replace("</body>", `${scriptTag}</body>`);
    } else {
      body += scriptTag;
    }

    // 🔧 Devolver HTML
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    return response.status(200).send(body);

  } catch (err) {
    console.error("Proxy error:", err.message);

    return response.status(500).json({
      error: {
        code: "PROXY_ERROR",
        message: "No se pudo acceder al target.",
        details: err.message,
      },
    });
  }
}
