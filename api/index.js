import fs from 'fs';
import path from 'path';

export default async function handler(request, response) {
  // Read config.json
  const configPath = path.resolve(process.cwd(), 'config.json');
  let config;
  try {
    const configFile = await fs.promises.readFile(configPath, 'utf8');
    config = JSON.parse(configFile);
  } catch (error) {
    console.error("Error reading config.json:", error);
    return response.status(500).send('Error loading configuration.');
  }

  const androidLink = config.androidLink || '#';
  const iosLink = config.iosLink || '#';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Descarga Kiosco Olin Mixtlit</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background-color: #f4f7f6;
                color: #333;
                text-align: center;
            }
            .container {
                background-color: #fff;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                width: 90%;
                max-width: 500px;
                box-sizing: border-box;
            }
            .header {
                margin-bottom: 30px;
            }
            .logo-text {
                font-size: 2.5em;
                font-weight: bold;
                color: #0056b3; /* A nice blue */
                margin-bottom: 5px;
            }
            .subtitle {
                font-size: 1.2em;
                color: #555;
            }
            .download-options {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            .option {
                padding: 20px;
                border: 1px solid #eee;
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 15px;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            .option:hover {
                transform: translateY(-5px);
                box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
            }
            .option img {
                width: 60px;
                height: 60px;
            }
            .download-button {
                display: inline-block;
                background-color: #007bff;
                color: white;
                padding: 12px 25px;
                border-radius: 6px;
                text-decoration: none;
                font-weight: bold;
                transition: background-color 0.2s ease;
            }
            .download-button:hover {
                background-color: #0056b3;
            }
            /* Hide elements by default */
            .android-option, .ios-option, .desktop-options {
                display: none;
            }
            .footer {
                margin-top: 30px;
                font-size: 0.8em;
                color: #888;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo-text">Olin Mixtlit</div>
                <div class="subtitle">Kiosco</div>
            </div>

            <div class="download-options" id="downloadOptions">
                <div class="option android-option" id="androidOption">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/d/d7/Android_robot.svg" alt="Android Logo">
                    <span>Descargar para Android</span>
                    <a href="${androidLink}" class="download-button">Descargar Ahora</a>
                </div>

                <div class="option ios-option" id="iosOption">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple Logo">
                    <span>Descargar para iOS</span>
                    <a href="${iosLink}" class="download-button">Descargar Ahora</a>
                </div>

                <div class="desktop-options" id="desktopOptions">
                    <div class="option">
                        <span>Selecciona tu plataforma:</span>
                        <a href="${androidLink}" class="download-button" style="margin-bottom: 10px;">Descargar Android</a>
                        <a href="${iosLink}" class="download-button">Descargar iOS</a>
                    </div>
                </div>
            </div>

            <div class="footer">
                &copy; ${new Date().getFullYear()} Olin Mixtlit. Todos los derechos reservados.
            </div>
        </div>

        <script>
            document.addEventListener('DOMContentLoaded', () => {
                const userAgent = navigator.userAgent || navigator.vendor || window.opera;
                const androidOption = document.getElementById('androidOption');
                const iosOption = document.getElementById('iosOption');
                const desktopOptions = document.getElementById('desktopOptions');

                if (/android/i.test(userAgent)) {
                    androidOption.style.display = 'flex';
                } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
                    iosOption.style.display = 'flex';
                } else {
                    desktopOptions.style.display = 'flex';
                }
            });
        </script>
    </body>
    </html>
  `;

  response.setHeader('Content-Type', 'text/html');
  response.status(200).send(htmlContent);
}
