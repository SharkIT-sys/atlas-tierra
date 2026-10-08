# Atlas Tierra

Atlas Tierra permite explorar la organización pública del Ejército de Tierra mediante fichas de unidades, un organigrama interactivo y un mapa de instalaciones. Es una aplicación educativa independiente, sin cuentas de usuario y con soporte de consulta sin conexión.

## Funcionalidades

- Búsqueda por nombre, abreviatura, especialidad o localidad, con filtros combinables.
- Fichas con dependencia orgánica, unidades subordinadas, historia, misión, contactos institucionales y fuentes.
- Organigrama interactivo y árbol de navegación jerárquica.
- Mapa y directorio de instalaciones vinculadas a sus unidades.
- Exportación del catálogo en JSON y CSV.
- Temas claro, oscuro y automático, consultas recientes e interfaz adaptable a móviles.
- Instalación como PWA y acceso sin conexión al contenido almacenado tras la primera carga.

## Catálogo

La versión actual contiene **187 unidades y órganos**, **40 instalaciones** y **125 fuentes**, además de cuatro nodos de organización y agrupación.

La cobertura es parcial. Cada ficha incluye sus referencias y fechas de consulta; los campos pendientes se identifican en la aplicación. Las agrupaciones de navegación se distinguen de las dependencias orgánicas. Las ubicaciones del mapa son orientativas.

Atlas Tierra no es un producto oficial del Ministerio de Defensa. La información puede cambiar respecto a las fuentes consultadas.

## Instalación

Requisitos: Node.js 22.12 o posterior, npm y un navegador moderno.

```sh
git clone https://github.com/SharkIT-sys/atlas-tierra.git
cd atlas-tierra
npm ci
npm run dev
```

La aplicación estará disponible en la dirección indicada por Vite, normalmente `http://127.0.0.1:5173`. En Windows puede utilizarse `npm.cmd` si PowerShell bloquea `npm.ps1`.

### Compilación de producción

```sh
npm run build
npm run preview
```

La compilación se genera en `dist/` y se sirve desde la raíz de un sitio HTTPS. La navegación utiliza rutas hash y no requiere backend. Los detalles de despliegue están en la [guía de mantenimiento](docs/maintenance.md).

## Uso sin conexión

La versión de producción puede instalarse desde los navegadores compatibles con PWA. Tras completar la primera carga, las fichas, la búsqueda, el árbol y el organigrama quedan disponibles sin conexión. El mapa base y los enlaces externos requieren acceso a Internet.

El tema y las consultas recientes se guardan en el navegador. Al borrar los datos del sitio se eliminan estas preferencias.

## Desarrollo

La aplicación utiliza React, TypeScript y Vite. El organigrama está construido con React Flow, el mapa con Leaflet y la búsqueda con Fuse.js.

```text
src/app/                          Interfaz y estilos
src/data/                         Catálogo y referencias documentales
src/features/military-organization/ Componentes, navegación y lógica de consulta
public/                           Iconos, escudos y atribuciones
scripts/                          Herramientas de mantenimiento y validación
tests/                            Pruebas unitarias y de navegador
```

```sh
npm run check
npm run test:e2e
```

`check` reúne ESLint, pruebas unitarias, validación de datos, TypeScript y compilación. Las pruebas de navegador utilizan Edge en Windows y Chromium en Linux. En Linux, el navegador se instala con `npx playwright install --with-deps chromium`.

- [Guía de contribución](CONTRIBUTING.md)
- [Modelo de datos](docs/data-model.md)
- [Mantenimiento y despliegue](docs/maintenance.md)
- [Notas documentales](docs/research-notes.md)

## Licencia

El código y la documentación originales se distribuyen bajo la [licencia MIT](LICENSE).

Los escudos y otros recursos de terceros conservan sus licencias y atribuciones, detalladas en [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) y en el [inventario de créditos](public/shields/credits.json). La cartografía procede de OpenStreetMap.
