import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Home,
  Network,
  ListTree,
  Search,
  MapPinned,
  Info,
  Menu,
  X,
  ExternalLink,
  Share2,
  ArrowLeft,
  Check,
  MapPin,
  Download,
  Sun,
  Moon,
  Monitor,
  ChevronRight,
  Building2,
  Clock,
  SlidersHorizontal,
} from "lucide-react";

import { createRepository, isStructural } from "../services/repository";
import { createPreferences } from "../services/storage";
import { Shield } from "../components/Shield";
import { Tree } from "../components/Tree";
import { downloadData } from "../utils/export";
import type { Dataset, Filters, Unit } from "../types";
const Graph = lazy(() => import("./OrganizationGraph"));
const Geo = lazy(() => import("./GeographicMap"));

const prefs = createPreferences({
  getItem: (k) => localStorage.getItem(k),
  setItem: (k, v) => localStorage.setItem(k, v),
});
const nav = [
  ["inicio", "Inicio", Home],
  ["organigrama", "Organigrama", Network],
  ["arbol", "Árbol", ListTree],
  ["buscar", "Buscar unidades", Search],
  ["mapa", "Mapa y bases", MapPinned],
  ["informacion", "Información", Info],
] as const;
const branches: Record<string, string> = {
  cg: "Cuartel General",
  fuerza: "Fuerza",
  apoyo: "Apoyo a la Fuerza",
  et: "Ejército de Tierra",
};
const statusNames: Record<string, string> = {
  active: "Activa",
  historical: "Histórica",
  disbanded: "Disuelta",
  transformed: "Transformada",
  unknown: "Sin confirmar",
};
const date = (v?: string) =>
  v
    ? new Intl.DateTimeFormat("es-ES", {
        timeZone: "UTC",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(v))
    : "Pendiente";
const readRoute = () => {
  try {
    return decodeURIComponent(location.hash.slice(2) || "inicio").split("/");
  } catch {
    return ["inicio"];
  }
};
export function MilitaryOrganization({ dataset }: { dataset: Dataset }) {
  const repo = useMemo(() => createRepository(dataset), [dataset]);
  const [route, setRoute] = useState(readRoute);
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);
  const validUnitIds = (ids: string[]) =>
    ids.filter(
      (id) => !!repo.getUnitById(id) && !isStructural(repo.getUnitById(id)),
    );
  const [recent, setRecent] = useState(() =>
    validUnitIds(prefs.read("recent")),
  );
  const [notice, setNotice] = useState("");
  const [theme, setTheme] = useState(() => prefs.read("theme")[0] || "auto");
  const [online, setOnline] = useState(navigator.onLine);
  const navigate = useCallback((path: string) => {
    location.hash = "/" + path;
    setMenu(false);
    window.scrollTo(0, 0);
  }, []);
  const open = useCallback(
    (id: string) =>
      navigate(
        (isStructural(repo.getUnitById(id)) ? "estructura/" : "unidad/") + id,
      ),
    [navigate, repo],
  );
  const openGarrison = useCallback(
    (id: string) => navigate("base/" + id),
    [navigate],
  );
  useEffect(() => {
    const onHash = () => setRoute(readRoute());
    window.addEventListener("hashchange", onHash);
    const state = () => setOnline(navigator.onLine);
    window.addEventListener("online", state);
    window.addEventListener("offline", state);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("online", state);
      window.removeEventListener("offline", state);
    };
  }, []);
  const [screen, id] = route;
  useEffect(() => {
    if (
      screen === "unidad" &&
      repo.getUnitById(id) &&
      !isStructural(repo.getUnitById(id))
    ) {
      prefs.visit(id);
      setRecent(validUnitIds(prefs.read("recent")));
    }
  }, [screen, id, repo]);
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const apply = () =>
      (document.documentElement.dataset.theme =
        theme === "auto" ? (media.matches ? "dark" : "light") : theme);
    apply();
    media.addEventListener("change", apply);
    prefs.write("theme", [theme]);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(t);
  }, [notice]);
  const results = useMemo(
    () => repo.filterUnits(repo.searchUnits(query), filters),
    [query, filters, repo],
  );
  const unit = repo.getUnitById(id);
  const garrison = repo.getGarrisonById(id);
  const sourceList = (ids: string[]) => (
    <ul className="sources">
      {ids.map((sid) => {
        const s = repo.getSourceById(sid);
        return s ? (
          <li key={sid}>
            <a href={s.url} target="_blank" rel="noreferrer">
              {s.title} <ExternalLink size={13} />
            </a>
            <small>
              {s.publisher} · Consultada {date(s.retrievedAt)}
            </small>
            {s.notes && <p>{s.notes}</p>}
          </li>
        ) : null;
      })}
    </ul>
  );
  const cards = (items: Unit[]) => (
    <div className="unit-list">
      {items.map((u) =>
        isStructural(u) ? (
          <button
            key={u.id}
            className="structure-link"
            onClick={() => open(u.id)}
          >
            <Network size={20} />
            <span>
              <small>Estructura de navegación</small>
              <strong>{u.name}</strong>
            </span>
            <ChevronRight size={18} />
          </button>
        ) : (
          <article key={u.id} className="unit-card">
            <button className="unit-main" onClick={() => open(u.id)}>
              <Shield unit={u} />
              <span>
                <small>
                  {u.abbreviation || u.type} · {branches[u.branch]}
                </small>
                <strong>{u.name}</strong>
                <span className="muted">
                  {repo.getGarrisonById(u.garrisonId || "")?.municipality ||
                    "Ubicación pendiente"}
                  {repo.getParent(u.id)
                    ? ` · ${repo.getParent(u.id)!.shortName || repo.getParent(u.id)!.name}`
                    : ""}
                </span>
              </span>
              <ChevronRight size={18} />
            </button>
          </article>
        ),
      )}
    </div>
  );
  const share = async (u: Unit) => {
    const url = new URL("/#/unidad/" + u.id, location.href).href;
    try {
      if (navigator.share)
        await navigator.share({ title: u.name, text: u.name, url });
      else {
        await navigator.clipboard.writeText(url);
        setNotice("Enlace de la unidad copiado.");
      }
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError"))
        setNotice("No se pudo compartir. Copia la dirección de esta página.");
    }
  };
  const field = (label: string, value?: string) => (
    <div>
      <dt>{label}</dt>
      <dd>{value || "No consta información pública suficiente"}</dd>
    </div>
  );
  const detail = (u: Unit) => {
    const g = repo.getGarrisonById(u.garrisonId || "");
    return (
      <>
        <div className="breadcrumb" aria-label="Ruta jerárquica">
          {repo.getUnitPath(u.id).map((p) => (
            <button key={p.id} onClick={() => open(p.id)}>
              {p.abbreviation || p.name}
              <ChevronRight size={13} />
            </button>
          ))}
        </div>
        <div className="detail-header">
          <Shield key={u.id} unit={u} large />
          <div>
            <span className="eyebrow">
              {u.type} · {branches[u.branch]}
            </span>
            <h1>{u.name}</h1>
            <span className="badge">
              <Check size={14} />
              {u.verificationStatus === "official"
                ? "Verificado con fuente oficial"
                : u.verificationStatus === "secondary"
                  ? "Fuente secundaria"
                  : "Pendiente de verificar"}
            </span>
            <span className="badge neutral">{statusNames[u.status]}</span>
          </div>
        </div>
        <div className="actions">
          <button
            className="primary"
            onClick={() => navigate("organigrama/" + u.id)}
          >
            <Network size={17} />
            Ver en el organigrama
          </button>
          <button onClick={() => share(u)}>
            <Share2 size={17} />
            Compartir
          </button>
        </div>
        <div className="detail-grid">
          <div>
            <section className="panel">
              <h2>Misión y función</h2>
              <p>
                {u.mission ||
                  "No consta información pública suficiente para describir su misión particular."}
              </p>
              {u.fullDescription && <p>{u.fullDescription}</p>}
              <dl className="facts">
                {field("Especialidad", u.specialty)}
                {field("Abreviatura", u.abbreviation)}
              </dl>
              {u.notes && (
                <p className="note">
                  <Info size={17} />
                  {u.notes}
                </p>
              )}
            </section>
            <section className="panel">
              <h2>
                {isStructural(repo.getParent(u.id))
                  ? "Encuadre en la estructura"
                  : "Depende de"}
              </h2>
              {repo.getParent(u.id) ? (
                cards([repo.getParent(u.id)!])
              ) : (
                <p>Organización raíz del atlas.</p>
              )}
              <p className="muted">
                La dependencia orgánica describe el encuadre administrativo. La
                cadena operativa puede ser diferente.
              </p>
              <h2>Dependen de esta unidad</h2>
              {repo.getChildren(u.id).length ? (
                cards(repo.getChildren(u.id))
              ) : (
                <p>
                  No hay subordinadas incorporadas al atlas. Esto no implica que
                  no existan.
                </p>
              )}
            </section>
            <section className="panel">
              <h2>Historia y características</h2>
              <p>
                {u.history || "Resumen histórico pendiente de documentación."}
              </p>
              <dl className="facts">
                {field(
                  "Creación",
                  u.creationDate ? date(u.creationDate) : undefined,
                )}
                {field("Lema", u.motto)}
                {field("Patrón", u.patron)}
                {field("Material publicado", u.equipment?.join(", "))}
                {u.validFrom && field("Vigente desde", date(u.validFrom))}
                {u.validUntil && field("Vigente hasta", date(u.validUntil))}
              </dl>
              {u.previousUnitId && (
                <button onClick={() => open(u.previousUnitId!)}>
                  Ver predecesora
                </button>
              )}
              {u.successorUnitId && (
                <button onClick={() => open(u.successorUnitId!)}>
                  Ver sucesora
                </button>
              )}
            </section>
          </div>
          <aside>
            <section className="panel">
              <h2>
                <MapPin size={20} />
                Ubicación
              </h2>
              {g ? (
                <>
                  <button
                    className="text-link"
                    onClick={() => openGarrison(g.id)}
                  >
                    {g.name}
                  </button>
                  <p>
                    {g.municipality} · {g.province}
                  </p>
                  <p className="muted">{g.address}</p>
                  {g.phone &&
                    !u.contacts.some(
                      (c) =>
                        c.type === "phone" &&
                        c.value.replace(/\s/g, "") ===
                          g.phone?.replace(/\s/g, ""),
                    ) && (
                      <p>
                        <small>Central de la instalación</small>
                        <a href={`tel:${g.phone.replace(/\s/g, "")}`}>
                          {g.phone}
                        </a>
                      </p>
                    )}
                </>
              ) : (
                <p>No consta información pública suficiente.</p>
              )}
              <h2>Contacto institucional</h2>
              {!u.phone && <p>Teléfono propio de la unidad no documentado.</p>}
              {u.contacts.map((c, i) => (
                <p key={i}>
                  <small>{c.label || "Correo institucional"}</small>
                  <a
                    href={
                      (c.type === "phone" ? "tel:" : "mailto:") +
                      c.value.replace(c.type === "phone" ? /\s/g : /$^/g, "")
                    }
                  >
                    {c.value}
                  </a>
                </p>
              ))}
              {u.website && (
                <a
                  className="button-link"
                  href={u.website}
                  target="_blank"
                  rel="noreferrer"
                >
                  Web oficial <ExternalLink size={16} />
                </a>
              )}
            </section>
            <section className="panel">
              <h2>Escudo</h2>
              {u.shield ? (
                <>
                  <a
                    href={u.shield.localAsset || u.shield.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Ampliar escudo"
                  >
                    <Shield unit={u} large />
                  </a>
                  <p>{u.shield.attribution}</p>
                  <a href={u.shield.sourceUrl} target="_blank" rel="noreferrer">
                    Procedencia
                  </a>
                  <p>
                    <a href={u.shield.licenseUrl || u.shield.sourceUrl}>
                      {u.shield.license}
                    </a>
                  </p>
                </>
              ) : (
                <p>
                  Sin imagen con procedencia y permiso de reutilización
                  incorporados.
                </p>
              )}
            </section>
            <section className="panel">
              <h2>Fuentes y verificación</h2>
              <p>
                Última comprobación: <strong>{date(u.lastVerified)}</strong>
              </p>
              <p className="muted">
                El estado de verificación corresponde a los campos documentados.
                Los campos vacíos siguen pendientes.
              </p>
              {sourceList(u.sources)}
              <details>
                <summary>Trazabilidad por campo</summary>
                {Object.entries(u.fieldSources).map(([key, e]) => (
                  <p key={key}>
                    <strong>{key}</strong>:{" "}
                    {e.sourceIds
                      .map((s) => repo.getSourceById(s)?.title || s)
                      .join(" · ")}{" "}
                    {e.notes}
                  </p>
                ))}
              </details>
            </section>
          </aside>
        </div>
      </>
    );
  };
  return (
    <div className="app">
      <a
        className="skip"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
        Saltar al contenido
      </a>
      <aside className={`sidebar ${menu ? "is-open" : ""}`}>
        <a className="brand" href="#/inicio">
          <img src="/icon.svg" alt="" />
          <span>
            ATLAS TIERRA<small>Organización del Ejército</small>
          </span>
        </a>
        <button
          className="close-menu icon-button"
          aria-label="Cerrar menú"
          onClick={() => setMenu(false)}
        >
          <X />
        </button>
        <div className="sidebar-label">EXPLORAR</div>
        <nav aria-label="Navegación principal">
          {nav.map(([path, label, Icon]) => (
            <a
              key={path}
              href={"#/" + path}
              onClick={() => setMenu(false)}
              className={screen === path ? "active" : ""}
              aria-current={screen === path ? "page" : undefined}
            >
              <Icon size={20} />
              {label}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="eyebrow">UN ATLAS ABIERTO AL CONOCIMIENTO</span>
          <p>
            Fuentes públicas.
            <br />
            Dependencias documentadas.
          </p>
          <small>
            Proyecto educativo independiente.
            <br />
            No es una web oficial.
          </small>
          <div className="theme" aria-label="Tema visual">
            {[
              ["light", Sun, "Claro"],
              ["dark", Moon, "Oscuro"],
              ["auto", Monitor, "Sistema"],
            ].map(([value, Icon, label]) => {
              const I = Icon as typeof Sun;
              return (
                <button
                  key={String(value)}
                  aria-label={`Tema ${label}`}
                  aria-pressed={theme === value}
                  onClick={() => setTheme(String(value))}
                >
                  <I size={17} />
                </button>
              );
            })}
          </div>
        </div>
      </aside>
      {menu && (
        <button
          className="scrim"
          aria-label="Cerrar navegación"
          onClick={() => setMenu(false)}
        />
      )}
      <div className="workspace">
        <header className="topbar">
          <button
            className="menu-button icon-button"
            aria-label="Abrir menú"
            onClick={() => setMenu(true)}
          >
            <Menu />
          </button>
          <span className="top-context">
            FUERZAS ARMADAS <span>/</span> <strong>Ejército de Tierra</strong>
          </span>
          <span className="edition">Consulta: 08 OCT 2026</span>
        </header>
        <main id="main" tabIndex={-1}>
          {!online && (
            <p className="offline" role="status">
              Sin conexión · Puedes consultar el atlas guardado. Los enlaces
              externos y el mapa base requieren internet.
            </p>
          )}
          {screen === "inicio" && (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">
                    ATLAS DE ORGANIZACIÓN · ESPAÑA
                  </span>
                  <h1>
                    Entender la estructura.
                    <br />
                    <span>Explorar sus unidades.</span>
                  </h1>
                  <p>
                    Recorre el Ejército de Tierra, de sus grandes estructuras a
                    cada unidad documentada.
                  </p>
                </div>
                <div className="edition-card">
                  <Network size={28} />
                  <strong>{repo.catalogUnits.length}</strong>
                  <span>unidades y órganos</span>
                  <small>{dataset.sources.length} fuentes documentales</small>
                </div>
              </div>
              <form
                className="searchbox"
                onSubmit={(e) => {
                  e.preventDefault();
                  setPage(1);
                  navigate("buscar");
                }}
              >
                <Search size={22} />
                <input
                  aria-label="Buscar unidad, base o localidad"
                  placeholder="Busca una unidad, sigla, base o localidad…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit">Buscar</button>
              </form>
              <div className="section-heading">
                <h2>Tres estructuras, un Ejército</h2>
                <button className="text-link" onClick={() => navigate("arbol")}>
                  Explorar como árbol
                </button>
              </div>
              <div className="branch-grid">
                {["cg", "fuerza", "apoyo"].map((b, i) => (
                  <button
                    key={b}
                    className={`branch-card branch-${b}`}
                    onClick={() => navigate("estructura/" + b)}
                  >
                    <span className="branch-number">0{i + 1}</span>
                    <Network size={28} />
                    <h3>{branches[b]}</h3>
                    <p>
                      {b === "cg"
                        ? "Dirección, planeamiento y asistencia al mando."
                        : b === "fuerza"
                          ? "Unidades de combate y capacidades de apoyo."
                          : "Personal, formación, logística e infraestructura."}
                    </p>
                    <small>
                      {repo.getDescendants(b).length} registros en esta rama{" "}
                      <ChevronRight size={16} />
                    </small>
                  </button>
                ))}
              </div>
              <div className="home-bottom">
                <section>
                  <div className="section-heading">
                    <h2>Unidades destacadas</h2>
                    <button
                      className="text-link"
                      onClick={() => navigate("buscar")}
                    >
                      Ver todas
                    </button>
                  </div>
                  {cards(
                    ["castillejos", "bri12", "rac61", "ige"].map((x) =>
                      repo.getUnitById(x)!,
                    ),
                  )}
                </section>
                <section className="discover">
                  <span className="eyebrow">OTRA FORMA DE EXPLORAR</span>
                  <MapPinned size={36} />
                  <h2>
                    El territorio también
                    <br />
                    cuenta la estructura.
                  </h2>
                  <p>
                    Consulta bases y acuartelamientos, sus fuentes y las
                    unidades registradas en cada instalación.
                  </p>
                  <button onClick={() => navigate("mapa")}>
                    Abrir atlas geográfico
                  </button>
                  <small>
                    {dataset.garrisons.length} instalaciones documentadas
                  </small>
                </section>
              </div>
              <section>
                <h2>
                  <Clock size={20} />
                  Consultadas recientemente
                </h2>
                {recent.length ? (
                  cards(
                    recent
                      .map((x) => repo.getUnitById(x))
                      .filter((u): u is Unit => !!u),
                  )
                ) : (
                  <p className="muted">
                    Las unidades que abras aparecerán aquí, solo en este
                    dispositivo.
                  </p>
                )}
              </section>
              <section>
                <h2>Explorar por especialidad</h2>
                <div className="chips">
                  {[
                    ...new Set(
                      repo.catalogUnits.map((u) => u.specialty).filter(Boolean),
                    ),
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setQuery("");
                        setFilters({ specialty: s });
                        setPage(1);
                        navigate("buscar");
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}
          {screen === "buscar" && (
            <>
              <PageTitle
                eyebrow="DIRECTORIO PÚBLICO"
                title="Buscar unidades"
                description="Por nombre, siglas, especialidad o ubicación. La búsqueda ignora tildes y admite pequeñas diferencias."
              />
              <div className="searchbox">
                <Search />
                <input
                  aria-label="Buscar en el directorio"
                  placeholder="Prueba con RAC 61, DIACU, alcazar toledo…"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                />
                {query && (
                  <button
                    aria-label="Limpiar búsqueda"
                    onClick={() => {
                      setQuery("");
                      setPage(1);
                    }}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              <details className="filter-panel" open>
                <summary>
                  <SlidersHorizontal size={18} />
                  Filtrar resultados
                </summary>
                <div className="filters">
                  {(
                    [
                      "branch",
                      "type",
                      "specialty",
                      "autonomousCommunity",
                      "province",
                      "municipality",
                      "status",
                    ] as const
                  ).map((key) => {
                    const labels = {
                      branch: "Estructura",
                      type: "Tipo",
                      specialty: "Especialidad",
                      autonomousCommunity: "Comunidad autónoma",
                      province: "Provincia",
                      municipality: "Municipio",
                      status: "Estado",
                    };
                    const values =
                      key === "branch"
                        ? ["cg", "fuerza", "apoyo"]
                        : key === "status"
                          ? Object.keys(statusNames)
                          : [
                              ...new Set(
                                key === "province" ||
                                  key === "municipality" ||
                                  key === "autonomousCommunity"
                                  ? dataset.garrisons
                                      .map((g) => g[key])
                                      .filter(Boolean)
                                  : repo.catalogUnits
                                      .map((u) => u[key])
                                      .filter(Boolean),
                              ),
                            ].sort();
                    return (
                      <label key={key}>
                        {labels[key]}
                        <select
                          aria-label={labels[key]}
                          value={filters[key] || ""}
                          onChange={(e) => {
                            setFilters({ ...filters, [key]: e.target.value });
                            setPage(1);
                          }}
                        >
                          <option value="">Todos</option>
                          {values.map((v) => (
                            <option key={v} value={v}>
                              {key === "branch"
                                ? branches[v!]
                                : key === "status"
                                  ? statusNames[v!]
                                  : v}
                            </option>
                          ))}
                        </select>
                      </label>
                    );
                  })}
                  <button
                    onClick={() => {
                      setFilters({});
                      setQuery("");
                      setPage(1);
                    }}
                  >
                    Restablecer
                  </button>
                </div>
              </details>
              <div className="section-heading">
                <p aria-live="polite">
                  <strong>{results.length}</strong> resultados
                </p>
                <small>24 registros por página</small>
              </div>
              {results.length ? (
                cards(results.slice((page - 1) * 24, page * 24))
              ) : (
                <div className="empty">
                  <Search size={32} />
                  <h2>No hay coincidencias</h2>
                  <p>Prueba otra palabra o elimina algún filtro.</p>
                </div>
              )}
              <div className="pagination">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Anterior
                </button>
                <span>
                  Página {page} de {Math.max(1, Math.ceil(results.length / 24))}
                </span>
                <button
                  disabled={page * 24 >= results.length}
                  onClick={() => setPage(page + 1)}
                >
                  Siguiente
                </button>
              </div>
            </>
          )}
          {screen === "organigrama" && (
            <>
              <PageTitle
                eyebrow="DEPENDENCIAS ORGÁNICAS"
                title="El Ejército, conectado"
                description="Despliega con + y pulsa el nombre de una unidad para consultar su ficha."
              />
              <div className="panel graph-panel">
                <Suspense fallback={<p>Cargando organigrama…</p>}>
                  <Graph
                    key={id || "et"}
                    repo={repo}
                    target={repo.getUnitById(id) ? id : "et"}
                    open={open}
                  />
                </Suspense>
              </div>
              <p className="muted">
                Los puentes «Cuartel General», «Fuerza» y «Apoyo a la Fuerza»
                conectan las ramas de la organización. Se distinguen de las
                tarjetas de unidades y no se contabilizan como tales.
              </p>
            </>
          )}
          {screen === "arbol" && (
            <>
              <PageTitle
                eyebrow="EXPLORADOR JERÁRQUICO"
                title="Una estructura, nivel a nivel"
                description="Una alternativa al mapa mental, accesible con teclado y cómoda en pantallas pequeñas."
              />
              <section className="panel">
                <Tree repo={repo} open={open} />
              </section>
            </>
          )}
          {(screen === "unidad" || screen === "estructura") &&
            (unit ? (
              isStructural(unit) ? (
                <>
                  <PageTitle
                    eyebrow="ESTRUCTURA DE NAVEGACIÓN"
                    title={unit.name}
                    description={
                      unit.mission ||
                      "Explora los órganos y unidades de esta estructura."
                    }
                  />
                  <p className="note">
                    <Network size={20} />
                    Este elemento sirve de puente en la organización; no es una
                    ficha de unidad.
                  </p>
                  <div className="actions">
                    <button onClick={() => navigate("organigrama/" + unit.id)}>
                      <Network size={18} />
                      Ver estructura en el organigrama
                    </button>
                  </div>
                  <section className="panel">
                    <h2>Explorar esta estructura</h2>
                    {cards(repo.getChildren(unit.id))}
                  </section>
                  <section className="panel">
                    <h2>Fuentes de la estructura</h2>
                    {sourceList(unit.sources)}
                  </section>
                </>
              ) : (
                detail(unit)
              )
            ) : (
              <NotFound navigate={navigate} />
            ))}
          {screen === "mapa" && (
            <>
              <PageTitle
                eyebrow="ATLAS GEOGRÁFICO"
                title="Bases y acuartelamientos"
                description="Instalaciones documentadas con información pública. Solo aparecen marcadores cuando hay coordenadas contrastadas."
              />
              <Suspense fallback={<p>Cargando mapa…</p>}>
                <Geo repo={repo} openGarrison={openGarrison} />
              </Suspense>
              <div className="garrison-grid">
                {dataset.garrisons.map((g) => (
                  <button
                    className="panel garrison-card"
                    key={g.id}
                    onClick={() => openGarrison(g.id)}
                  >
                    <Building2 />
                    <h3>{g.name}</h3>
                    <p>
                      {g.municipality} · {g.province}
                    </p>
                    <small>
                      {repo.getUnitsByGarrison(g.id).length} unidades
                      registradas
                      {g.latitude === undefined
                        ? " · Sin coordenadas verificadas"
                        : ""}
                    </small>
                  </button>
                ))}
              </div>
            </>
          )}
          {screen === "base" &&
            (garrison ? (
              <>
                <PageTitle
                  eyebrow={garrison.type || "INSTALACIÓN"}
                  title={garrison.name}
                  description={`${garrison.municipality || ""} · ${garrison.province || ""}`}
                />
                <div className="detail-grid">
                  <section className="panel">
                    <dl className="facts">
                      {field("Dirección", garrison.address)}
                      {field("Código postal", garrison.postalCode)}
                      {field(
                        "Comunidad autónoma",
                        garrison.autonomousCommunity,
                      )}
                    </dl>
                    <p>{garrison.phone || "No consta teléfono público"}</p>
                    {garrison.notes && <p className="note">{garrison.notes}</p>}
                    <h2>Unidades ubicadas aquí</h2>
                    {cards(repo.getUnitsByGarrison(garrison.id))}
                    <h2>Fuentes</h2>
                    {sourceList(garrison.sources)}
                    <p>Última comprobación: {date(garrison.lastVerified)}</p>
                  </section>
                  <section>
                    {garrison.latitude !== undefined ? (
                      <Suspense fallback={<p>Cargando mapa…</p>}>
                        <Geo
                          repo={repo}
                          openGarrison={openGarrison}
                          only={id}
                        />
                      </Suspense>
                    ) : (
                      <p className="panel">
                        No constan coordenadas públicas verificadas en este
                        atlas.
                      </p>
                    )}
                  </section>
                </div>
              </>
            ) : (
              <NotFound navigate={navigate} />
            ))}
          {screen === "informacion" && (
            <>
              <PageTitle
                eyebrow="PROCEDENCIA Y MÉTODO"
                title="Un atlas con fuentes"
                description="Proyecto educativo independiente, sin vinculación oficial con el Ministerio de Defensa."
              />
              <div className="detail-grid">
                <div>
                  <section className="panel">
                    <h2>Qué puedes consultar</h2>
                    <p>
                      Estructura pública del Ejército de Tierra, unidades,
                      instalaciones y contactos institucionales. El conjunto
                      inicial es parcial: no representa un inventario exhaustivo
                      ni una certificación de vigencia de toda la organización.
                    </p>
                    <p>
                      Consulta documental: 8 de octubre de 2026. La fecha indica
                      cuándo se revisó una fuente; no implica que el organismo
                      haya actualizado su página ese día.
                    </p>
                    <h2>Cómo se verifican los datos</h2>
                    <p>
                      Se priorizan el BOE consolidado y las páginas del Ejército
                      de Tierra. Las discrepancias se conservan en observaciones
                      y en la trazabilidad de cada campo. No se confunde la
                      dependencia orgánica con la operativa. Los datos no
                      encontrados se dejan vacíos.
                    </p>
                    <p>
                      Las coordenadas proceden de mapas o cifras publicados. No
                      se representan ubicaciones deducidas ni se incluye
                      información de accesos o procedimientos internos.
                    </p>
                    <h2>Privacidad y uso sin conexión</h2>
                    <p>
                      Las consultas recientes y el tema se guardan solo en este
                      dispositivo. No hay cuentas ni analítica. El mapa solicita
                      teselas a OpenStreetMap al abrirlo. Las fichas y datos
                      esenciales se guardan para uso sin conexión tras la
                      primera carga completa.
                    </p>
                    <h2>Instalación</h2>
                    <p>
                      En Android y navegadores compatibles, utiliza «Instalar
                      aplicación» en el menú del navegador. En iPhone: Compartir
                      → Añadir a pantalla de inicio. Se necesita HTTPS o
                      localhost.
                    </p>
                    <h2>Exportar datos</h2>
                    <div className="actions">
                      <button onClick={() => downloadData(dataset, "json")}>
                        <Download size={17} />
                        JSON completo
                      </button>
                      <button onClick={() => downloadData(dataset, "csv")}>
                        <Download size={17} />
                        CSV de unidades
                      </button>
                    </div>
                  </section>
                </div>
                <aside className="panel">
                  <h2>Bibliografía y fuentes</h2>
                  {sourceList(dataset.sources.map((s) => s.id))}
                </aside>
              </div>
            </>
          )}
          {![
            "inicio",
            "buscar",
            "organigrama",
            "arbol",
            "unidad",
            "estructura",
            "mapa",
            "base",
            "informacion",
          ].includes(screen) && <NotFound navigate={navigate} />}
        </main>
        <footer>
          ATLAS TIERRA{" "}
          <span>
            Información pública · Finalidad educativa · Cobertura inicial
            parcial
          </span>
        </footer>
      </div>
      {notice && (
        <div role="status" className="toast">
          {notice}
        </div>
      )}
    </div>
  );
}
function PageTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-title">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
function NotFound({ navigate }: { navigate: (path: string) => void }) {
  return (
    <div className="empty">
      <h1>No se encuentra esta ficha</h1>
      <p>El enlace no corresponde a un registro del atlas.</p>
      <button onClick={() => navigate("inicio")}>
        <ArrowLeft size={17} />
        Volver al inicio
      </button>
    </div>
  );
}
