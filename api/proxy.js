// api/proxy.js

export default async function handler(request, response) {
  const targetUrl = request.query.target;

  if (!targetUrl) {
    return response.status(400).json({ error: "Falta el parámetro ?target=" });
  }

  try {
    const url = new URL(targetUrl);

    // 🔒 Solo HTTPS
    if (url.protocol !== "https:") {
      return response.status(403).json({ error: "Solo se permite HTTPS" });
    }

    // 🔒 Solo dominios permitidos
    const allowedDomains = ["olinweb.net"];
    if (!allowedDomains.includes(url.hostname)) {
      return response.status(403).json({ error: "Dominio no permitido" });
    }

    // ⏳ Timeout 8s
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

    // 🌐 Insertar <base> para rutas relativas
    const baseTag = `<base href="https://${url.hostname}/">`;
    if (body.includes("<head>")) {
      body = body.replace("<head>", `<head>${baseTag}`);
    }

    // 🔄 Reescribir URLs AJAX/fetch/axios para que pasen por el proxy
    // Esto intercepta URLs absolutas en JS y las cambia a tu proxy
    const proxyRewriteScript = `
      (function(){
        // intercept fetch
        const originalFetch = window.fetch;
        window.fetch = function(input, init) {
          let url = (typeof input === 'string') ? input : input.url;
          if(url.startsWith("http://") || url.startsWith("https://")) {
            const parsed = new URL(url);
            if(["${allowedDomains.join('","')}"].includes(parsed.hostname)){
              url = "/api/proxy?target=" + encodeURIComponent(url);
              if(typeof input === 'string'){
                input = url;
              } else {
                input = new Request(url, input);
              }
            }
          }
          return originalFetch(input, init);
        };

        // intercept axios (si existe)
        if(window.axios){
          const originalAxios = window.axios;
          window.axios = function(config){
            if(typeof config === 'string'){
              let parsed = new URL(config, window.location.href);
              if(["${allowedDomains.join('","')}"].includes(parsed.hostname)){
                config = "/api/proxy?target=" + encodeURIComponent(parsed.href);
              }
            } else if(config.url){
              const parsed = new URL(config.url, window.location.href);
              if(["${allowedDomains.join('","')}"].includes(parsed.hostname)){
                config.url = "/api/proxy?target=" + encodeURIComponent(parsed.href);
              }
            }
            return originalAxios(config);
          };
          // copiar métodos como get/post/etc.
          ["get","post","put","delete","patch","head"].forEach(m=>{
            window.axios[m] = originalAxios[m];
          });
        }
      })();
    `;

    // 🎯 Script kiosco optimizado
    const kioscoScript = `
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

    const finalScript = `<script>${proxyRewriteScript}${kioscoScript}</script>`;

    if(body.includes("</body>")){
      body = body.replace("</body>", `${finalScript}</body>`);
    } else {
      body += finalScript;
    }

    response.setHeader("Content-Type", "text/html; charset=utf-8");
    return response.status(200).send(body);

  } catch(err){
    console.error("Proxy error:", err.message);
    return response.status(500).json({
      error:{
        code:"PROXY_ERROR",
        message:"No se pudo acceder al target.",
        details: err.message
      }
    });
  }
}
