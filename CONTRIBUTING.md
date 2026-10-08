# Contribuir a Atlas Tierra

Usa Node.js 22.12 o posterior y `npm ci`. Inicia el entorno con `npm run dev`.

Antes de proponer cambios, ejecuta:

```sh
npm run check
npm run test:e2e
```

En Linux instala antes Chromium con `npx playwright install --with-deps chromium`. En Windows se utiliza Edge por defecto. Puedes seleccionar otro canal con `PLAYWRIGHT_CHANNEL`.

Describe el problema, el cambio y las comprobaciones realizadas en la pull request. Para cambios de interfaz, incluye capturas de escritorio y móvil. Evita subir compilaciones, credenciales, perfiles del navegador o resultados temporales.

## Cambios en datos e imágenes

Sigue el procedimiento de [README.md](README.md#añadir-o-actualizar-información): añade fuentes verificables por campo, distingue relaciones orgánicas y agrupaciones, y conserva contradicciones y datos pendientes. No deduzcas contactos o ubicaciones a partir de la unidad superior.

Para imágenes, registra la fuente, autoría, licencia y modificaciones tanto en los datos como en `public/shields/credits.json`. Ejecuta `npm run validate-data`. La licencia MIT no sustituye las licencias de los recursos de terceros.

Los scripts de importación documental son herramientas de mantenimiento que pueden modificar el catálogo. Consulta [docs/maintenance.md](docs/maintenance.md) antes de ejecutarlos.
