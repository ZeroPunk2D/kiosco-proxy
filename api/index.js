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

const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Descarga Kiosco Olin Mixtli</title>

<!-- Fuente llamativa -->
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap" rel="stylesheet">

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
    radial-gradient(circle at 20% 30%, rgba(255,0,0,.45), transparent 55%),
    radial-gradient(circle at 80% 70%, rgba(255,50,50,.35), transparent 55%),
    #0a0f1c;
}

/* CONTENEDOR MÁS COMPACTO */
.container{
  width:90%;
  max-width:500px; /* 🔥 más pequeño */
  padding:50px 35px; /* 🔥 menos largo */
  border-radius:25px;
  background: linear-gradient(135deg, #ffffff 55%, #ffd6d6 100%);
  box-shadow:
    0 0 40px rgba(255,0,0,0.6),
    0 0 90px rgba(255,0,0,0.4);
  text-align:center;
  position:relative;
  overflow:hidden;
}

/* EFECTO ROJO MÁS VISIBLE */
.container::before{
  content:"";
  position:absolute;
  width:380px;
  height:380px;
  background:radial-gradient(circle, rgba(255,0,0,0.6), transparent 70%);
  top:-120px;
  right:-120px;
  z-index:0;
}

.container > *{
  position:relative;
  z-index:1;
}

/* LOGO */
.header img{
  width:250px;
  max-width:90%;
  margin-bottom:25px;
  padding:15px;
  background:white;
  border-radius:25px;
  border:4px solid black;
  box-shadow:0 0 25px rgba(0,0,0,0.5);
}

/* TITULO NUEVA FUENTE PRO */
.title{
  font-family: 'Orbitron', sans-serif; /* 🔥 nueva fuente */
  font-size: clamp(40px, 6vw, 58px);
  font-weight:900;
  margin-bottom:15px;
  color:black;
  letter-spacing:4px;
  text-shadow:
    0 0 10px #ffffff,
    0 0 25px rgba(255,0,0,0.7);
}

.subtitle{
  font-size:17px;
  color:black;
  margin-bottom:40px;
  font-weight:700;
}

/* AREA BOTONES NEGRA */
.download-buttons{
  display:flex;
  flex-direction:column;
  gap:20px;
  padding:25px;
  background:black;
  border-radius:20px;
}

/* BOTONES */
.download-button{
  width:100%;
  height:58px;
  display:flex;
  align-items:center;
  justify-content:center;
  border-radius:14px;
  text-decoration:none;
  font-weight:800;
  font-size:17px;
  transition:.3s ease;
}

/* IPHONE BLANCO NEON */
.ios{
  background:white;
  color:black;
  box-shadow:
    0 0 20px #fff,
    0 0 40px #fff,
    0 0 70px #fff;
}

.ios:hover{
  transform:scale(1.05);
}

/* ANDROID VERDE NEON */
.android{
  background:#00ff66;
  color:black;
  box-shadow:
    0 0 20px #00ff66,
    0 0 40px #00ff66,
    0 0 70px #00ff66;
}

.android:hover{
  transform:scale(1.05);
}

/* FOOTER */
.footer{
  margin-top:35px;
  font-size:14px;
  color:black;
  font-weight:700;
}

@media(max-width:480px){
  .header img{
    width:190px;
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
       Descargar para iPhone
    </a>

    <a href="\${androidLink}" class="download-button android">
       Descargar para Android
    </a>
  </div>

  <div class="footer">
    © 2026. Olin Mixtli · Rápido · Seguro · Moderno
  </div>

</div>
</body>
</html>
`;

  response.setHeader('Content-Type', 'text/html');
  response.status(200).send(htmlContent);
}
