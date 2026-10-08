import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Repository } from "../services/repository";
export default function GeographicMap({
  repo,
  openGarrison,
  only,
}: {
  repo: Repository;
  openGarrison: (id: string) => void;
  only?: string;
}) {
  const locations = repo.data.garrisons.filter(
    (g) =>
      (!only || g.id === only) &&
      g.latitude !== undefined &&
      g.longitude !== undefined,
  );
  return (
    <>
      <div className="geo-map">
        <MapContainer
          center={
            only && locations[0]
              ? [locations[0].latitude!, locations[0].longitude!]
              : [39.7, -3.6]
          }
          zoom={only ? 13 : 6}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {locations.map((g) => (
            <CircleMarker
              key={g.id}
              center={[g.latitude!, g.longitude!]}
              radius={10}
              pathOptions={{
                color: "#fff",
                fillColor: "#316451",
                fillOpacity: 1,
                weight: 3,
              }}
            >
              <Popup>
                <strong>{g.name}</strong>
                <p>
                  {g.municipality} · {repo.getUnitsByGarrison(g.id).length}{" "}
                  unidades registradas
                </p>
                <button onClick={() => openGarrison(g.id)}>
                  Ver instalación y unidades
                </button>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      <p className="muted">
        {locations.length} instalaciones con coordenadas documentadas. El fondo
        cartográfico necesita conexión; las fichas siguen disponibles sin ella.
      </p>
    </>
  );
}
