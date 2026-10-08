// Curated facts from individually reviewed public Army pages; no inferred contacts.
import fs from "node:fs";
const units = JSON.parse(fs.readFileSync("src/data/units.json"));
const sources = JSON.parse(fs.readFileSync("src/data/sources.json"));
const garrisons = JSON.parse(fs.readFileSync("src/data/garrisons.json"));
const changed = new Set();
const base = "https://ejercito.defensa.gob.es/";
function source(id, path, title, notes) {
  if (!sources.some((s) => s.id === id))
    sources.push({
      id,
      title,
      url: path.startsWith("http") ? path : base + path,
      publisher: "Ejército de Tierra",
      sourceType: "official",
      retrievedAt: "2026-10-08",
      ...(notes ? { notes } : {}),
    });
  return id;
}
function update(id, sid, fields) {
  const u = units.find((u) => u.id === id);
  if (!u) throw Error(id);
  Object.assign(u, fields);
  u.sources = [...new Set([...u.sources, sid])];
  for (const k of Object.keys(fields))
    u.fieldSources[k] = { sourceIds: [sid], status: "official" };
  u.lastVerified = "2026-10-08";
  changed.add(id);
}
function add(id, parentId, name, sid) {
  if (units.some((u) => u.id === id)) return;
  units.push({
    id,
    nodeKind: "unit",
    name,
    type: "Batallón",
    specialty: "Infantería",
    parentId,
    parentRelation: "organic",
    organizationId: "et",
    branch: "fuerza",
    phone: null,
    contacts: [],
    status: "active",
    verificationStatus: "official",
    sources: [sid],
    fieldSources: Object.fromEntries(
      ["name", "type", "specialty", "parentId", "status"].map((k) => [
        k,
        { sourceIds: [sid], status: "official" },
      ]),
    ),
    lastVerified: "2026-10-08",
  });
  changed.add(id);
}
function contact(
  id,
  sid,
  phone,
  email,
  label = "Contacto institucional publicado",
) {
  const fields = {};
  if (phone) {
    fields.phone = phone;
    fields.contacts = [{ type: "phone", value: phone, label, sourceId: sid }];
  }
  if (email)
    fields.contacts = [
      ...(fields.contacts || units.find((u) => u.id === id).contacts),
      {
        type: "email",
        value: email,
        label: "Correo institucional",
        sourceId: sid,
      },
    ];
  update(id, sid, fields);
}
function place(id, sid, fields) {
  let g = garrisons.find((g) => g.id === id);
  if (!g) {
    g = { id, phone: null, sources: [], fieldSources: {} };
    garrisons.push(g);
  }
  Object.assign(g, fields);
  g.sources = [...new Set([...g.sources, sid])];
  for (const k of Object.keys(fields))
    g.fieldSources[k] = { sourceIds: [sid], status: "official" };
  g.lastVerified = "2026-10-08";
}

source(
  "asturias-org",
  "unidades/Madrid/asturias31/Organizacion/index.html",
  "Asturias 31: organización y misión",
);
update("asturias", "asturias-org", {
  website: base + "unidades/Madrid/asturias31/Organizacion/index.html",
  mission:
    "Genera agrupaciones tácticas y prepara sus batallones para operaciones dentro y fuera del territorio nacional.",
  fullDescription:
    "Reúne una plana mayor regimental y los batallones Covadonga I/31, mecanizado, y Uad-Ras II/31, protegido. La página oficial describe medios Pizarro y TOA, y contempla la sustitución de estos últimos por el VCR Dragón; esa previsión no acredita una entrega ya completada.",
});
contact("asturias", "asturias-org", null, "ri_asturias31@et.mde.es");
update("covadonga", "asturias-org", {
  mission:
    "Aporta la capacidad de infantería mecanizada del Asturias 31, basada en movilidad, protección y potencia de fuego.",
  equipment: [
    "VCI Pizarro, documentado en la página de organización del regimiento.",
  ],
  website: base + "unidades/Madrid/asturias31/Organizacion/index.html",
});
update("uadras", "asturias-org", {
  mission:
    "Aporta el batallón de infantería protegida del Asturias 31 para la generación de agrupamientos tácticos.",
  website: base + "unidades/Madrid/asturias31/Organizacion/index.html",
});
source(
  "asturias-hist",
  "en/unidades/Madrid/asturias31/Historial/index.html",
  "Asturias 31: historial",
);
update("asturias", "asturias-hist", {
  history:
    "Su historial sitúa el primer Tercio de Asturias en 1663. Fue reconstituido en 1691 y 1703, y pasó a denominarse regimiento con la reorganización borbónica. Tras su disolución en 1823, se recuperó en 1841 con el número 31. Su escudo remite a las armas del Principado de Asturias.",
});
source(
  "asturias-local",
  "unidades/Madrid/asturias31/Localizacion/index.html",
  "Asturias 31: localización",
);
update("asturias", "asturias-local", { garrisonId: "el-goloso" });
source(
  "pavia-hist",
  "unidades/Zaragoza/rac4/Historial/index.html",
  "Pavía 4: historial",
);
update("pavia4", "pavia-hist", {
  creationDate: "1684-05-01",
  history:
    "La unidad data del 1 de mayo de 1684 y adoptó el nombre de Dragones de Pavía en 1718. Se trasladó de Aranjuez a Zaragoza en 1994. En 2016 se transformó en regimiento acorazado y en 2017 pasó a Aragón I.",
  fullDescription:
    "Integra plana mayor, el batallón de carros Flandes I/4 y el grupo de caballería Húsares de la Princesa II/4.",
  website: base + "unidades/Zaragoza/rac4/Organizacion/index.html",
});
update("flandes", "pavia-hist", {
  fullDescription:
    "Es el componente de infantería de carros del Pavía 4, junto al grupo de caballería Húsares de la Princesa II/4.",
});
source(
  "pavia-local",
  "unidades/Zaragoza/rac4/Localizacion/index.html",
  "Pavía 4: localización y contacto",
);
update("pavia4", "pavia-local", { garrisonId: "san-jorge" });
contact("pavia4", "pavia-local", "+34976739012");
source(
  "arapiles-hist",
  "unidades/Gerona/rczm_arapiles62/Historial/index.html",
  "Arapiles 62: heráldica y batallón Badajoz",
);
update("arapiles62", "arapiles-hist", {
  fullDescription:
    "Su escudo recoge las armas de Salamanca y referencias a la batalla de Arapiles de 1812. Fue aprobado en 1987. La web regimental identifica al Batallón de Infantería Mecanizada Badajoz I/62.",
  website: base + "unidades/Gerona/rczm_arapiles62/Organizacion/index.html",
});
add(
  "badajoz",
  "arapiles62",
  "Batallón de Infantería Mecanizada «Badajoz» I/62",
  "arapiles-hist",
);
source(
  "barcelona-hist",
  "unidades/Barcelona/ri63/Historial/index.html",
  "Barcelona 63: historial y heráldica",
);
update("barcelona63", "barcelona-hist", {
  history:
    "Sus antecedentes se remontan al Batallón de Voluntarios de Barcelona de 1793. El regimiento de montaña Barcelona 63 se organizó en 1966 y atravesó posteriores reorganizaciones. Su escudo reproduce las armas de Barcelona.",
  motto: "Por sus hechos le conocerán",
  website: base + "unidades/Barcelona/ri63/Organizacion/index.html",
});

update("tercio3", "brileg", {
  mission:
    "Administra y sostiene a sus unidades subordinadas y puede constituir una agrupación táctica.",
  fullDescription:
    "Comprende mando, plana mayor y las banderas de infantería ligero-protegida Valenzuela VII y Colón VIII. Cada bandera tiene entidad de batallón. Centraliza la gestión de personal, material y recursos económicos.",
  website: base + "unidades/Almeria/brileg/Organizacion/",
});
update("tercio4", "brileg", {
  mission:
    "Administra, prepara y sostiene sus unidades y aporta capacidad de maniobra a la brigada.",
  fullDescription:
    "Se organiza en mando, plana mayor y la X Bandera Millán Astray, de infantería ligera según la descripción institucional.",
  website: base + "unidades/Almeria/brileg/Organizacion/",
});
for (const id of ["valenzuela", "colon"])
  update(id, "brileg", {
    mission:
      "Es una unidad de maniobra de infantería ligero-protegida del Tercio 3º, preparada para ocupar y defender el terreno.",
    equipment: [
      "Vehículos blindados de ruedas, sin modelo individualizado en esta fuente.",
    ],
    website: base + "unidades/Almeria/brileg/Organizacion/",
  });
update("millan-astray", "brileg", {
  mission:
    "Aporta la unidad de maniobra de infantería del Tercio 4º a la brigada de La Legión.",
  website: base + "unidades/Almeria/brileg/Organizacion/",
});
update("bcg2", "brileg", {
  fullDescription:
    "Proporciona apoyo al mando, comunicaciones y seguridad de puestos de mando, además de capacidades de defensa contracarro, observación y protección NBQ.",
});
update("bz2", "brileg", {
  fullDescription:
    "Facilita la movilidad propia, realiza trabajos de protección y mantiene o construye infraestructura de comunicaciones.",
});
source(
  "legion-hist",
  "gl/unidades/Almeria/brileg/Historial/index.html",
  "La Legión: formación de la brigada y guarniciones",
);
update("tercio3", "legion-hist", {
  history:
    "El Tercio 3º fue uno de los núcleos sobre los que se organizó la Brigada de La Legión. Su asentamiento en esa organización corresponde a la Base Álvarez de Sotomayor, en Viator.",
  garrisonId: "alvarez-sotomayor",
});
update("tercio4", "legion-hist", {
  history:
    "Fue uno de los tercios que sirvieron de base a la organización de la Brigada de La Legión. Permaneció en el acuartelamiento Montejaque, en Ronda.",
  garrisonId: "montejaque",
});
source(
  "legion-local",
  "unidades/Almeria/brileg/Localizacion/index.html",
  "La Legión: bases de Viator y Ronda",
);
place("alvarez-sotomayor", "legion-local", {
  name: "Base Álvarez de Sotomayor",
  municipality: "Viator",
  province: "Almería",
  autonomousCommunity: "Andalucía",
  address: "Carretera Campamento, s/n",
  postalCode: "04240",
  phone: "+34950180062",
});
place("montejaque", "legion-local", {
  name: "Acuartelamiento Montejaque",
  municipality: "Ronda",
  province: "Málaga",
  autonomousCommunity: "Andalucía",
  address: "Carretera de Sevilla, s/n",
  postalCode: "29400",
  phone: "+34952189800",
});
source(
  "colon-centenario",
  "va/unidades/Almeria/brileg/Noticias/2026/05_VIII_Bandera_Colon_Aniversario_y_Bautismo_de_fuego.html",
  "VIII Bandera Colón: centenario, 2026",
);
update("colon", "colon-centenario", {
  creationDate: "1926-01-01",
  history:
    "Su organización comenzó el 1 de enero de 1926 en Dar Riffien, cerca de Ceuta. La noticia institucional de octubre de 2026 conmemora su centenario y confirma su encuadramiento en el Tercio 3º.",
  motto: "A Castilla y a León, nuevo mundo dio Colón",
});

source(
  "garellano-org",
  "unidades/Vizcaya/ril45/Organizacion/index.html",
  "Garellano 45: organización y misión",
);
update("garellano45", "garellano-org", {
  mission:
    "Prepara unidades de infantería para cometidos de seguridad y combate.",
  fullDescription:
    "Se compone de una plana mayor regimental y el Batallón de Infantería Motorizada Guipúzcoa I/45.",
  website: base + "unidades/Vizcaya/ril45/Organizacion/index.html",
});
add(
  "guipuzcoa",
  "garellano45",
  "Batallón de Infantería Motorizada «Guipúzcoa» I/45",
  "garellano-org",
);
source(
  "guipuzcoa-hist",
  "unidades/Vizcaya/ril45/Historial/Historialgarellano.html",
  "Guipúzcoa I/45: historial",
);
update("guipuzcoa", "guipuzcoa-hist", {
  creationDate: "1986-01-01",
  history:
    "Creado el 1 de enero de 1986 dentro del Plan META. En 1996 pasó a denominarse Guipúzcoa III/45 y en 2016 adoptó la denominación de batallón de infantería motorizada I/45.",
  garrisonId: "soyeche",
  website: base + "unidades/Vizcaya/ril45/Historial/Historialgarellano.html",
});
source(
  "garellano-hist",
  "unidades/Toledo/acinf/Publicaciones/84/2_Herencia_Articulo_Institucional_RI_45.pdf",
  "Memorial de Infantería 84: 150 años del Garellano",
);
update("garellano45", "garellano-hist", {
  history:
    "Se organizó en 1877 en Ciudad Real con los batallones de reserva Ciudad Real y Alcázar de San Juan. Asume como antigüedad la organización del primero, el 28 de febrero de 1872. Está vinculado a Bizkaia desde 1886; su nombre recuerda la batalla de 1503, no su fecha de creación.",
});
source(
  "garellano-local",
  "unidades/Vizcaya/ril45/Localizacion/index.html",
  "Garellano 45: localización y contacto",
);
place("soyeche", "garellano-local", {
  name: "Acuartelamiento Soyeche",
  municipality: "Mungia",
  province: "Bizkaia",
  autonomousCommunity: "País Vasco",
  address: "Aritz Bidea, 121",
  postalCode: "48100",
});
update("garellano45", "garellano-local", { garrisonId: "soyeche" });
contact("garellano45", "garellano-local", "+34946741862");
source(
  "sicilia-hist",
  "unidades/Guipuzcoa/ril67/Historial/HistorialRIL.html",
  "Tercio Viejo de Sicilia 67: historial",
);
update("sicilia67", "sicilia-hist", {
  history:
    "Su historial institucional sitúa su origen en el decreto de 23 de octubre de 1535. Recoge su servicio desde Sicilia y su participación en Lepanto, así como campañas posteriores y misiones internacionales.",
  website: base + "unidades/Guipuzcoa/ril67/Historial/HistorialRIL.html",
});
source(
  "legazpi-hist",
  "unidades/Guipuzcoa/ril67/Historial/HistorialBil.html",
  "Legazpi I/67: historial",
);
update("legazpi", "legazpi-hist", {
  name: "Batallón de Infantería Motorizada «Legazpi» I/67",
  history:
    "Denominado Batallón de Cazadores de Montaña 23 en 1943, recibió el nombre Legazpi en 1951. En 1996 pasó a infantería ligera I/67 y en 2016 a infantería motorizada.",
  website: base + "unidades/Guipuzcoa/ril67/Historial/HistorialBil.html",
});
source(
  "sicilia-local",
  "unidades/Guipuzcoa/ril67/Localizacion/index.html",
  "Sicilia 67: localización y secretaría",
);
place("loyola", "sicilia-local", {
  name: "Acuartelamiento Loyola",
  address: "Sierra Aralar, 51–53",
  municipality: "Donostia / San Sebastián",
  province: "Gipuzkoa",
  autonomousCommunity: "País Vasco",
  postalCode: "20014",
});
update("sicilia67", "sicilia-local", { garrisonId: "loyola" });
contact(
  "sicilia67",
  "sicilia-local",
  "+34943446724",
  "RILTVSICILIA67@ET.MDE.ES",
  "Secretaría del regimiento",
);
source(
  "saboya-hist",
  "eu/unidades/Badajoz/bri_extremadura_xi/Organizacion/RI_6/RI_SABOYA.html",
  "Saboya 6: reseña histórica",
);
update("saboya6", "saboya-hist", {
  history:
    "La reseña institucional remonta sus antecedentes al Tercio de Saboya de 1537, formado con fuerzas procedentes de Lombardía. Describe su participación en las campañas italianas y en la Guerra de la Independencia, incluida la defensa de Tarragona.",
  website:
    base +
    "eu/unidades/Badajoz/bri_extremadura_xi/Organizacion/RI_6/RI_SABOYA.html",
});
source(
  "castilla-hist",
  "unidades/Badajoz/bri_extremadura_xi/Organizacion/RAC_16/RAC16.html",
  "Castilla 16: historial",
);
update("castilla16", "castilla-hist", {
  creationDate: "1793-06-01",
  history:
    "Creado en 1793 como Regimiento de Voluntarios de Castilla. Sus primeros batallones se organizaron en Vicálvaro y Leganés. Participó en la campaña del Rosellón y la Guerra de la Independencia; su historial recoge el sobrenombre El Héroe.",
  website:
    base + "unidades/Badajoz/bri_extremadura_xi/Organizacion/RAC_16/RAC16.html",
});
update("cantabria", "extremadura-org", {
  equipment: ["VCI Pizarro, según la página de organización de la brigada."],
});
update("las-navas", "extremadura-org", {
  equipment: [
    "TOA M-113, según la página de organización; se anuncia una futura sustitución por vehículos 8×8 sin acreditar aquí su finalización.",
  ],
});
update("bcg11", "extremadura-org", {
  fullDescription:
    "Apoya el mando y control de la brigada y aporta capacidades de protección, defensa NBQ, defensa contracarro e inteligencia.",
});
update("bz11", "extremadura-org", {
  fullDescription:
    "Proporciona apoyo de ingenieros a la brigada. La descripción institucional incluye capacidades anfibias.",
});
update("princesa", "guzman-org", {
  equipment: [
    "TOA M-113; la fuente contempla su sustitución por VCR Dragón, sin confirmar aquí la finalización de ese proceso.",
  ],
});
update("lepanto", "guzman-org", { equipment: ["VCI Pizarro."] });
update("bcg10", "guzman-org", {
  fullDescription:
    "Apoya el funcionamiento y seguridad del puesto de mando y sus comunicaciones; incorpora capacidades de defensa contracarro, NBQ, inteligencia y policía militar.",
});

source(
  "america-org",
  "unidades/Navarra/rczm/Organizacion/index.html",
  "América 66: organización y misión",
);
update("america66", "america-org", {
  mission:
    "Genera agrupamientos de infantería ligera con preparación específica para montaña y ambientes fríos.",
  fullDescription:
    "Consta de plana mayor y Batallón de Cazadores de Montaña Montejurra I/66, dentro del Mando de Tropas de Montaña.",
  website: base + "unidades/Navarra/rczm/Organizacion/index.html",
});
add(
  "montejurra",
  "america66",
  "Batallón de Cazadores de Montaña «Montejurra» I/66",
  "america-org",
);
update("montejurra", "america-org", {
  mission:
    "Aporta la capacidad de maniobra en montaña del América 66, con elementos de mando, maniobra, apoyo y servicios.",
  website: base + "unidades/Navarra/rczm/Organizacion/index.html",
});
source(
  "america-hist",
  "gl/unidades/Navarra/rczm/Historial/index.html",
  "América 66: historial y patrona",
);
update("america66", "america-hist", {
  history:
    "Creado por orden de Carlos III en julio de 1764 como El Real de América, destinado a reforzar Nueva España. Pasó su primera revista en Alicante en agosto de ese año.",
  patron: "Purísima Concepción",
});
source(
  "soria-hist",
  "unidades/Las_Palmas/ril9/Historial/index.html",
  "Soria 9: historial institucional",
);
update("soria9", "soria-hist", {
  history:
    "La unidad remonta sus antecedentes a fuerzas expedicionarias de 1509 y al Tercio Viejo de Nápoles. Su historial documenta disoluciones y nuevas organizaciones, el nombre Soria desde 1715 y el sobrenombre El Sangriento; no se presenta como una continuidad orgánica ininterrumpida.",
  website: base + "unidades/Las_Palmas/ril9/Organizacion/index.html",
});
source(
  "tenerife-hist",
  "unidades/Santa_Cruz_De_Tenerife/ril49/Historial/index.html",
  "Tenerife 49: historial",
);
update("tenerife49", "tenerife-hist", {
  history:
    "Su historial vincula sus antecedentes al Tercio de Canarias de 1629, formado con milicias insulares, y recoge sucesivas reorganizaciones. Entre los episodios recordados están la defensa de Santa Cruz de Tenerife en 1797 y la batalla de La Albuera de 1811.",
  website: base + "unidades/Santa_Cruz_De_Tenerife/ril49/Historial/index.html",
});
source(
  "canarias-hist",
  "unidades/Las_Palmas/ril50/Historial/index.html",
  "Canarias 50: origen y evolución",
);
update("canarias50", "canarias-hist", {
  history:
    "El Instituto de Historia y Cultura Militar fija sus orígenes en los Tercios de Milicias de Canarias del 28 de abril de 1573. Adoptó el nombre de Regimiento de Infantería Ligera Canarias 50 en 1996 y su denominación sin el calificativo ligera en 2016.",
  website: base + "unidades/Las_Palmas/ril50/Historial/index.html",
});
source(
  "raca93-hist",
  "unidades/Santa_Cruz_De_Tenerife/raca93/Noticias/2021/20210609_139_anos_de_vida_e_historia_del_RACA93.html",
  "RACA 93: antecedente fundacional de 1882",
);
update("raca93", "raca93-hist", {
  history:
    "Reconoce como primer antecedente al Batallón de Artillería a Pie de Canarias, creado por Real Decreto de 9 de junio de 1882 y con sede en Tenerife. La noticia de su 139 aniversario explica el origen de su tradición y de la custodia de su bandera.",
  website: base + "unidades/Santa_Cruz_De_Tenerife/raca93/Historial/index.html",
});
source(
  "bhelma3-info",
  "unidades/La_Rioja/bhelma3.html",
  "BHELMA III: misión, medios y contacto",
);
update("bhelma3", "bhelma3-info", {
  mission:
    "Proporciona transporte aeromóvil y apoyo a las unidades terrestres; es referencia de las FAMET para vuelo en montaña.",
  equipment: ["Helicóptero NH-90 Sarrio (HT-29)."],
  motto: "Rex in montibus",
  garrisonId: "heroes-revellin",
  website: base + "unidades/La_Rioja/bhelma3.html",
});
contact("bhelma3", "bhelma3-info", "+34941279444", "BHELMA_III@mde.es");
place("heroes-revellin", "bhelma3-info", {
  name: "Acuartelamiento Héroes del Revellín",
  municipality: "Agoncillo",
  province: "La Rioja",
  autonomousCommunity: "La Rioja",
});
source(
  "napoles-info",
  "unidades/Madrid/bripacii/Organizacion/RIPAC_Napoles_4.html",
  "Nápoles 4: historia, organización y material",
  "La tabla de misiones nacionales contiene fechas incoherentes; no se incorporan esas fechas.",
);
update("napoles", "napoles-info", {
  creationDate: "2016-01-01",
  history:
    "El regimiento actual se creó el 1 de enero de 2016 e integró las banderas Roger de Flor y Roger de Lauria. Recupera el nombre del antiguo Tercio Nuevo de Nápoles, sin confundir esa tradición con la fecha de constitución de la unidad actual.",
  mission: "Genera agrupaciones de infantería paracaidista y de asalto aéreo.",
  equipment: ["URO VAMTAC", "Mula Falcata", "RG-31 Nyala", "LMV Lince"],
  garrisonId: "principe",
  website: base + "unidades/Madrid/bripacii/Organizacion/RIPAC_Napoles_4.html",
});
place("principe", "napoles-info", {
  name: "Base Príncipe",
  municipality: "Paracuellos de Jarama",
  province: "Madrid",
  autonomousCommunity: "Comunidad de Madrid",
});
source(
  "zaragoza-info",
  "gl/unidades/Madrid/bripacii/Organizacion/RIPAC_Zaragoza_5.html",
  "Zaragoza 5: constitución en 2016",
);
update("zaragoza", "zaragoza-info", {
  creationDate: "2016-07-01",
  history:
    "Constituido el 1 de julio de 2016 dentro de la reorganización de la BRIPAC. Integra la Bandera Ortiz de Zárate III/5 y recupera una denominación histórica de la Infantería.",
  fullDescription:
    "Mantiene las capacidades paracaidistas y de asalto aéreo de su bandera.",
  website:
    base + "gl/unidades/Madrid/bripacii/Organizacion/RIPAC_Zaragoza_5.html",
});
source(
  "roger-flor-info",
  "de/unidades/Madrid/bripacii/Organizacion/Bandera_Roger_de_Flor.html",
  "Roger de Flor I/4: historial y localización",
);
update("roger-flor", "roger-flor-info", {
  creationDate: "1953-10-17",
  history:
    "Creada el 17 de octubre de 1953. En 2002 se trasladó de Alcalá de Henares a la Base Príncipe. Desde enero de 2016 está integrada en Nápoles 4 con la denominación I/4.",
  garrisonId: "principe",
  website:
    base +
    "de/unidades/Madrid/bripacii/Organizacion/Bandera_Roger_de_Flor.html",
});
source(
  "roger-lauria-info",
  "unidades/Madrid/bripacii/Organizacion/Bandera_Roger_de_Lauria.html",
  "Roger de Lauria II/4: historia, misión y localización",
);
update("roger-lauria", "roger-lauria-info", {
  history:
    "Fundada en 1956, participó en la campaña de Ifni al año siguiente. La denominación Bandera conserva una tradición adoptada por los primeros paracaidistas, muchos de ellos procedentes de La Legión y de unidades de montaña.",
  mission:
    "Genera agrupamientos de infantería ligera para operaciones paracaidistas y puede emplear vehículos protegidos.",
  garrisonId: "principe",
  website:
    base + "unidades/Madrid/bripacii/Organizacion/Bandera_Roger_de_Lauria.html",
});
source(
  "ortiz-info",
  "it/unidades/Madrid/bripacii/Organizacion/Bandera_Ortiz_de_Zarate.html",
  "Ortiz de Zárate III/5: historial y localización",
);
update("ortiz-zarate", "ortiz-info", {
  creationDate: "1960-07-08",
  history:
    "Creada el 8 de julio de 1960 en Murcia, con personal de la I Bandera. Recibe el nombre del teniente Ortiz de Zárate, fallecido en Ifni en 1957. Tras su etapa en Alcalá de Henares, volvió a Murcia en 2003.",
  mission:
    "Prepara infantería ligera para operaciones paracaidistas y helitransportadas.",
  garrisonId: "santa-barbara",
  website:
    base +
    "it/unidades/Madrid/bripacii/Organizacion/Bandera_Ortiz_de_Zarate.html",
});
place("santa-barbara", "ortiz-info", {
  name: "Acuartelamiento Santa Bárbara",
  municipality: "Murcia",
  province: "Murcia",
  autonomousCommunity: "Región de Murcia",
  notes: "Situado en Javalí Nuevo.",
});
source(
  "galicia64-hist",
  "en/unidades/Huesca/rczm_galicia64/Historial/index.html",
  "Galicia 64 y Pirineos I/64: historial",
);
update("galicia64", "galicia64-hist", {
  history:
    "El historial recoge la revisión del IHCM que sitúa en 1560 la antigüedad de sus antecedentes, frente a 1566. El regimiento de alta montaña Galicia 64 se organizó en 1966 con los batallones Pirineos y Gravelinas; este último se disolvió en 1996.",
  website: base + "unidades/Huesca/rczm_galicia64/Organizacion/index.html",
});
source(
  "galicia64-local",
  "unidades/Huesca/rczm_galicia64/Localizacion/index.html",
  "Galicia 64: plana mayor en San Bernardo y Pirineos en La Victoria",
);
add(
  "pirineos",
  "galicia64",
  "Batallón de Cazadores de Montaña «Pirineos» I/64",
  "galicia64-local",
);
update("pirineos", "galicia64-hist", {
  history:
    "El Batallón Pirineos 11 se constituyó en 1943, heredando el historial del Regimiento Borbón. Adoptó el número I/64 en 1989 y la denominación de cazadores de montaña en 1994.",
  website: base + "en/unidades/Huesca/rczm_galicia64/Historial/index.html",
});
place("san-bernardo", "galicia64-local", {
  name: "Acuartelamiento San Bernardo",
  municipality: "Jaca",
  province: "Huesca",
  autonomousCommunity: "Aragón",
  address: "Avenida Escuela Militar de Montaña, s/n",
  postalCode: "22700",
});
place("la-victoria", "galicia64-local", {
  name: "Acuartelamiento La Victoria",
  municipality: "Jaca",
  province: "Huesca",
  autonomousCommunity: "Aragón",
  address: "Avenida Llanos de la Victoria, s/n",
  postalCode: "22700",
});
update("galicia64", "galicia64-local", {
  garrisonId: "san-bernardo",
  notes:
    "La ficha localiza la plana mayor. El Batallón Pirineos ocupa La Victoria, una instalación diferente de la misma base discontinua.",
});
contact(
  "galicia64",
  "galicia64-local",
  "+34974298616",
  null,
  "Contacto publicado de San Bernardo",
);
update("pirineos", "galicia64-local", { garrisonId: "la-victoria" });
contact(
  "pirineos",
  "galicia64-local",
  "+34974358011",
  null,
  "Contacto publicado de La Victoria",
);
source(
  "america-local",
  "unidades/Navarra/rczm/Localizacion/index.html",
  "América 66: localización y contacto",
);
place("aizoain", "america-local", {
  name: "Acuartelamiento Aizoáin",
  municipality: "Berrioplano",
  province: "Navarra",
  autonomousCommunity: "Comunidad Foral de Navarra",
  address: "Carretera de Guipúzcoa, s/n",
  postalCode: "31195",
});
update("america66", "america-local", { garrisonId: "aizoain" });
contact("america66", "america-local", "+34948167000");
source(
  "reina-info",
  "unidades/Cordoba/brimzx_guzmanelbueno/Organizacion/RI_N.2/index.html",
  "La Reina 2: historia y misión",
);
update("reina2", "reina-info", {
  history:
    "La página distingue sus antecedentes de la Guardia de la Reina del siglo XVII de la reorganización del actual regimiento en Valencia en 1808, como Cazadores de Caro. Se denominó Lepanto 2 en 1944 y recuperó La Reina en 1977.",
  mission:
    "Prepara sus batallones para las misiones de combate de la Brigada Guzmán el Bueno X.",
  website:
    base +
    "unidades/Cordoba/brimzx_guzmanelbueno/Organizacion/RI_N.2/index.html",
});
source(
  "lusitania-hist",
  "unidades/Zaragoza/bri_aragon/Noticias/2016/12._LIBRO_SOBRE_LOS_DRAGONES_DE_LUSITANIA.html",
  "Lusitania 8: origen histórico",
);
update("lusitania", "lusitania-hist", {
  history:
    "El Regimiento Lusitania fue creado en 1709. Su tradición de dragones incluye campañas en Italia, Portugal, Francia y el norte de África.",
});
source(
  "raca20-hist",
  "unidades/Zaragoza/raca20/Historial/index.html",
  "RACA 20: historial",
);
update("raca20", "raca20-hist", {
  history:
    "Su antecedente se organizó por orden de la Junta Suprema de 27 de octubre de 1808 como Brigada Maniobrera de artillería montada, inicialmente concentrada en Sevilla. Participó en la Guerra de la Independencia y recibió el privilegio de usar estandarte en 1815.",
  website: base + "unidades/Zaragoza/raca20/Historial/index.html",
});
source(
  "raca20-local",
  "unidades/Zaragoza/raca20/Localizacion/index.html",
  "RACA 20: localización y contacto",
);
update("raca20", "raca20-local", {
  garrisonId: "san-jorge",
  notes:
    "La unidad publica su ubicación en la zona B de San Jorge, carretera de Huesca km 8,5; difiere de la dirección general de la base.",
});
contact("raca20", "raca20-local", "+34976739350");
for (const [
  id,
  path,
  gid,
  name,
  town,
  province,
  address,
  postal,
  phone,
  email,
] of [
  [
    "soria9",
    "Las_Palmas/ril9",
    "puerto-rosario",
    "Acuartelamiento Puerto del Rosario",
    "Puerto del Rosario",
    "Las Palmas",
    "Comandante Díaz Trayter, 1",
    "35600",
    "+34928860000",
    "ril-sor9@et.mde.es",
  ],
  [
    "canarias50",
    "Las_Palmas/ril50",
    "aleman-ramirez",
    "Base General Alemán Ramírez",
    "Las Palmas de Gran Canaria",
    "Las Palmas",
    "Coronel Rocha, s/n",
    "35009",
    "+34928213315",
    "RIL50@et.mde.es",
  ],
  [
    "tenerife49",
    "Santa_Cruz_De_Tenerife/ril49",
    "hoya-fria",
    "Acuartelamiento Hoya Fría",
    "Santa Cruz de Tenerife",
    "Santa Cruz de Tenerife",
    "Carretera de Hoya Fría, s/n",
    "38110",
    "+34922568700",
    "RI_TENERIFE_49@mde.es",
  ],
  [
    "raca93",
    "Santa_Cruz_De_Tenerife/raca93",
    "los-rodeos",
    "Acuartelamiento Los Rodeos",
    "San Cristóbal de La Laguna",
    "Santa Cruz de Tenerife",
    "Carretera del Matadero, s/n",
    "38297",
    "+34922676000",
    null,
  ],
]) {
  const sid = source(
    id + "-local",
    "unidades/" + path + "/Localizacion/index.html",
    name + ": localización y contacto de " + id,
  );
  place(gid, sid, {
    name,
    municipality: town,
    province,
    autonomousCommunity: "Canarias",
    address,
    postalCode: postal,
  });
  update(id, sid, { garrisonId: gid });
  contact(id, sid, phone, email);
}
for (const [id, code, mission, phone] of [
  [
    "bhela1",
    "BI",
    "Proporciona capacidad de ataque, reconocimiento y apoyo a las unidades terrestres.",
    "+34926262300",
  ],
  [
    "bheleme2",
    "BII",
    "Apoya a la población civil y a la UME en catástrofes, rescates y extinción de incendios.",
    "+34961605000",
  ],
  [
    "bhelma4",
    "BIV",
    "Realiza transporte táctico y apoyo aeromóvil, con especialización en operaciones especiales aéreas.",
    "+34954939070",
  ],
  [
    "bheltra5",
    "BV",
    "Proporciona transporte pesado de personal y material y apoyo logístico mediante helicópteros Chinook.",
    "+34918463393",
  ],
]) {
  const path = "unidades/Madrid/famet/Historial/Ucos/" + code + "/index.html";
  const sid = source(
    id + "-info",
    path,
    units.find((u) => u.id === id).name + ": misión y contacto",
  );
  update(id, sid, { mission, website: base + path });
  contact(id, sid, phone);
}
update("bhela1", "bhela1-info", {
  equipment: ["HA-28 Tigre"],
  garrisonId: "sanchez-bilbao",
});
place("sanchez-bilbao", "bhela1-info", {
  name: "Base Coronel Sánchez Bilbao",
  municipality: "Almagro",
  province: "Ciudad Real",
  autonomousCommunity: "Castilla-La Mancha",
});
update("bheleme2", "bheleme2-info", {
  fullDescription:
    "Se articula en un subgrupo de helicópteros medios en la Base Jaime I de Bétera y otro de helicópteros ligeros en la Base Coronel Maté de Colmenar Viejo. No se reduce su ubicación a una sola sede.",
});
update("bhelma4", "bhelma4-info", {
  garrisonId: "el-copero",
  equipment: ["Cougar (HT-27), según la descripción institucional."],
});
contact("bhelma4", "bhelma4-info", null, "BHELMA-IV@ET.MDE.ES");
place("el-copero", "bhelma4-info", {
  name: "Base El Copero",
  municipality: "Dos Hermanas",
  province: "Sevilla",
  autonomousCommunity: "Andalucía",
  address: "Carretera de Isla Menor, s/n",
  postalCode: "41703",
});
update("bheltra5", "bheltra5-info", {
  garrisonId: "coronel-mate",
  equipment: ["CH-47F Chinook (HT-17)"],
});
place("coronel-mate", "bheltra5-info", {
  name: "Base Coronel Maté",
  municipality: "Colmenar Viejo",
  province: "Madrid",
  autonomousCommunity: "Comunidad de Madrid",
});
source(
  "bhelma4-hist",
  "Galerias/Descarga_pdf/Unidades/Madrid/famet/ucos_h/HISTORIA_BIV.pdf",
  "BHELMA IV: historia",
);
update("bhelma4", "bhelma4-hist", {
  history:
    "Creado en 1975 como Unidad de Helicópteros IV en El Copero. Compartió inicialmente instalaciones con la UHEL II dentro de la Agrupación de Helicópteros del Sur. Adoptó la denominación BHELMA IV en 1987.",
});
source(
  "bheltra5-hist",
  "Galerias/multimedia/boletines/2025/111/accesible/tierra-digital-111.pdf",
  "Tierra 111 (2025): origen del BHELTRA V",
);
update("bheltra5", "bheltra5-hist", {
  creationDate: "1973-04-01",
  history:
    "Se creó en Colmenar Viejo el 1 de abril de 1973, coincidiendo con la incorporación del Chinook a las FAMET. Su trayectoria está ligada al transporte pesado y a la modernización de las distintas versiones de este helicóptero.",
});
source(
  "guadarrama-hist",
  "unidades/Madrid/briacxii/Historial/",
  "Guadarrama XII: historial de sus batallones",
);
update("leon", "guadarrama-hist", {
  history:
    "El Batallón de Carros II/61, antecedente identificado por la brigada como actual Batallón León, se desplegó en el Sáhara en octubre de 1974 junto al Grupo de Artillería XII.",
});
update("bcg12", "guadarrama-hist", {
  creationDate: "1997-01-01",
  history:
    "Se constituyó durante la reorganización de 1997, integrando las compañías de Cuartel General y Transmisiones de la brigada.",
});
update("bz12", "guadarrama-hist", {
  history:
    "El historial de la brigada sitúa su constitución en la reorganización de enero de 1997, que disolvió el anterior Batallón Mixto de Ingenieros XII.",
});
source(
  "bz7-info",
  "unidades/Pontevedra/brilat/Organizacion/Zapadores.html",
  "Zapadores VII: historial, misión y organización",
);
update("bz7", "bz7-info", {
  history:
    "Sus antecedentes incluyen el Regimiento de Zapadores-Minadores 8 de 1921. Se constituyó como Batallón Mixto de Ingenieros Aerotransportable el 1 de febrero de 1966 en A Coruña; pasó a Figueirido en 1988 y adoptó la denominación de Zapadores Ligero Aerotransportable VII en 2010.",
  mission:
    "Presta apoyo de ingenieros a la brigada, con capacidades de zapadores, maquinaria de obras y equipos técnicos especializados.",
  motto: "Zapadores, a la misión",
  website: base + "unidades/Pontevedra/brilat/Organizacion/Zapadores.html",
});
source(
  "bcg7-info",
  "unidades/Pontevedra/brilat/Organizacion/Batallon_cuartel_general.html",
  "Cuartel General VII: historial y misión",
);
update("bcg7", "bcg7-info", {
  creationDate: "1997-03-26",
  history:
    "Su antecedente fue la Compañía de Cuartel General Aerotransportable, creada en A Coruña en 1966. El batallón se constituyó en marzo de 1997 reuniendo unidades de apoyo al cuartel general.",
  mission:
    "Atiende necesidades operativas, logísticas y administrativas de la BRILAT y permite al cuartel general ejercer el mando y control y organizar su proyección.",
  motto: "Camino de constancia y conquista",
  website:
    base +
    "unidades/Pontevedra/brilat/Organizacion/Batallon_cuartel_general.html",
});
source(
  "bz16-hist",
  "Galerias/Imagenes/unidades/Santa_Cruz_De_Tenerife/bonzapa_xvi/HPDF.pdf",
  "Zapadores XVI: historial institucional, revisión de 2016",
);
update("bz16", "bz16-hist", {
  history:
    "Su linaje reúne las unidades de ingenieros de Tenerife y Gran Canaria. El Batallón de Ingenieros XVI se integró en el XV en 2002. La denominación Batallón de Zapadores XVI se adoptó en enero de 2016, con presencia en La Cuesta y La Isleta.",
  website: base + "unidades/Santa_Cruz_De_Tenerife/bonzapa_xvi/",
});
update("cataluna", "barcelona-hist", {
  history:
    "El Batallón de Infantería Motorizado Barcelona II/62 pasó al regimiento Barcelona 63 en enero de 2020 con la denominación Cataluña I/63. Como núcleo de un grupo táctico, se desplegó en Líbano en noviembre de ese año.",
});
source(
  "barcelona-presentacion",
  "en/unidades/Barcelona/ri63/",
  "Barcelona 63: presentación y material del Cataluña",
);
update("cataluna", "barcelona-presentacion", {
  equipment: ["VAMTAC"],
  fullDescription:
    "Es el batallón de infantería motorizada del Barcelona 63. La presentación oficial destaca su movilidad táctica, flexibilidad y empleo de vehículos VAMTAC.",
  website: base + "en/unidades/Barcelona/ri63/",
});
source(
  "bripac-org",
  "unidades/Madrid/bripacii/Organizacion/index.html",
  "BRIPAC: organización y materiales",
);
update("lusitania", "bripac-org", {
  equipment: ["VRCC Centauro", "VAMTAC", "BMR-2 PM.120"],
  fullDescription:
    "El regimiento integra el Grupo de Caballería Ligero Sagunto I/8, de paracaidistas.",
});
source(
  "bz6-vjtf",
  "Galerias/multimedia/boletines/2019/046/accesible/digital_tierra_046.pdf",
  "Tierra digital 46: Zapadores VI en la preparación de VJTF 2020",
);
update("bz6", "bz6-vjtf", {
  history:
    "En la preparación de la VJTF 2020 aportó una compañía de apoyo de ingenieros. El reportaje de 2019 documenta sus trabajos de organización del terreno y preparación de asentamientos de artillería.",
  mission:
    "Aporta apoyo de zapadores y organización del terreno a las unidades paracaidistas.",
});
source(
  "aragon-libano2024",
  "https://www.defensa.gob.es/gabinete/notasPrensa/2024/11/DGC-241124-regreso-brigada-aragon.html",
  "Defensa: regreso de Aragón I de Líbano, noviembre de 2024",
);
for (const id of ["bcg1", "bz1"])
  update(id, "aragon-libano2024", {
    history:
      "Personal de esta unidad integró el contingente BRILIB XLI, liderado por la Brigada Aragón I, que finalizó su despliegue en Líbano en noviembre de 2024.",
  });
source(
  "soria-org",
  "unidades/Las_Palmas/ril9/Organizacion/index.html",
  "Soria 9: misión y organización del Fuerteventura",
);
update("soria9", "soria-org", {
  mission:
    "Contribuye a la defensa y vigilancia del archipiélago, prepara fuerzas para operaciones nacionales y multinacionales y apoya a las autoridades civiles.",
});
update("fuerteventura", "soria-org", {
  fullDescription:
    "Es el batallón de infantería protegida del Soria 9. La organización publicada recoge tres compañías de fusiles, una de mando y apoyo y una de servicios.",
  website: base + "unidades/Las_Palmas/ril9/Organizacion/index.html",
});
source(
  "tenerife-org",
  "unidades/Santa_Cruz_De_Tenerife/ril49/Organizacion/index.html",
  "Tenerife 49: misión, organización del Albuera y material",
);
update("tenerife49", "tenerife-org", {
  mission:
    "Prepara sus unidades para combate convencional, estabilización, operaciones aeromóviles, mantenimiento de paz y apoyo a instituciones civiles.",
  equipment: [
    "Vehículos VAMTAC",
    "Vehículos de transporte y medios de transmisiones",
  ],
});
update("albuera", "tenerife-org", {
  fullDescription:
    "Constituye la unidad de combate del Tenerife 49. Se organiza en mando, plana mayor, compañía de mando y apoyo, unidades de maniobra y compañía de servicios. Esta última reúne abastecimiento, mantenimiento y sanidad.",
  website:
    base + "unidades/Santa_Cruz_De_Tenerife/ril49/Organizacion/index.html",
});
source(
  "canarias-org",
  "unidades/Las_Palmas/ril50/Organizacion/index.html",
  "Canarias 50: misión y organización",
);
update("canarias50", "canarias-org", {
  mission:
    "Prepara unidades para operaciones ofensivas, control de zona, estabilización y empleo aeromóvil, integrando apoyos de fuego, movilidad y protección.",
});
source(
  "cerinola-bastion",
  "de/unidades/Las_Palmas/ril50/Noticias/2022/Ejercicio-Beta-Bastion-Canario.html",
  "Ceriñola y Cuartel General XVI: ejercicio Bastión Canario, 2022",
);
update("cerinola", "cerinola-bastion", {
  history:
    "En mayo de 2022 fue el núcleo del grupo táctico del ejercicio Bastión Canario, con apoyos de zapadores, observación y sistemas no tripulados. El ejercicio documentó su preparación para el combate defensivo.",
  website:
    base +
    "de/unidades/Las_Palmas/ril50/Noticias/2022/Ejercicio-Beta-Bastion-Canario.html",
});
update("bcg16", "cerinola-bastion", {
  fullDescription:
    "Aporta capacidades de apoyo a la Brigada Canarias XVI. La participación publicada en Bastión Canario 2022 documenta sus elementos de observación y de vehículos aéreos no tripulados.",
});
source(
  "bcg6-info",
  "en/unidades/Madrid/bripacii/Organizacion/Batallon_Cuartel_General.html",
  "Cuartel General VI: historia, organización y misión",
);
update("bcg6", "bcg6-info", {
  creationDate: "1997-03-21",
  history:
    "Se constituyó en marzo de 1997 agrupando compañías y unidades de apoyo antes independientes. La Banda de Guerra se incorporó en 1998; la organización siguió evolucionando con capacidades de inteligencia, reconocimiento y defensa NBQ.",
  mission:
    "Sostiene los puestos de mando y las comunicaciones de la brigada y aporta capacidades de inteligencia, defensa contracarro, reconocimiento y protección NBQ.",
  website:
    base +
    "en/unidades/Madrid/bripacii/Organizacion/Batallon_Cuartel_General.html",
});
for (const id of ["san-quintin", "toledo"])
  update(id, "principe-org", {
    fullDescription:
      "Es uno de los dos batallones de maniobra del Príncipe 3. La organización regimental publicada le asigna plana mayor, tres compañías de fusiles, una de mando y apoyo y una de plana mayor y servicios.",
    website: base + "unidades/Pontevedra/brilat/Organizacion/Ril_3.html",
  });
update("zamora", "isabel-org", {
  fullDescription:
    "Es el elemento de combate del Isabel la Católica 29, especializado en infantería a pie en terreno boscoso. Se articula en tres compañías de fusiles, una de mando y apoyo y una de servicios.",
  equipment: ["Vehículos URO VAMTAC"],
  website: base + "unidades/Pontevedra/brilat/Organizacion/Ril_29.html",
});
source(
  "badajoz-hist",
  "en/unidades/Gerona/rczm_arapiles62/Historial/historialbadajoz.html",
  "Badajoz I/62: historial institucional",
);
update("badajoz", "badajoz-hist", {
  history:
    "El historial institucional remonta sus antecedentes al Tercio Viejo de Extremadura de 1643. Tras sucesivas reorganizaciones, el Batallón Badajoz pasó del Barcelona 63 al Arapiles 62 en 1993. La fuente conserva denominaciones históricas de montaña diferentes de su actual carácter mecanizado.",
});
source(
  "badajoz-material",
  "Galerias/multimedia/boletines/2025/111/accesible/tierra-digital-111.pdf",
  "Tierra 111 (2025), páginas 19–22: Badajoz mecanizado",
);
update("badajoz", "badajoz-material", {
  mission:
    "Proporciona infantería mecanizada para acciones de reconocimiento, seguridad y combate, y puede formar el núcleo de un grupo táctico reforzado.",
  equipment: ["VCI Pizarro"],
  website:
    base + "en/unidades/Gerona/rczm_arapiles62/Historial/historialbadajoz.html",
});
source(
  "valenzuela-hist",
  "gl/unidades/Madrid/ihycm/Mecedora/20231211-mecedora-madrid.html?__locale=gl",
  "IHCM: centenario de la VII Bandera Valenzuela",
  "Página de contenidos actualizados que conserva una fecha de cabecera de 2023; la reseña del centenario se refiere a 2025.",
);
update("valenzuela", "valenzuela-hist", {
  creationDate: "1925-05-01",
  history:
    "La VII Bandera se creó el 1 de mayo de 1925. Recibe el nombre de Rafael de Valenzuela, jefe de La Legión fallecido en Tizzi Azza en 1923. Su guion combina la cruz de Santiago y las armas de Valenzuela.",
});
const defenseSource = sources.find((s) => s.id === "aragon-libano2024");
if (defenseSource) defenseSource.publisher = "Ministerio de Defensa";
source(
  "bhela1-hist",
  "Galerias/Descarga_pdf/Unidades/Madrid/famet/ucos_h/BHELA_I_HISTORIA.pdf",
  "BHELA I: historial",
);
update("bhela1", "bhela1-hist", {
  history:
    "Su formación comenzó en 1980. Estuvo inicialmente en Colmenar Viejo y se trasladó a Almagro en 1983. Los primeros Tigre HAP llegaron en 2007; la incorporación del HAD Bloque II empezó en 2016, dentro de la modernización de la unidad.",
});
source(
  "bhelma3-hist",
  "Galerias/Descarga_pdf/Unidades/Madrid/famet/UCOS/HISTORIA_BIII.pdf",
  "BHELMA III: historial y lema",
  "Las fuentes difieren en el día de constitución de UHEL III (mayo o noviembre de 1974); se conserva únicamente el año.",
);
update("bhelma3", "bhelma3-hist", {
  history:
    "Tiene su origen en la UHEL III de 1974. Su trayectoria está ligada a Agoncillo y al vuelo en montaña. En septiembre de 2016 recibió los primeros NH-90 Sarrio para su dotación.",
  equipment: ["NH-90 Sarrio"],
  motto: "Rex in montibus",
});
source(
  "bheleme2-hist",
  "Galerias/Descarga_pdf/EjercitoTierra/desfiles_actos/dia_fiesta_nacional_2016/2016_historial_unidades_famet.pdf",
  "FAMET: creación del BHELEME II en 2008",
);
update("bheleme2", "bheleme2-hist", {
  history:
    "Se organizó en 2008 tras la disolución del anterior BHELMA II. Su núcleo de constitución comenzó en abril y el dossier institucional sitúa la creación del batallón de emergencias en diciembre. Orientó su preparación al apoyo a la población civil y la lucha contra incendios.",
});
source(
  "tercio3-fundacion",
  "Galerias/multimedia/revista-ejercito/2015/Revista_Ejercito_886_Enero_2015.pdf",
  "Revista Ejército 886 (2015), páginas 48–50: fundación del Tercio 3º",
  "El artículo explica que el EME resolvió en 2006 la discrepancia 1939/1940 y fijó el 21 de diciembre de 1939 como fecha oficial.",
);
update("tercio3", "tercio3-fundacion", {
  creationDate: "1939-12-21",
  specialty: "Infantería",
  abbreviation: "TERLEG 3",
  history:
    "Se constituyó en Larache al terminar la Guerra Civil. En 2006 el Estado Mayor del Ejército fijó el 21 de diciembre de 1939 como fecha oficial de fundación, resolviendo la discrepancia con enero de 1940. Adoptó el nombre Don Juan de Austria en 1943, pasó al Sáhara en 1958 y se replegó a Fuerteventura en 1975–1976. Posteriormente se integró en la Brigada de La Legión.",
});
update("tercio4", "brileg", { specialty: "Infantería" });
update("princesa", "reina-info", {
  fullDescription:
    "Es el batallón de infantería protegida de La Reina 2. La fuente describe su dotación de TOA M-113 y la previsión de sustituirlos por VCR Dragón.",
});
update("lepanto", "reina-info", {
  fullDescription:
    "Es el batallón de infantería mecanizada de La Reina 2, dotado de vehículos de combate Pizarro.",
});
update("malaga", "cordoba-org", {
  fullDescription:
    "Es el batallón de carros de combate del Córdoba 10. Forma parte de la organización del regimiento acorazado adoptada en enero de 2016, junto al Grupo de Caballería Almansa II/10.",
  website:
    base +
    "unidades/Cordoba/brimzx_guzmanelbueno/Organizacion/RAC_N.10/index.html",
});
update("cantabria", "extremadura-org", {
  fullDescription:
    "Es el batallón de infantería mecanizada del Saboya 6. Su dotación publicada de vehículos Pizarro aporta movilidad y protección a sus unidades de infantería.",
});
update("las-navas", "extremadura-org", {
  fullDescription:
    "Es el batallón de infantería protegida del Saboya 6. La organización de la brigada describe vehículos TOA M-113 y anuncia su futura sustitución por vehículos 8×8.",
});
source(
  "tercio4-hist",
  "Galerias/Descarga_pdf/EjercitoTierra/desfiles_actos/dia_fiesta_nacional_2016/2016_historial_tercio_legion.pdf",
  "Dossier institucional 2016: Tercio 4º y X Bandera",
);
update("tercio4", "tercio4-hist", {
  history:
    "El primer Tercio Alejandro Farnesio se creó en 1950 en Villa Sanjurjo y pasó al Sáhara en 1958. Desapareció en 1976. En 1981 se constituyó de nuevo en Ronda como Tercio de Apoyo, recuperando su bandera y tradiciones. Más tarde se incorporó a la Brigada de La Legión.",
});
update("millan-astray", "tercio4-hist", {
  history:
    "La X Bandera estuvo integrada en las sucesivas organizaciones del Tercio 4º. En 1985 pasó de mecanizada a unidad de instrucción y en 1989 se transformó en bandera ligera, según el historial institucional.",
});
source(
  "principe-local",
  "unidades/Asturias/ril3/Localizacion/index.html",
  "Príncipe 3: localización y teléfono",
);
place("cabo-noval", "principe-local", {
  name: "Acuartelamiento Cabo Noval",
  municipality: "Siero",
  province: "Asturias",
  autonomousCommunity: "Principado de Asturias",
  address: "Carretera SI-4 (Noreña–Pruvia)",
  postalCode: "33510",
  notes:
    "La dirección postal de correspondencia publicada es Acuartelamiento Cabo Noval, 33071 Oviedo; se distingue de la ubicación física en Siero.",
});
update("principe3", "principe-local", {
  garrisonId: "cabo-noval",
  website: base + "unidades/Asturias/ril3/Localizacion/index.html",
});
contact("principe3", "principe-local", "+34985988000");
source(
  "farnesio-local",
  "unidades/Valladolid/farnesio12/Localizacion/index.html",
  "Farnesio 12: localización y teléfono",
);
place("el-empecinado", "farnesio-local", {
  name: "Base El Empecinado",
  municipality: "Santovenia de Pisuerga",
  province: "Valladolid",
  autonomousCommunity: "Castilla y León",
  address: "Carretera de Cabezón, km 7,4",
  postalCode: "47155",
  notes:
    "La página sitúa la base entre los términos de Santovenia y Cabezón de Pisuerga.",
});
update("farnesio12", "farnesio-local", {
  garrisonId: "el-empecinado",
  website: base + "unidades/Valladolid/farnesio12/Localizacion/index.html",
});
contact("farnesio12", "farnesio-local", "+34983459792");
source(
  "espana-local",
  "unidades/Zaragoza/rclac11/Localizacion/index.html",
  "España 11: localización y contacto",
);
update("espana11", "espana-local", {
  garrisonId: "san-jorge",
  website: base + "unidades/Zaragoza/rclac11/Localizacion/index.html",
  notes:
    "La unidad se localiza en la zona A de la Base San Jorge, carretera de Huesca km 6,5.",
});
contact("espana11", "espana-local", "+34976739471", "rc11@mde.es");
source(
  "lusitania-info",
  "unidades/Madrid/bripacii/Organizacion/RCAB_Lusitania_8.html?__locale=es",
  "Lusitania 8: historial y sede en Marines",
);
place("general-almirante", "lusitania-info", {
  name: "Base General Almirante",
  municipality: "Marines",
  province: "Valencia",
  autonomousCommunity: "Comunitat Valenciana",
});
update("lusitania", "lusitania-info", {
  creationDate: "1709-12-18",
  garrisonId: "general-almirante",
  website:
    base +
    "unidades/Madrid/bripacii/Organizacion/RCAB_Lusitania_8.html?__locale=es",
});
source(
  "zaragoza-local",
  "unidades/Madrid/bripacii/Localizacion/acto-santa-barbara.html",
  "Zaragoza 5: Santa Bárbara, central y secretaría",
);
update("zaragoza", "zaragoza-local", { garrisonId: "santa-barbara" });
contact(
  "zaragoza",
  "zaragoza-local",
  "+34968397600",
  "Secretaria_RIPAC_Zaragoza_5@mde.es",
  "Central del acuartelamiento publicada para el regimiento",
);
source(
  "lusitania-local",
  "unidades/Madrid/bripacii/Localizacion/base-gral-almirante1.html",
  "Lusitania 8: secretaría regimental y central de la base",
);
contact(
  "lusitania",
  "lusitania-local",
  "+34962745092",
  "lusitania8@et.mde.es",
  "Secretaría del regimiento",
);
place("general-almirante", "lusitania-local", { phone: "+34962745000" });
source(
  "merida-encuadre",
  "fr/unidades/Granada/madoc/Noticias/2025/11-El-combate-de-ULUS-KERT-2-Guerra-de-Chechenia-ano-2000.html",
  "MADOC (2025): Batallón Mérida I/16 del Castilla 16",
);
add(
  "merida",
  "castilla16",
  "Batallón de Infantería de Carros de Combate «Mérida» I/16",
  "merida-encuadre",
);
update("merida", "merida-encuadre", {
  fullDescription:
    "Es el batallón de carros de combate del Regimiento Acorazado Castilla 16. Su encuadramiento aparece confirmado en una publicación institucional del MADOC de agosto de 2025.",
  website:
    base +
    "fr/unidades/Granada/madoc/Noticias/2025/11-El-combate-de-ULUS-KERT-2-Guerra-de-Chechenia-ano-2000.html",
});
source(
  "montejurra-hist",
  "unidades/Navarra/rczm/Historial/montejurra.html",
  "Montejurra: antecedentes e historial del batallón",
  "La página conserva la antigua numeración II/66. El encuadramiento actual se documenta con la página de organización del América 66.",
);
update("montejurra", "montejurra-hist", {
  history:
    "Recibió el nombre Montejurra en diciembre de 1943 y recogió el historial del Regimiento Constitución 29, creado en 1812. En 1996 adoptó la numeración II/66 y en 2007 incorporó al personal del disuelto Batallón Estella III/66. La página histórica mantiene esa numeración anterior a la actual I/66.",
});
source(
  "castilla-aniversario-2018",
  "reportajes/2018/66_heroe_cumple_225_annos.html",
  "Castilla 16: 225 aniversario y trayectoria del Batallón Mérida (2018)",
  "El reportaje identifica al Mérida con la antigua numeración II/16; se prioriza la publicación del MADOC de 2025 para la numeración actual I/16.",
);
update("castilla16", "castilla-aniversario-2018", {
  creationDate: "1793-06-01",
});
update("merida", "castilla-aniversario-2018", {
  history:
    "Colaboró en la constitución del Grupo de Caballería Calatrava, incorporado al Castilla en 2015. En 2017 aportó una sección de carros a la primera rotación española de la misión de presencia avanzada de la OTAN en Letonia. El reportaje de 2018 lo identifica con su antigua numeración II/16.",
});
source(
  "bhelma4-nh90-2026",
  "actualidad/2026/09/17149-nh-90.html",
  "BHELMA IV: recepción del primer NH-90, septiembre de 2026",
);
sources.find((s) => s.id === "bhelma4-nh90-2026").publishedAt = "2026-09-24";
update("bhelma4", "bhelma4-nh90-2026", {
  equipment: [
    "NH-90: primer aparato recibido el 22 de septiembre de 2026.",
    "AS532 Cougar: sustitución progresiva prevista durante la transición al NH-90; la noticia no acredita la retirada completa de la flota.",
  ],
  mission:
    "Realiza transporte aéreo táctico, evacuación sanitaria, traslado de cargas externas y apoyo al lanzamiento paracaidista y a las unidades de operaciones especiales.",
});
// Re-running this curated import must not duplicate institutional contact entries.
for (const u of units)
  u.contacts = u.contacts.filter(
    (c, i, a) =>
      a.findIndex(
        (x) =>
          x.type === c.type && x.value === c.value && x.sourceId === c.sourceId,
      ) === i,
  );
fs.writeFileSync("src/data/units.json", JSON.stringify(units, null, 2) + "\n");
fs.writeFileSync(
  "src/data/sources.json",
  JSON.stringify(sources, null, 2) + "\n",
);
fs.writeFileSync(
  "src/data/garrisons.json",
  JSON.stringify(garrisons, null, 2) + "\n",
);
console.log(
  "Enriched",
  changed.size,
  "records;",
  units.length,
  "nodes;",
  sources.length,
  "sources;",
  garrisons.length,
  "garrisons",
);
