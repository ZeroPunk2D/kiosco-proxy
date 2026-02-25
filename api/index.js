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
    radial-gradient(circle at 20% 30%, rgba(0,140,255,.3), transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(255,0,60,.3), transparent 40%),
    #0a0f1c;
  overflow:hidden;
}

/* CONTENEDOR */
.container{
  width:95%;
  max-width:520px;
  padding:50px 40px;
  border-radius:20px;
  background: rgba(255,255,255,0.95);
  box-shadow: 0 0 40px rgba(0,0,0,0.4);
  text-align:center;
}

/* LOGO */
.header img{
  width:140px;
  margin-bottom:20px;
  padding:10px;
  background:white;
  border-radius:20px;
  border:3px solid black;
  box-shadow:0 0 15px rgba(0,0,0,0.4);
}

/* TITULO */
.title{
  font-size:32px;
  font-weight:900;
  margin-bottom:10px;
  color:black;
  text-shadow:
    0 0 5px #fff,
    0 0 15px #fff,
    0 0 25px #fff;
}

.subtitle{
  font-size:16px;
  color:black;
  margin-bottom:35px;
  font-weight:600;
}

/* AREA BOTONES */
.download-buttons{
  display:flex;
  flex-direction:column;
  gap:20px;
  padding:25px;
  background:black;
  border-radius:20px;
}

/* BOTONES BASE */
.download-button{
  padding:18px;
  border-radius:12px;
  text-decoration:none;
  font-weight:800;
  font-size:17px;
  letter-spacing:.5px;
  transition:.3s ease;
  display:block;
}

/* IPHONE BLANCO NEON */
.ios{
  background:white;
  color:black;
  box-shadow:
    0 0 10px #fff,
    0 0 20px #fff,
    0 0 40px #fff;
}

.ios:hover{
  transform:scale(1.05);
}

/* ANDROID VERDE NEON */
.android{
  background:#00ff66;
  color:black;
  box-shadow:
    0 0 10px #00ff66,
    0 0 25px #00ff66,
    0 0 50px #00ff66;
}

.android:hover{
  transform:scale(1.05);
}

/* FOOTER */
.footer{
  margin-top:30px;
  font-size:13px;
  color:black;
  font-weight:600;
}

@media(max-width:480px){
  .container{
    padding:35px 20px;
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
    <a href="${iosLink}" class="download-button ios">
       Descargar para iPhone
    </a>

    <a href="${androidLink}" class="download-button android">
       Descargar para Android
    </a>
  </div>

  <div class="footer">
    © ${new Date().getFullYear()} Olin Mixtli · Rápido · Seguro · Moderno
  </div>

</div>
</body>
</html>
`;

  response.setHeader('Content-Type', 'text/html');
  response.status(200).send(htmlContent);
}
