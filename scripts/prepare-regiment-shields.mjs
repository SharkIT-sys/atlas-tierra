import fs from "node:fs";
const images = JSON.parse(
  fs.readFileSync("reports/research/commons-gallery.json"),
).parse.images;
const match = {
  asturias: "31st_Mechanized_Infantry_Regiment_Asturias.svg",
  covadonga: "1st-31_Mechanized_Infantry_Battalion_Covadonga.svg",
  uadras: "2nd-31_Protected_Infantry_Battalion_Uad_Ras.svg",
  bz12: "12th_Military_Engineering_Battalion.svg",
  bcg12: "12th_Brigade_Guadarrama_Headquarters_Battalion.svg",
  napoles: "4th_Parachute_Infantry_Regiment_Napoles.svg",
  zaragoza: "5th_Infantry_Regiment_Zaragoza.svg",
  lusitania: "8th_Light_Armoured_Cavalry_Regiment_Lusitania.svg",
  galicia64: "64th_Regiment_of_Mountain_Hunters_Galicia.svg",
  america66: "66th_Infantry_Regiment_America.svg",
  bhela1: "1st_Attack_Helicopter_Battalion.svg",
  bheleme2: "2nd_Emergency_Helicopter_Battalion.svg",
  bhelma3: "3rd_Maneuver_Helicopter_Battalion.svg",
  bhelma4: "4th_Maneuver_Helicopter_Battalion.svg",
  bheltra5: "5th_Transport_Helicopter_Battalion.svg",
  tercio3: "3rd_Spanish_Legion_Tercio_Don_Juan_de_Austria.svg",
  tercio4: "4th_Spanish_Legion_Tercio_Alexander_Farnese.svg",
  valenzuela: "7th_Spanish_Legion_Flag_Valenzuela.svg",
  colon: "8th_Spanish_Legion_Flag_Colón.svg",
  "millan-astray": "10th_Spanish_Legion_Flag_Millán_Astray.svg",
  bcg1: "1st_Brigade_Aragón_Headquarters_Battalion.svg",
  pavia4: "4th_Armored_Regiment_Pavia_(2015).svg",
  raca20: "20th_Field_Artillery_Regiment.svg",
  arapiles62: "62nd_Infantry_Regiment_Arapiles.svg",
  barcelona63: "63rd_Infantry_Regiment_Barcelona.svg",
  bz1: "the_1st_Engineer_Battalion.svg",
  flandes: "1st-4_Tank_Infantry_Battalion_Flandes.svg",
  cataluna: "1st-63_Motorized_Infantry_Battalion_Cataluña.svg",
  bcg7: "7th_Brigade_Galicia_Headquarters_Battalion.svg",
  principe3: "3rd_Infantry_Regiment_Príncipe.svg",
  isabel29:
    "29th_Light_Infantry_Regiment_Isabel_la_Católica_(Ornamented_variant).svg",
  farnesio12: "12th_Cavalry_Regiment_Farnesio.svg",
  bz7: "7th_Military_Engineering_Battalion.svg",
  "san-quintin": "1st-3_Protected_Infantry_Battalion_San_Quintín.svg",
  toledo: "2nd-3_Protected_Infantry_Battalion_Toledo.svg",
  zamora: "1st-29_Protected_Infantry_Battalion_Zamora.svg",
  bcg10: "10th_Brigade_Guzmán_el_Bueno_Headquarters_Battalion.svg",
  reina2: "2nd_Infantry_Regiment_La_Reina.svg",
  garellano45: "45th_Infantry_Regiment_Garellano.svg",
  cordoba10: "10th_Armored_Regiment_Córdoba_(2015).svg",
  bz10: "10th_Military_Engineering_Battalion.svg",
  princesa: "1st-2_Protected_Infantry_Battalion_Princesa.svg",
  lepanto: "2nd-2_Mechanized_Infantry_Battalion_Lepanto.svg",
  malaga: "1st-10_Tank_Infantry_Battalion_Málaga.svg",
  sicilia67: "67th_Infantry_Regiment.svg",
  saboya6: "6th_Infantry_Regiment_Saboya.svg",
  castilla16: "16th_Armored_Regiment_Castilla_(2015).svg",
  bz11: "11th_Military_Engineering_Battalion.svg",
  bcg11: "11th_Brigade_Extremadura_Headquarters_Battalion.svg",
  legazpi: "1st-67_Motorized_Infantry_Battalion_Legazpi.svg",
  cantabria: "1st-6_Mechanized_Infantry_Battalion_Cantabria.svg",
  "las-navas": "2nd-6_Protected_Infantry_Battalion_Las_Navas.svg",
  bcg2: "2nd_Spanish_Legion_Brigade_Headquarters_Flag.svg",
  bz2: "2nd_Spanish_Legion_Military_Engineering_Batalion.svg",
  bcg6: "BRIPAC_Headquarters_Battalion.svg",
  bz6: "6th_Parachute_Engineer_Battalion.svg",
  "roger-flor": "1st-4_Parachute_Infantry_Flag_Roger_de_Flor.svg",
  bcg16: "16th_Brigade_Canarias_Headquarters_Battalion.svg",
  soria9: "9th_Infantry_Regiment_Soria.svg",
  tenerife49: "49th_Infantry_Regiment_Tenerife.svg",
  canarias50: "50th_Infantry_Regiment_Canarias.svg",
  raca93: "93rd_Field_Artillery_Regiment.svg",
  bz16: "16th_Military_Engineering_Battalion.svg",
  fuerteventura: "1st-9_Protected_Infantry_Battalion_Fuerteventura.svg",
  cerinola: "1st-50_Protected_Infantry_Battalion_Ceriñola.svg",
  espana11: "11th_Light_Armored_Cavalry_Regiment_España.svg",
};
const targets = Object.entries(match).map(([id, end]) => {
  const a = images.filter((s) => s.startsWith("Coat_of_") && s.endsWith(end));
  if (a.length !== 1) throw Error(id + " " + a);
  return [id, a[0].replaceAll("_", " ")];
});
fs.writeFileSync(
  "reports/research/regiment-shield-targets.json",
  JSON.stringify(targets, null, 2),
);
const pages = [];
for (let i = 0; i < targets.length; i += 40) {
  if (i) await new Promise((r) => setTimeout(r, 10000));
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.search = new URLSearchParams({
    action: "query",
    format: "json",
    prop: "imageinfo",
    iiprop: "url|sha1|extmetadata",
    titles: targets
      .slice(i, i + 40)
      .map((t) => "File:" + t[1])
      .join("|"),
  });
  const r = await fetch(url);
  if (!r.ok) throw Error(r.status + "; stopped");
  const d = await r.json();
  pages.push(...Object.values(d.query.pages));
}
fs.writeFileSync(
  "reports/research/regiment-shield-metadata.json",
  JSON.stringify(
    { query: { pages: Object.fromEntries(pages.map((p) => [p.pageid, p])) } },
    null,
    2,
  ),
);
for (const p of pages)
  console.log(p.title, p.imageinfo?.[0]?.extmetadata?.LicenseShortName?.value);
