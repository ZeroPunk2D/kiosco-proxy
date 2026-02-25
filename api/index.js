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
  color:white;
  overflow:hidden;
}

.container{
  width:95%;
  max-width:500px;
  padding:40px;
  border-radius:20px;
  backdrop-filter: blur(20px);
  background: rgba(15,20,35,0.85);
  border:1px solid rgba(255,255,255,0.1);
  box-shadow: 0 0 40px rgba(0,140,255,0.3);
  text-align:center;
  position:relative;
}

.container::before{
  content:'';
  position:absolute;
  inset:-2px;
  border-radius:20px;
  background:linear-gradient(45deg,#00b3ff,#ff003c);
  z-index:-1;
  filter:blur(15px);
  opacity:.6;
}

.header img{
  height:90px;
  margin-bottom:15px;
  filter: drop-shadow(0 0 10px rgba(255,0,60,.7));
}

.title{
  font-size:28px;
  font-weight:700;
  margin-bottom:10px;
  background: linear-gradient(90deg,#ffffff,#ff003c);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
}

.subtitle{
  font-size:15px;
  color:#b0b8d1;
  margin-bottom:30px;
  letter-spacing:1px;
}

.download-buttons{
  display:flex;
  flex-direction:column;
  gap:20px;
}

.download-button{
  padding:16px;
  border-radius:12px;
  text-decoration:none;
  font-weight:700;
  font-size:16px;
  letter-spacing:.5px;
  transition:.3s ease;
  position:relative;
  overflow:hidden;
}

.download-button::before{
  content:'';
  position:absolute;
  top:0;
  left:-100%;
  width:100%;
  height:100%;
  background:linear-gradient(120deg,transparent,rgba(255,255,255,.4),transparent);
  transition:.5s;
}

.download-button:hover::before{
  left:100%;
}

.ios{
  background:linear-gradient(45deg,#1e90ff,#0066ff);
  box-shadow:0 0 20px rgba(0,140,255,.6);
}

.android{
  background:linear-gradient(45deg,#ff003c,#c4002f);
  box-shadow:0 0 20px rgba(255,0,60,.6);
}

.download-button:hover{
  transform:translateY(-3px);
}

.footer{
  margin-top:35px;
  font-size:12px;
  color:#6c7a99;
  letter-spacing:1px;
}

@media(max-width:480px){
  .container{
    padding:30px 20px;
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
       Descargar para iPhone
    </a>

    <a href="${androidLink}" class="download-button android">
      🤖 Descargar para Android
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
