# Modelo de datos

El catálogo se almacena en archivos JSON independientes de la interfaz.

| Archivo                       | Contenido                               |
| ----------------------------- | --------------------------------------- |
| `src/data/units.json`         | Unidades, órganos y nodos de agrupación |
| `src/data/garrisons.json`     | Instalaciones y ubicaciones             |
| `src/data/sources.json`       | Referencias documentales                |
| `src/data/relations.json`     | Relaciones adicionales                  |
| `public/shields/credits.json` | Procedencia y licencias de los escudos  |

## Unidades y jerarquía

Cada unidad tiene un identificador estable. `parentId` enlaza con su registro superior y `garrisonId` con una instalación. Los nodos `structure` y `organization` organizan la navegación y quedan fuera del catálogo de búsqueda y de la exportación CSV.

`parentRelation: "grouping"` identifica una agrupación de navegación. La dependencia orgánica se representa de forma separada de estas agrupaciones.

Los registros históricos pueden incluir los estados `historical`, `disbanded` o `transformed`, intervalos de vigencia y referencias a unidades predecesoras o sucesoras.

## Referencias documentales

`fieldSources` vincula los campos con sus referencias. `lastVerified` representa la fecha de consulta. Los estados de verificación y las observaciones recogen información pendiente y discrepancias entre fuentes.

Los contactos y las ubicaciones pertenecen al registro documentado; no se heredan del superior. Los teléfonos ausentes se representan con `null`.

## Imágenes

Los escudos incluyen original o imagen local, miniatura, fuente, autoría, licencia y atribución. El inventario de créditos registra las conversiones y las huellas disponibles de los originales.

## Validación

`npm run validate-data` comprueba identificadores, relaciones, ciclos, referencias, imágenes locales y correspondencia con los créditos. La verificación documental del contenido es independiente de estas comprobaciones estructurales.

## Servicio de consulta

`createRepository(dataset)` construye los índices de unidades, fuentes, instalaciones y dependencias. Proporciona búsqueda, filtros, recorridos jerárquicos y consultas por instalación, provincia, especialidad y tipo de unidad.

El componente `MilitaryOrganization` recibe el catálogo mediante la propiedad `dataset`. La integración de la aplicación se encuentra en `src/app/App.tsx`.
