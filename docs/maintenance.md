# Mantenimiento y publicación

## Comprobaciones

`npm run check` ejecuta lint, pruebas unitarias, validación de datos y compilación con TypeScript. `npm run test:e2e` comprueba el resultado de producción en escritorio y móvil emulado. GitHub Actions ejecuta ambas tareas en Linux.

`npm run check-links` es una comprobación de red opcional: sus resultados dependen de robots.txt, disponibilidad y restricciones de las webs de origen. No se ejecuta automáticamente en CI.

## Scripts documentales

Los scripts `discover-*`, `download-*`, `prepare-*`, `import-*`, `complete-*`, `expand-reviewed.mjs` y `enrich-regiments.mjs` se conservan como herramientas de investigación e importación. Algunos necesitan ficheros de trabajo de `reports/research/`, excluidos de Git. No son pasos de instalación ni de compilación y no deben ejecutarse en bloque.

`shield-coverage.mjs` genera el inventario de cobertura; `preview-shields.mjs` requiere imágenes locales, Edge y un servidor de vista previa en el puerto 4173.

Los informes conservados en `reports/` son instantáneas con alcance y fecha propios, no certificaciones permanentes de los datos.

## Despliegue estático

Ejecuta `npm ci` y `npm run build`. Publica `dist/` en la raíz de un sitio HTTPS. Las rutas de navegación usan hash. La configuración actual usa rutas de recursos absolutas: alojar bajo `/atlas-tierra/` requiere adaptar y probar esas rutas y la PWA antes del despliegue.

Subir el repositorio a GitHub no despliega por sí mismo una web. `npm run preview` sirve para comprobar localmente la compilación.

## Servidor local

Si el puerto está ocupado, usa `npm run dev -- --port 5174 --strictPort` y abre la URL impresa por Vite. El proceso debe seguir activo mientras se utiliza la app.
