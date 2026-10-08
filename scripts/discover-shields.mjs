import fs from "node:fs";
const url =
  "https://commons.wikimedia.org/w/api.php?action=parse&page=Coats_of_arms_of_Spain&prop=images&format=json";
const r = await fetch(url);
if (!r.ok) throw Error(r.status);
const data = await r.json();
fs.writeFileSync(
  "reports/research/commons-gallery.json",
  JSON.stringify(data, null, 2),
);
console.log(
  data.parse.images
    .filter((s) => /Regiment|Battalion|Bandera|Tercio|Helicopter/.test(s))
    .join("\n"),
);
