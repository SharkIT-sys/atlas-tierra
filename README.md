# Atlas Tierra

Aplicación educativa independiente para explorar la organización pública del Ejército de Tierra. React + TypeScript + Vite, sin servidor ni cuentas. Datos planos, fuentes por registro y trazabilidad por campo. No es un producto oficial del Ministerio de Defensa.

## Puesta en marcha

Requiere Node.js 22.12 o posterior, npm y un navegador moderno. En Windows, si PowerShell bloquea `npm.ps1`, utiliza `npm.cmd`.

```powershell
git clone https://github.com/SharkIT-sys/atlas-tierra.git
cd atlas-tierra
npm ci
npm run dev
```

Abre la dirección que imprima Vite (normalmente http://127.0.0.1:5173). Para una instalación reproducible con el archivo de bloqueo usa `npm ci`.

```powershell
npm run build
npm run preview
```

La salida estática está en `dist/`. Se sirve desde la raíz de un dominio; no requiere backend ni reglas de reescritura porque las rutas usan hash. No abras `index.html` con `file://`.

## Funciones

- Inicio con ramas, unidades destacadas, recientes y especialidades.
- Buscador inmediato: tildes, mayúsculas, palabras separadas y errores menores mediante Fuse.js. Filtros combinables de estructura, tipo, especialidad, comunidad, provincia, municipio y estado.
- Fichas con antecesores, padre, subordinadas, misión, historia disponible, contactos institucionales, imágenes, fuentes y fecha documental.
- Árbol de expansión progresiva y organigrama con React Flow: selección, expansión, plegado, zoom, arrastre, pellizco táctil y controles de teclado. «Ver en el organigrama» abre antecesores y centra/resalta la unidad.
- Leaflet y OpenStreetMap; instalaciones independientes, lista alternativa y fichas de las unidades alojadas.
- Consultas recientes y tema local (claro, oscuro, sistema). Compartir con Web Share o copia del enlace.
- Metodología y exportación JSON/CSV.
- PWA con manifiesto, iconos y caché del código y dataset, incluidos módulos del mapa y organigrama.

## Cobertura y precisión

El catálogo contiene **187 unidades y órganos**, 3 puentes estructurales y el nodo de organización, 40 instalaciones y 125 fuentes. La ampliación incluye subordinadas de Aragón I, La Legión II, Almogávares VI, Galicia VII, Guzmán el Bueno X, Extremadura XI, Canarias XVI y la Brigada Logística. Se han revisado las 76 fichas de regimientos, tercios y batallones del catálogo, incluidas las banderas. Las estructuras tienen `nodeKind: "structure"`: se muestran como puentes, quedan fuera de búsqueda y CSV, y se conservan en la jerarquía JSON. Favoritos y glosario se han retirado por petición del usuario.

Consulta documental inicial: **8 de octubre de 2026**. El conjunto es deliberadamente parcial. Incluye la estructura superior, brigadas recogidas en el BOE, unidades de Guadarrama XII, elementos publicados de San Marcial, La Legión, apoyo a la fuerza y academias. No se afirma que cubra todas las unidades ni que cada página oficial esté actualizada a la fecha de consulta.

Las relaciones superiores se contrastan con la Orden DEF/708/2020 consolidada (modificación de 2024). La web general del ET omite aún la Dirección de Ingeniería del MALE; se incorpora según el BOE. Las subinspecciones se muestran bajo DIACU según el artículo 37, aunque la página de IGE las agrupe de forma distinta.

«Fuerza», «Apoyo a la Fuerza» y otras agrupaciones facilitan la navegación: `parentRelation: "grouping"` evita presentarlas como un mando intermedio. La dependencia orgánica y la operativa son distintas. No se almacenan despliegues ni cadenas operativas.

`lastVerified` es la fecha de consulta, no de publicación. `verificationStatus: "official"` acredita los campos documentados, no los campos ausentes. Las observaciones conservan contradicciones. Un teléfono ausente es `null`; nunca se hereda el teléfono o la ubicación del superior. El contacto de prensa de Castillejos está expresamente etiquetado.

Los marcadores iniciales de El Goloso y Sancho Ramírez son los centros de los mapas insertados en sus páginas oficiales: aproximaciones para contexto geográfico, no accesos ni coordenadas de precisión. El resto de instalaciones sin coordenadas verificadas se consulta en lista. Las teselas de OSM requieren conexión y no se descargan masivamente.

## Arquitectura

```text
src/
  app/                         # Integración del módulo y estilos
  data/                        # JSON independientes de la interfaz
  features/military-organization/
    types/                     # Unit, Garrison, Source, Evidence, Relation
    services/repository.ts     # Índices, búsqueda, filtros y jerarquía
    services/storage.ts        # Adaptador de persistencia
    components/                # Árbol y escudos
    screens/                   # Contenedor, navegación y mapas diferidos
    utils/                     # Integridad y exportación
public/
  icons/                       # Iconos originales de aplicación
  shields/                     # Escudos, miniaturas y atribuciones
scripts/                       # Validación y comprobación de enlaces
tests/                         # Lógica e integración en navegador
reports/                       # Informes verificables
```

JSON se elige por portabilidad, revisión sencilla y consulta offline sin backend. No existe un documento jerárquico anidado: `parentId` enlaza registros. `organizationId` y `branch` permiten añadir otros ejércitos. Los índices se construyen una vez por repositorio. Las listas paginan a 24 resultados, el árbol monta filas progresivamente y el grafo limita a 180 nodos y virtualiza los que quedan fuera de pantalla. No se ha realizado una prueba de carga con miles de registros reales.

El repositorio no depende de React, de `window` ni de la aplicación anfitriona:

```ts
import { createRepository } from "./src/features/military-organization/services/repository";
const repository = createRepository(dataset);
repository.getUnitPath("rac61");
repository.searchUnits("alcazar toledo");
```

API: `getUnitById`, `getParent`, `getChildren`, `getAncestors`, `getDescendants`, `getSiblings`, `getUnitPath`, `searchUnits`, `filterUnits`, `getUnitsByGarrison`, `getUnitsByProvince`, `getUnitsBySpecialty`, `getUnitsByType`, `getGarrisonById`. Las pantallas de mapa y árbol reciben repositorio y callbacks.

El punto de entrada `src/features/military-organization/index.ts` exporta también el componente `MilitaryOrganization`, que recibe `dataset`. `src/app/App.tsx` muestra su integración. El contenedor actual usa las rutas hash, el almacenamiento local y el tema del documento: para convivir con otro enrutador o diseño global deben adaptarse esas integraciones y el CSS. El modelo y el repositorio admiten otras organizaciones; los textos y accesos destacados de esta primera interfaz corresponden al Ejército de Tierra.

## Añadir o actualizar información

1. Investiga primero una fuente pública. Prioriza ET, Defensa, EMAD, BOE. No incluyas información privada, filtraciones, contactos personales ni procedimientos internos.
2. Añade la referencia a `src/data/sources.json`: ID estable, editor, título, URL, tipo, fecha de consulta y, si consta, publicación. Explica contradicciones en `notes`.
3. Añade una unidad a `units.json`, siguiendo un registro existente. Son obligatorios ID único, nombre, rama, organización, tipo, `parentId`, estado, verificación, contactos, `phone`, fuentes y `fieldSources`.
4. Cada afirmación nueva debe tener su fuente en `fieldSources`. No rellenes campos vacíos por intuición. Para datos no confirmados usa `pending`, estado `unknown` cuando proceda y una observación. No señales como oficial una relación inferida.
5. Para modificar dependencia, cambia `parentId`, actualiza la evidencia de ese campo y la fecha. Ejecuta el validador: detectará padres ausentes, ciclos o autorreferencias. Si no se conoce el padre, no inventes uno para hacer pasar la validación; documenta el candidato fuera del conjunto publicado.
6. Añade una instalación a `garrisons.json` con fuentes propias; asígnala con `garrisonId`. No dupliques su dirección en unidades. La localización de una jefatura no se extiende a todas las unidades del mando.
7. Añade escudos a `public/shields/` solo con origen y licencia. Incluye `ImageAsset` con autor, URL fuente, licencia, enlace de licencia, atribución, original y miniatura. Documenta la conversión. Actualiza `credits.json`. Si no hay permiso comprobado, mantén el icono genérico.
8. Para una unidad histórica conserva el registro y su ID, cambia `status` a `historical`, `disbanded` o `transformed`, documenta `validFrom`/`validUntil` y, si hay evidencia, `previousUnitId`/`successorUnitId`. El modelo admite relaciones adicionales en `relations.json`; no se generan automáticamente.
9. Ejecuta los controles y revisa la ficha visualmente antes de publicar los datos.

Ejemplo de evidencia:

```json
{
  "parentId": {
    "sourceIds": ["boe"],
    "status": "official",
    "notes": "Artículo pertinente del texto consolidado"
  }
}
```

## Verificaciones

```powershell
npm run lint
npm run typecheck
npm test
npm run validate-data
npm run build
npx playwright test
npm run check-links
```

Playwright utiliza Microsoft Edge en Windows y Chromium en Linux, en modo sin interfaz, con perfiles de escritorio y tamaño/táctil de iPhone. Esto es emulación Chromium: no sustituye una prueba en Safari/iOS real. En Linux instala el navegador con `npx playwright install --with-deps chromium`. Puedes elegir otro canal mediante `PLAYWRIGHT_CHANNEL`. Las pruebas arrancan la vista de producción en el puerto 4173; requiere una compilación previa. Comprueban búsqueda, navegación a subordinadas, exportación, mapa, tamaño móvil y recarga offline.

El validador cubre IDs, nombres, estados, padres, ciclos, huérfanas, instalaciones, fuentes, URL, imágenes y teléfonos sin procedencia. No certifica que un texto sea verdadero: la revisión humana de la fuente sigue siendo necesaria.

`check-links` ejecuta HEAD secuencialmente, consulta robots.txt por dominio, respeta sus reglas y pausas, espera entre solicitudes y no elude bloqueos. Omite un dominio si robots.txt no está disponible, y las pausas superiores a 60 segundos requieren revisión manual. Las redirecciones de enlaces se registran sin seguirlas automáticamente. Un 403/405 puede indicar restricción o HEAD no soportado; requiere revisión y no prueba que el contenido haya desaparecido. Los errores HTTP o de red producen salida no exitosa. Guarda `reports/links.json`. Para una comprobación acotada en PowerShell: `$env:LINK_LIMIT=5; npm run check-links`. No hay automatización programada ni recopilación masiva.

## PWA y móvil

La PWA se activa en producción y necesita HTTPS, salvo localhost. Espera a que termine la primera carga para tener código, datos y escudos cacheados. En Android/Edge/Chrome usa «Instalar aplicación»; en iPhone, Compartir → Añadir a pantalla de inicio. La instalación depende del navegador. Las consultas recientes se conservan en `localStorage`; borrar datos del sitio los elimina.

Para comprobar offline, abre la compilación, espera a que el service worker esté activo, recarga y desconecta internet. Las fichas, búsqueda, organigrama, y árbol deben funcionar. La cartografía base y webs externas necesitan red. Las actualizaciones del service worker regeneran el precache con el build.

La arquitectura permite un futuro contenedor Capacitor con `webDir: "dist"` y el mismo frontend. No se incluyen binarios Android/iOS ni se afirma que estén probados. Antes de empaquetar: adaptar el registro del service worker al entorno nativo, añadir los proyectos de plataforma y probar enlaces externos, compartir, almacenamiento y gestos en dispositivos reales. `docs/capacitor.config.example.json` es una plantilla, no una instalación de Capacitor.

## Contribuciones y mantenimiento

Consulta [CONTRIBUTING.md](CONTRIBUTING.md) y [docs/maintenance.md](docs/maintenance.md). `npm run check` reúne los controles locales; GitHub Actions añade las pruebas de navegador en cada push a `main` y pull request. Las capturas, cachés de investigación, dependencias y compilaciones se excluyen de Git.

## Exportación y licencias

El código y la documentación originales se distribuyen bajo la [licencia MIT](LICENSE), copyright 2026 SharkIT-sys. Los recursos ajenos mantienen sus licencias y atribuciones: consulta [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Información → JSON completo exporta unidades, instalaciones, fuentes y relaciones. CSV exporta columnas esenciales de las unidades y neutraliza prefijos de fórmula. No exporta preferencias personales.

Los escudos proceden de Wikimedia Commons, con licencias CC BY-SA 3.0 o 4.0. Cada archivo conserva su autoría y atribución específica. Ver `public/shields/credits.json`, la atribución en cada ficha y el inventario de cobertura en `reports/regiment-coverage.md`. No se presentan como archivos oficiales distribuidos por Defensa. Los nombres de algunos originales conservan denominaciones anteriores y no se utilizan para establecer la organización actual. Los iconos de la aplicación son originales; los iconos de interfaz son Lucide (ISC). La cartografía conserva la atribución a OpenStreetMap. El código no concede derechos sobre marcas o símbolos institucionales.
