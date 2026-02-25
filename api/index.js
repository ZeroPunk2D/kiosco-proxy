import fs from 'fs';
import path from 'path';

export default async function handler(request, response) {
  let config;
  try {
    const configPath = path.resolve(process.cwd(), 'config.json');
    const configFile = await fs.promises.readFile(configPath, 'utf8');
    config = JSON.parse(configFile);
  } catch (error) {
    console.error("Error reading config.json:", error);
    // Fallback config if file is missing
    config = {
      androidLink: "#",
      iosLink: "#"
    };
  }

  const androidLink = config.androidLink || '#';
  const iosLink = config.iosLink || '#';


const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Descarga Kiosco Olin Mixtli</title>

<style>
*{
  margin:0;
  padding:0;
  box-sizing:border-box;
}

body{
  font-family: 'Segoe UI', sans-serif;
  min-height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  background:
    radial-gradient(circle at 20% 30%, rgba(255,0,0,.3), transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(255,255,255,.4), transparent 50%),
    #0a0f1c;
}

/* CONTENEDOR */
.container{
  width:95%;
  max-width:560px;
  padding:60px 45px;
  border-radius:25px;
  background: linear-gradient(135deg, #ffffff 60%, #ffe5e5 100%);
  box-shadow:
    0 0 25px rgba(255,0,0,0.4),
    0 0 70px rgba(255,0,0,0.3);
  text-align:center;
  position:relative;
  overflow:hidden;
}

/* EFECTO ROJO INTERNO */
.container::before{
  content:"";
  position:absolute;
  width:320px;
  height:320px;
  background:radial-gradient(circle, rgba(255,0,0,0.4), transparent 70%);
  top:-80px;
  right:-80px;
  z-index:0;
}

.container > *{
  position:relative;
  z-index:1;
}

/* LOGO */
.header img{
  width:260px;
  max-width:90%;
  margin-bottom:30px;
  padding:15px;
  background:white;
  border-radius:25px;
  border:4px solid black;
  box-shadow:0 0 20px rgba(0,0,0,0.5);
}

/* TITULO */
.title{
  font-size: clamp(42px, 6vw, 60px);
  font-weight:900;
  margin-bottom:15px;
  color:black;
  letter-spacing:2px;
  text-shadow:
    0 0 8px #fff,
    0 0 20px #fff;
}

.subtitle{
  font-size:18px;
  color:black;
  margin-bottom:45px;
  font-weight:700;
}

/* AREA BOTONES NEGRA */
.download-buttons{
  display:flex;
  flex-direction:column;
  gap:22px;
  padding:30px;
  background:black;
  border-radius:20px;
}

/* BOTONES BASE */
.download-button{
  width:100%;
  height:60px;                /* 🔥 ALTURA FIJA */
  display:flex;               /* 🔥 CENTRADO PERFECTO */
  align-items:center;
  justify-content:center;
  border-radius:14px;
  text-decoration:none;
  font-weight:800;
  font-size:18px;
  transition:.3s ease;
}

/* IPHONE BLANCO NEON */
.ios{
  background:white;
  color:black;
  box-shadow:
    0 0 15px #fff,
    0 0 30px #fff,
    0 0 60px #fff;
}

.ios:hover{
  transform:scale(1.05);
}

/* ANDROID VERDE NEON */
.android{
  background:#00ff66;
  color:black;
  box-shadow:
    0 0 15px #00ff66,
    0 0 35px #00ff66,
    0 0 70px #00ff66;
}

.android:hover{
  transform:scale(1.05);
}

/* FOOTER */
.footer{
  margin-top:40px;
  font-size:15px;
  color:black;
  font-weight:700;
}

@media(max-width:480px){
  .header img{
    width:200px;
  }
}
</style>
</head>

<body>
<div class="container">

  <div class="header">
    <img src="/logo.png" alt="Olin Mixtli Logo">
  </div>

  <div class="title">KIOSCO MÓVIL</div>
  <div class="subtitle">Descarga Oficial Olin Mixtli</div>

  <div class="download-buttons">
    <a href="\${iosLink}" class="download-button ios">
       Descargar para iPhone
    </a>

    <a href="\${androidLink}" class="download-button android">
      🤖 Descargar para Android
    </a>
  </div>

  <div class="footer">
    © \${new Date().getFullYear()} Olin Mixtli · Rápido · Seguro · Moderno
  </div>

</div>
</body>
</html>
`;

  response.setHeader('Content-Type', 'text/html');
  response.status(200).send(htmlContent);
}
