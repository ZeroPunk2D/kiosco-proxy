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

    // 🔒 WHITELIST (ajusta según necesites)
    const allowedDomains = ["olinweb.net"];
    if (!allowedDomains.includes(url.hostname)) {
      return response.status(403).json({ error: "Dominio no permitido" });
    }

    // ⏳ Timeout 8 segundos
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": request.headers["user-agent"] || "Mozilla/5.0",
        "Accept": "text/html",
      }
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return response.status(res.status).json({
        error: "Error al acceder al target",
        status: res.status
      });
    }

    const contentType = res.headers.get("content-type") || "";

    // 🔒 Solo HTML
    if (!contentType.includes("text/html")) {
      return response.status(415).json({
        error: "Solo se permite contenido HTML"
      });
    }

    let body = await res.text();

    // 🌐 Reescribir rutas relativas
    body = body.replace(/(href|src)="\/(.*?)"/g,
      `$1="https://${url.hostname}/$2"`
    );

    body = body.replace(/action="(.*?)"/g,
      (match, p1) => {
        if (p1.startsWith("http")) return match;
        return `action="https://${url.hostname}/${p1.replace(/^\//, "")}"`;
      }
    );

    // 🎯 Script kiosco optimizado (sin setInterval agresivo)
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

        ajustar();

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

    response.setHeader("Content-Type", "text/html; charset=utf-8");
    return response.status(200).send(body);

  } catch (err) {
    console.error("Proxy error:", err.message);

    return response.status(500).json({
      error: {
        code: "PROXY_ERROR",
        message: "No se pudo acceder al target.",
        details: err.message
      }
    });
  }
}
