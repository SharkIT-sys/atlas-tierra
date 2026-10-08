# Verificación de Atlas Tierra

Fecha: 8 de octubre de 2026. Comprobación local en Windows con Edge/Chromium.

## Resultado

- `npm run check`: correcto; ESLint, 32 pruebas unitarias, validación de datos, TypeScript y compilación de producción.
- `npm run test:e2e`: 12 pruebas correctas en escritorio y móvil emulado, incluida recarga de fichas y organigrama sin conexión.
- Catálogo: 187 unidades y órganos, 4 nodos de estructura/organización, 40 instalaciones y 125 fuentes; validación sin errores.
- `npm audit --omit=dev --audit-level=high`: ninguna vulnerabilidad conocida comunicada por npm en las dependencias de producción al ejecutar la comprobación.
- Revisión de publicación: dependencias, compilaciones, capturas, cachés de investigación, archivos `.env` y logs excluidos de Git. Búsqueda de patrones habituales de credenciales sin coincidencias.

## Optimización y limpieza

Las fuentes y las unidades por instalación se indexan una sola vez; los filtros preparan sus entradas fuera del recorrido de unidades. La creación del índice de hijos evita copiar repetidamente las listas de hermanos. Se han eliminado los estilos del glosario que ya no se utiliza.

La compilación separa React y el catálogo para que sus archivos puedan conservarse en caché al cambiar la interfaz. El archivo principal pasa de unos 573,51 kB a 63,80 kB minificados; se añaden archivos separados de React (221,88 kB) y catálogo (287,28 kB). Esta separación no equivale a una reducción del total inicial descargado. Mapa y organigrama continúan cargándose de forma diferida. No se ha medido una mejora de tiempo de carga en dispositivos reales.

## Alcance

La validación comprueba coherencia de referencias, imágenes y atribuciones; no es una nueva investigación de cada afirmación documental. El perfil móvil emula Chromium y no sustituye Safari/iOS real. Los enlaces externos no se han vuelto a comprobar en esta revisión; `links.json` conserva resultados anteriores.

La PWA precachea unos 23,5 MiB, principalmente escudos. La cartografía base y las webs externas necesitan conexión. Esta revisión prepara la publicación del código; no incluye alojamiento web ni aplicaciones nativas.
