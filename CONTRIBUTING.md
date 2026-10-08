# Contribuir a Atlas Tierra

## Entorno de desarrollo

El proyecto requiere Node.js 22.12 o posterior. `npm ci` instala las dependencias y `npm run dev` inicia el servidor local.

## Comprobaciones

```sh
npm run check
npm run test:e2e
```

Las pruebas de navegador utilizan Edge en Windows y Chromium en Linux. En Linux, la instalación se realiza con `npx playwright install --with-deps chromium`. La variable `PLAYWRIGHT_CHANNEL` permite seleccionar otro canal.

## Pull requests

Las contribuciones incluyen una descripción del cambio y las comprobaciones realizadas. Los cambios visuales se acompañan de capturas de escritorio y móvil. Las compilaciones, credenciales y resultados temporales quedan fuera del repositorio.

## Catálogo y recursos gráficos

El [modelo de datos](docs/data-model.md) describe las unidades, instalaciones, relaciones y referencias. Las actualizaciones del catálogo incluyen la procedencia de los campos modificados y su fecha de consulta.

Los escudos incluyen autoría, fuente, licencia y modificaciones en `public/shields/credits.json`. Sus licencias se conservan de forma independiente a la licencia MIT del código.

Las herramientas de importación y sus requisitos se describen en la [guía de mantenimiento](docs/maintenance.md).
