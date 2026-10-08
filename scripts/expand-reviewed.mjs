// Curated additions reviewed against public official sources on 2026-10-08.
// Idempotent: does not infer missing contacts, locations, shields or dependencies.
import fs from "node:fs";
const read = (n) => JSON.parse(fs.readFileSync(`src/data/${n}.json`, "utf8"));
const units = read("units"),
  sources = read("sources");
const base = "https://ejercito.defensa.gob.es/";
function source(id, title, path, notes) {
  if (!sources.some((s) => s.id === id))
    sources.push({
      id,
      title,
      url: base + path,
      publisher: "Ejército de Tierra",
      retrievedAt: "2026-10-08",
      sourceType: "official",
      ...(notes ? { notes } : {}),
    });
}
source(
  "aragon-org",
  "Aragón I: presentación y composición actual",
  "unidades/Zaragoza/bri_aragon/",
);
source(
  "galicia-org",
  "Galicia VII: organización y organigrama 2026",
  "unidades/Pontevedra/brilat/Organizacion/index.html",
);
source(
  "guzman-org",
  "Guzmán el Bueno X: unidades y cometidos",
  "unidades/Cordoba/brimzx_guzmanelbueno/Organizacion/index.html",
);
source(
  "extremadura-org",
  "Extremadura XI: unidades y cometidos",
  "unidades/Badajoz/bri_extremadura_xi/Organizacion/index.html",
);
source(
  "canarias-org",
  "Canarias XVI: organigrama publicado",
  "unidades/Las_Palmas/brilcanxvi/Organizacion/index.html",
  "Composición transcrita del organigrama insertado, archivo de 2023. No se usa la ausencia de una unidad como prueba de disolución.",
);
source(
  "brilog-org",
  "Brigada Logística: organización y misión",
  "unidades/Zaragoza/cgbl/Organizacion/index.html",
);
source(
  "pavia-org",
  "Pavía 4: organización y misión",
  "unidades/Zaragoza/rac4/Organizacion/index.html",
);
source(
  "cordoba-org",
  "Córdoba 10: organización e historia",
  "unidades/Cordoba/brimzx_guzmanelbueno/Organizacion/RAC_N.10/index.html",
);
source(
  "barcelona-org",
  "Barcelona 63: organización y misión",
  "unidades/Barcelona/ri63/Organizacion/index.html",
);
source(
  "arapiles-org",
  "Arapiles 62: organización y misión",
  "unidades/Gerona/rczm_arapiles62/Organizacion/index.html",
);
source(
  "principe-org",
  "Príncipe 3: historia y batallones",
  "unidades/Pontevedra/brilat/Organizacion/Ril_3.html",
);
source(
  "isabel-org",
  "Isabel la Católica 29: organización e historia",
  "unidades/Pontevedra/brilat/Organizacion/Ril_29.html",
);
source(
  "farnesio-org",
  "Farnesio 12: organización e historia",
  "unidades/Pontevedra/brilat/Organizacion/Farnesio.html",
);
source(
  "castillejos-actual",
  "Castillejos: incorporación del España 11 desde 2023",
  "unidades/Huesca/div_castillejos/index.html",
);
source(
  "soria-org",
  "Soria 9: organización y misión",
  "unidades/Las_Palmas/ril9/Organizacion/index.html",
);
source(
  "tenerife-org",
  "Tenerife 49: estructura del regimiento",
  "personal/Escudos/estructura_regimiento_infanteria_tenerife_49.html",
);
source(
  "cerinola-org",
  "Canarias 50: denominación del Ceriñola I/50",
  "unidades/Las_Palmas/ril50/Noticias/2023/EX-BETA-02-23-Batallon-de-Infanteria-Motorizada-BIMT-Cerinola-I-50.html",
);
const evidence = (sid) => ({ sourceIds: [sid], status: "official" });
function enrich(id, fields, sid) {
  const u = units.find((u) => u.id === id);
  if (!u) throw Error(id);
  Object.assign(u, fields);
  u.sources = [...new Set([...u.sources, sid])];
  for (const key of Object.keys(fields)) u.fieldSources[key] = evidence(sid);
  u.lastVerified = "2026-10-08";
}
function add(id, name, parentId, type, sid, specialty, mission) {
  if (units.some((u) => u.id === id)) return;
  const parent = units.find((u) => u.id === parentId);
  if (!parent) throw Error(parentId);
  const fields = {
    name,
    parentId,
    type,
    ...(specialty ? { specialty } : {}),
    ...(mission ? { mission } : {}),
  };
  units.push({
    id,
    nodeKind: "unit",
    ...fields,
    organizationId: "et",
    branch: parent.branch,
    parentRelation: "organic",
    garrisonId: null,
    phone: null,
    contacts: [],
    status: "active",
    verificationStatus: "official",
    sources: [sid],
    fieldSources: Object.fromEntries(
      [...Object.keys(fields), "status"].map((k) => [k, evidence(sid)]),
    ),
    lastVerified: "2026-10-08",
    website: sources.find((s) => s.id === sid).url,
  });
}
// Aragón I: current presentation, plus individual regiment pages.
for (const [id, name, type, specialty] of [
  ["cg-bri1", "Cuartel General de la Brigada «Aragón» I", "Cuartel General"],
  ["bcg1", "Batallón de Cuartel General de la Brigada «Aragón» I", "Batallón"],
  ["pavia4", "Regimiento Acorazado «Pavía» nº 4", "Regimiento", "Acorazado"],
  [
    "raca20",
    "Regimiento de Artillería de Campaña nº 20",
    "Regimiento",
    "Artillería",
  ],
  [
    "arapiles62",
    "Regimiento de Infantería «Arapiles» nº 62",
    "Regimiento",
    "Infantería",
  ],
  [
    "barcelona63",
    "Regimiento de Infantería «Barcelona» nº 63",
    "Regimiento",
    "Infantería",
  ],
  ["bz1", "Batallón de Zapadores I", "Batallón", "Ingenieros"],
  ["gl1", "Grupo Logístico I", "Grupo", "Logística"],
])
  add(id, name, "bri1", type, "aragon-org", specialty);
add(
  "flandes",
  "Batallón de Infantería de Carros de Combate «Flandes» I/4",
  "pavia4",
  "Batallón",
  "pavia-org",
  "Acorazado",
);
add(
  "husares",
  "Grupo de Caballería Acorazado «Húsares de la Princesa» II/4",
  "pavia4",
  "Grupo",
  "pavia-org",
  "Caballería",
);
add(
  "cataluna",
  "Batallón de Infantería Motorizada «Cataluña» I/63",
  "barcelona63",
  "Batallón",
  "barcelona-org",
  "Infantería",
);
enrich(
  "pavia4",
  {
    mission:
      "Aporta reconocimiento, seguridad y capacidad de combate a la Brigada Aragón I.",
    equipment: ["Leopardo 2E", "Vehículo de Exploración de Caballería (VEC)"],
  },
  "pavia-org",
);
enrich(
  "arapiles62",
  {
    mission:
      "Preparación como unidad de infantería para misiones de seguridad y combate en diversos escenarios.",
    notes:
      "La página oficial sitúa el regimiento en Sant Climent Sescebes (Girona).",
  },
  "arapiles-org",
);
enrich(
  "barcelona63",
  {
    mission:
      "Unidad de infantería motorizada con capacidad para actuar en distintos escenarios.",
    equipment: ["VAMTAC"],
  },
  "barcelona-org",
);
enrich(
  "bri1",
  {
    history: "Adoptó la denominación Brigada Aragón I el 1 de enero de 2017.",
    website: base + "unidades/Zaragoza/bri_aragon/",
    contacts: [
      {
        type: "email",
        value: "brigadaaragon@mde.es",
        sourceId: "aragon-org",
        label: "Correo institucional",
      },
    ],
  },
  "aragon-org",
);
// Galicia VII: current clickable chart; children confirmed by individual pages.
for (const [id, name, type, specialty] of [
  ["cg-bri7", "Cuartel General de la Brigada «Galicia» VII", "Cuartel General"],
  [
    "bcg7",
    "Batallón de Cuartel General de la Brigada «Galicia» VII",
    "Batallón",
  ],
  [
    "principe3",
    "Regimiento de Infantería «Príncipe» nº 3",
    "Regimiento",
    "Infantería",
  ],
  [
    "isabel29",
    "Regimiento de Infantería «Isabel la Católica» nº 29",
    "Regimiento",
    "Infantería",
  ],
  [
    "farnesio12",
    "Regimiento de Caballería «Farnesio» nº 12",
    "Regimiento",
    "Caballería",
  ],
  ["gaca7", "Grupo de Artillería de Campaña VII", "Grupo", "Artillería"],
  ["bz7", "Batallón de Zapadores VII", "Batallón", "Ingenieros"],
  ["gl7", "Grupo Logístico VII", "Grupo", "Logística"],
])
  add(id, name, "bri7", type, "galicia-org", specialty);
add(
  "san-quintin",
  "Batallón «San Quintín» I/3",
  "principe3",
  "Batallón",
  "principe-org",
  "Infantería",
);
add(
  "toledo",
  "Batallón «Toledo» II/3",
  "principe3",
  "Batallón",
  "principe-org",
  "Infantería",
);
add(
  "zamora",
  "Batallón de Infantería Motorizada «Zamora» I/29",
  "isabel29",
  "Batallón",
  "isabel-org",
  "Infantería",
);
add(
  "santiago",
  "Grupo de Caballería Ligero Acorazado «Santiago» I/12",
  "farnesio12",
  "Grupo",
  "farnesio-org",
  "Caballería",
);
enrich(
  "bri7",
  {
    mission:
      "Brigada preparada para su proyección, con apoyos de fuego, defensa aérea y sostenimiento logístico.",
    website: base + "unidades/Pontevedra/brilat/",
    contacts: [
      {
        type: "email",
        value: "brilat_oc@et.mde.es",
        sourceId: "galicia-org",
        label: "Oficina de comunicación",
      },
    ],
  },
  "galicia-org",
);
enrich(
  "principe3",
  {
    history:
      "Heredero del Tercio de Lombardía, fundado en Milán el 5 de diciembre de 1534. Se integró en la BRILAT en 1988.",
  },
  "principe-org",
);
enrich(
  "isabel29",
  {
    history:
      "Sus orígenes se vinculan al Batallón Reserva de Cáceres de 1872. Lleva su denominación actual desde 1944 y está en Pontevedra desde 1988.",
    notes:
      "La fuente oficial sitúa su sede en la Base General Morillo y encuadra el Batallón Zamora I/29.",
  },
  "isabel-org",
);
enrich(
  "farnesio12",
  {
    history:
      "Su antecedente se creó en 1649. Recibe el nombre de Farnesio en 1718 y se integra en Galicia VII en 2016.",
    equipment: ["VRCC Centauro", "VEC", "VERT"],
  },
  "farnesio-org",
);
// Guzmán el Bueno X.
for (const [id, name, type, specialty, mission] of [
  [
    "cg-bri10",
    "Cuartel General de la Brigada «Guzmán el Bueno» X",
    "Cuartel General",
    null,
    "Asiste al mando en la dirección de la brigada.",
  ],
  [
    "bcg10",
    "Batallón de Cuartel General X",
    "Batallón",
    null,
    "Apoya el funcionamiento del puesto de mando y sus comunicaciones.",
  ],
  [
    "reina2",
    "Regimiento de Infantería «La Reina» nº 2",
    "Regimiento",
    "Infantería",
  ],
  [
    "garellano45",
    "Regimiento de Infantería «Garellano» nº 45",
    "Regimiento",
    "Infantería",
  ],
  [
    "cordoba10",
    "Regimiento Acorazado «Córdoba» nº 10",
    "Regimiento",
    "Acorazado",
  ],
  [
    "gaca10",
    "Grupo de Artillería de Campaña X",
    "Grupo",
    "Artillería",
    "Proporciona apoyo de fuegos y protección antiaérea.",
  ],
  [
    "bz10",
    "Batallón de Zapadores X",
    "Batallón",
    "Ingenieros",
    "Apoya la movilidad, contramovilidad y protección.",
  ],
  [
    "gl10",
    "Grupo Logístico X",
    "Grupo",
    "Logística",
    "Proporciona apoyo logístico directo a las unidades de la brigada.",
  ],
])
  add(id, name, "bri10", type, "guzman-org", specialty, mission);
add(
  "princesa",
  "Batallón de Infantería Protegida «Princesa» I/2",
  "reina2",
  "Batallón",
  "guzman-org",
  "Infantería",
);
add(
  "lepanto",
  "Batallón de Infantería Mecanizada «Lepanto» II/2",
  "reina2",
  "Batallón",
  "guzman-org",
  "Infantería",
);
add(
  "malaga",
  "Batallón de Infantería de Carros de Combate «Málaga» I/10",
  "cordoba10",
  "Batallón",
  "cordoba-org",
  "Acorazado",
);
add(
  "almansa",
  "Grupo de Caballería Acorazado «Almansa» II/10",
  "cordoba10",
  "Grupo",
  "cordoba-org",
  "Caballería",
);
enrich(
  "cordoba10",
  {
    mission:
      "Preparación de sus elementos acorazados y de caballería para los cometidos de la brigada.",
    history:
      "Su historial se remonta al Tercio de Figueroa de 1566. Adopta la denominación de regimiento acorazado en 2016.",
    patron: "Nuestra Señora de la Asunción",
  },
  "cordoba-org",
);
enrich(
  "bri10",
  {
    motto: "Sed fuertes en la guerra",
    website: base + "unidades/Cordoba/brimzx_guzmanelbueno/",
    contacts: [
      {
        type: "email",
        value: "brimzx@et.mde.es",
        sourceId: "guzman-org",
        label: "Correo institucional",
      },
    ],
  },
  "guzman-org",
);
// Extremadura XI.
for (const [id, name, type, specialty, mission] of [
  [
    "sicilia67",
    "Regimiento de Infantería «Tercio Viejo de Sicilia» nº 67",
    "Regimiento",
    "Infantería",
  ],
  [
    "saboya6",
    "Regimiento de Infantería «Saboya» nº 6",
    "Regimiento",
    "Infantería",
  ],
  [
    "castilla16",
    "Regimiento Acorazado «Castilla» nº 16",
    "Regimiento",
    "Acorazado",
  ],
  [
    "gaca11",
    "Grupo de Artillería de Campaña XI",
    "Grupo",
    "Artillería",
    "Proporciona apoyos de fuego a la brigada.",
  ],
  [
    "bz11",
    "Batallón de Zapadores XI",
    "Batallón",
    "Ingenieros",
    "Apoya la movilidad y protección de las unidades.",
  ],
  [
    "gl11",
    "Grupo Logístico XI",
    "Grupo",
    "Logística",
    "Sostiene la capacidad de las unidades con apoyo logístico.",
  ],
  [
    "bcg11",
    "Batallón de Cuartel General XI",
    "Batallón",
    null,
    "Proporciona medios de mando, control y apoyo especializado.",
  ],
])
  add(id, name, "bri11", type, "extremadura-org", specialty, mission);
add(
  "legazpi",
  "Batallón de Infantería «Legazpi» I/67",
  "sicilia67",
  "Batallón",
  "extremadura-org",
  "Infantería",
);
add(
  "cantabria",
  "Batallón «Cantabria» I/6",
  "saboya6",
  "Batallón",
  "extremadura-org",
  "Infantería",
);
add(
  "las-navas",
  "Batallón «Las Navas» II/6",
  "saboya6",
  "Batallón",
  "extremadura-org",
  "Infantería",
);
enrich(
  "bri11",
  {
    mission:
      "Integra unidades de maniobra y apoyos de combate, mando y sostenimiento.",
    website: base + "unidades/Badajoz/bri_extremadura_xi/",
  },
  "extremadura-org",
);
enrich("cantabria", { equipment: ["VCI Pizarro"] }, "extremadura-org");
// Legion and paratroopers: composition explicitly listed by their brigades.
for (const [id, name, type, specialty, mission] of [
  [
    "cg-bri2",
    "Cuartel General de la Brigada de La Legión",
    "Cuartel General",
    null,
    "Asesora al mando de la brigada.",
  ],
  [
    "bcg2",
    "Bandera de Cuartel General de La Legión",
    "Batallón",
    null,
    "Apoya el mando, control y comunicaciones.",
  ],
  [
    "reyes-catolicos",
    "Grupo de Caballería Ligero Acorazado «Reyes Católicos»",
    "Grupo",
    "Caballería",
    "Aporta reconocimiento y seguridad a la brigada.",
  ],
  [
    "gaca2",
    "Grupo de Artillería de Campaña II de La Legión",
    "Grupo",
    "Artillería",
    "Proporciona apoyo de fuegos y defensa antiaérea.",
  ],
  [
    "bz2",
    "Bandera de Zapadores II de La Legión",
    "Batallón",
    "Ingenieros",
    "Apoya la movilidad y la protección de la brigada.",
  ],
  [
    "gl2",
    "Grupo Logístico II de La Legión",
    "Grupo",
    "Logística",
    "Proporciona transporte, abastecimiento, mantenimiento y apoyo sanitario.",
  ],
])
  add(id, name, "bri2", type, "brileg", specialty, mission);
enrich(
  "bz2",
  {
    notes:
      "La web de la brigada emplea también la denominación tradicional Bandera de Zapadores.",
  },
  "brileg",
);
for (const [id, name, type, specialty] of [
  [
    "cg-bri6",
    "Cuartel General de la Brigada «Almogávares» VI de Paracaidistas",
    "Cuartel General",
  ],
  [
    "bcg6",
    "Batallón de Cuartel General de la Brigada «Almogávares» VI",
    "Batallón",
  ],
  [
    "gaca6",
    "Grupo de Artillería de Campaña VI de Paracaidistas",
    "Grupo",
    "Artillería",
  ],
  [
    "bz6",
    "Batallón de Zapadores VI de Paracaidistas",
    "Batallón",
    "Ingenieros",
  ],
  ["gl6", "Grupo Logístico VI de Paracaidistas", "Grupo", "Logística"],
])
  add(id, name, "bri6", type, "glosario-bripac", specialty);
add(
  "roger-flor",
  "Bandera de Infantería Paracaidista «Roger de Flor» I/4",
  "napoles",
  "Batallón",
  "glosario-bripac",
  "Infantería",
);
add(
  "roger-lauria",
  "Bandera de Infantería Paracaidista «Roger de Lauria» II/4",
  "napoles",
  "Batallón",
  "glosario-bripac",
  "Infantería",
);
add(
  "ortiz-zarate",
  "Bandera de Infantería Paracaidista «Ortiz de Zárate» III/5",
  "zaragoza",
  "Batallón",
  "glosario-bripac",
  "Infantería",
);
add(
  "sagunto",
  "Grupo de Caballería Ligero «Sagunto» I/8 de Paracaidistas",
  "lusitania",
  "Grupo",
  "glosario-bripac",
  "Caballería",
);
enrich(
  "bri6",
  {
    mission:
      "Brigada de especialidad paracaidista preparada para su proyección y para generar agrupamientos tácticos.",
    website: base + "unidades/Madrid/bripacii/",
  },
  "glosario-bripac",
);
// Canarias XVI: use the published chart, including GL XVI absent in the 2021 annex.
for (const [id, name, type, specialty] of [
  [
    "cg-bri16",
    "Cuartel General de la Brigada «Canarias» XVI",
    "Cuartel General",
  ],
  ["bcg16", "Batallón de Cuartel General XVI", "Batallón"],
  [
    "soria9",
    "Regimiento de Infantería «Soria» nº 9",
    "Regimiento",
    "Infantería",
  ],
  [
    "tenerife49",
    "Regimiento de Infantería «Tenerife» nº 49",
    "Regimiento",
    "Infantería",
  ],
  [
    "canarias50",
    "Regimiento de Infantería «Canarias» nº 50",
    "Regimiento",
    "Infantería",
  ],
  [
    "raca93",
    "Regimiento de Artillería de Campaña nº 93",
    "Regimiento",
    "Artillería",
  ],
  ["bz16", "Batallón de Zapadores XVI", "Batallón", "Ingenieros"],
  ["gl16", "Grupo Logístico XVI", "Grupo", "Logística"],
])
  add(id, name, "bri16", type, "canarias-org", specialty);
add(
  "fuerteventura",
  "Batallón de Infantería Protegida «Fuerteventura» I/9",
  "soria9",
  "Batallón",
  "soria-org",
  "Infantería",
);
add(
  "albuera",
  "Batallón de Infantería Motorizada «Albuera» I/49",
  "tenerife49",
  "Batallón",
  "tenerife-org",
  "Infantería",
);
add(
  "cerinola",
  "Batallón de Infantería Motorizada «Ceriñola» I/50",
  "canarias50",
  "Batallón",
  "cerinola-org",
  "Infantería",
);
enrich(
  "bri16",
  {
    website: base + "unidades/Las_Palmas/brilcanxvi/",
    contacts: [
      {
        type: "email",
        value: "ofcombrilcan@et.mde.es",
        sourceId: "canarias-org",
        label: "Oficina de comunicación",
      },
    ],
  },
  "canarias-org",
);
// Logistics, no guessed lower-level groups.
add(
  "cg-brilog",
  "Cuartel General de la Brigada Logística",
  "brilog",
  "Cuartel General",
  "brilog-org",
  null,
  "Asesora al mando y dirige la preparación de sus unidades.",
);
for (const n of [11, 21, 41, 61, 81])
  add(
    "aalog" + n,
    "Agrupación de Apoyo Logístico nº " + n,
    "brilog",
    "Agrupación",
    "brilog-org",
    "Logística",
    "Genera organizaciones de apoyo logístico para las unidades y operaciones.",
  );
add(
  "agtp1",
  "Agrupación de Transporte nº 1",
  "brilog",
  "Agrupación",
  "brilog-org",
  "Logística",
  "Proporciona transporte de personal y material y apoyo al movimiento.",
);
add(
  "agrusan1",
  "Agrupación de Sanidad nº 1",
  "brilog",
  "Agrupación",
  "brilog-org",
  "Sanidad",
  "Genera capacidades de apoyo sanitario para las fuerzas.",
);
enrich(
  "brilog",
  {
    mission:
      "Genera y prepara estructuras logísticas y sanitarias, y complementa el apoyo permanente del Ejército.",
    website: base + "unidades/Zaragoza/cgbl/",
  },
  "brilog-org",
);
add(
  "espana11",
  "Regimiento de Caballería «España» nº 11",
  "castillejos",
  "Regimiento",
  "castillejos-actual",
  "Caballería",
);
enrich(
  "espana11",
  {
    history:
      "Depende orgánicamente de la División Castillejos desde el 1 de enero de 2023.",
    notes:
      "No se reproduce la dependencia de La Legión que figura en el anexo original de 2021.",
  },
  "castillejos-actual",
);
for (const [n, v] of [
  ["units", units],
  ["sources", sources],
])
  fs.writeFileSync(`src/data/${n}.json`, JSON.stringify(v, null, 2) + "\n");
console.log(`${units.length} nodos; ${sources.length} fuentes`);
