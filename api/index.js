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
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background-color: #f0f2f5;
                color: #1c1e21;
                text-align: center;
            }
            .container {
                background-color: #ffffff;
                padding: 30px 40px;
                border-radius: 12px;
                box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
                width: 90%;
                max-width: 450px;
            }
            .header {
                margin-bottom: 30px;
            }
            .logo-text {
                font-size: 2.8em;
                font-weight: 700;
                color: #1877f2; /* A modern blue */
                margin-bottom: 5px;
            }
            .subtitle {
                font-size: 1.5em;
                color: #606770;
            }
            .download-buttons {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            .download-button {
                display: block;
                background-color: #1877f2;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                text-decoration: none;
                font-size: 1.1em;
                font-weight: 600;
                transition: background-color 0.2s ease, transform 0.1s ease;
            }
            .download-button:hover {
                background-color: #166fe5;
            }
            .download-button:active {
                transform: scale(0.98);
            }
            .footer {
                margin-top: 30px;
                font-size: 0.8em;
                color: #8a8d91;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo-text">Olin Mixtli</div>
                <div class="subtitle">Kiosco</div>
            </div>

            <div class="download-buttons">
                <a href="${iosLink}" class="download-button">Descarga iOS Kiosco</a>
                <a href="${androidLink}" class="download-button">Descarga Android Kiosco</a>
            </div>

            <div class="footer">
                &copy; ${new Date().getFullYear()} Olin Mixtli
            </div>
        </div>
    </body>
    </html>
  `;

  response.setHeader('Content-Type', 'text/html');
  response.status(200).send(htmlContent);
}
