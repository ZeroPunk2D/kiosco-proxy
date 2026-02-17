// api/proxy.js

// Usamos el 'fetch' que ya viene en el entorno de Vercel
// No se necesitan dependencias externas como node-fetch

export default async function handler(request, response) {
  // 1. Obtener la URL de destino desde el parámetro ?target=
  const targetUrl = request.query.target;

  if (!targetUrl) {
    return response.status(400).send('Error: Falta el parámetro ?target=');
  }

  try {
    // 2. Cargar el contenido de la página web de destino
    const res = await fetch(targetUrl);
    let body = await res.text();

    // 3. Este es tu script de adaptación. Lo he copiado de tu ViewController.
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

    // 4. Inyectar el script justo antes del cierre de la etiqueta </body>
    const scriptTag = `<script>${scriptKiosco}</script>`;
    if (body.includes('</body>')) {
      body = body.replace('</body>', `${scriptTag}</body>`);
    } else {
      body += scriptTag; // Si no hay </body>, lo añade al final.
    }

    // 5. Devolver el HTML modificado
    return response.status(200).setHeader('Content-Type', 'text/html').send(body);

  } catch (error) {
    console.error(error);
    return response.status(500).send('Error al cargar la página de destino.');
  }
}
