"use client";

/**
 * EarthPulse AI — Leaflet Investigation Map Surface (Light Theme)
 * Renders clean light scientific basemap and 0.05° analytical GeoJSON grid from backend.
 * Dynamic area extraction from backend properties; zero hardcoded measurements.
 */

import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";

function MapController({ center, zoom, bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && typeof bounds.isValid === "function" && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
    } else if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, bounds, map]);
  return null;
}

export function InvestigationMap({
  gridGeoJson,
  selectedCell,
  hoveredCell,
  onSelectCell,
  onHoverCell,
  activeLayer = "change_score"
}) {
  const defaultCenter = [13.05, 80.225];
  const defaultZoom = 11;
  const selectedCellRef = useRef(selectedCell);
  selectedCellRef.current = selectedCell;

  let mapBounds = null;
  if (gridGeoJson && gridGeoJson.features && gridGeoJson.features.length > 0) {
    try {
      const geoLayer = L.geoJSON(gridGeoJson);
      mapBounds = geoLayer.getBounds();
    } catch (_) {
      // Fallback
    }
  }

  // Restrained analytical grid: unselected cells stay visually quiet
  // (hairline border, low fill) so the map dominates; the selected cell
  // carries the single emerald accent with a clearly visible state.
  const getFeatureStyle = (feature) => {
    const cellCode = feature.properties?.cell_code;
    const isSelected = selectedCell === cellCode;

    if (isSelected) {
      return {
        fillColor: "#059669",
        fillOpacity: 0.28,
        color: "#047857",
        weight: 2.5,
        dashArray: ""
      };
    }

    return {
      fillColor: "#059669",
      fillOpacity: 0.05,
      color: "#6B8F88",
      weight: 1,
      dashArray: ""
    };
  };

  const onEachFeature = (feature, layer) => {
    const code = feature.properties?.cell_code || "Unknown";
    const centerLat = feature.properties?.center_lat;
    const centerLon = feature.properties?.center_lon;
    const area = feature.properties?.area_sqkm;

    const centerText =
      centerLat !== undefined && centerLat !== null && centerLon !== undefined && centerLon !== null
        ? `<br/>Center: ${Number(centerLat).toFixed(3)}°N, ${Number(centerLon).toFixed(3)}°E`
        : "<br/>Center: N/A";
    const areaText = area ? `<br/>Area: ${area} km²` : "";
    layer.bindTooltip(
      `<strong>${code}</strong>${centerText}${areaText}`,
      { permanent: false, sticky: true, className: "leaflet-tooltip" }
    );

    layer.on({
      mouseover: (e) => {
        const l = e.target;
        if (selectedCellRef.current !== code) {
          l.setStyle({
            fillColor: "#059669",
            fillOpacity: 0.16,
            color: "#047857",
            weight: 1.5,
            dashArray: ""
          });
        }
        if (onHoverCell) onHoverCell(code);
      },
      mouseout: (e) => {
        const l = e.target;
        if (selectedCellRef.current !== code) {
          l.setStyle({
            fillColor: "#059669",
            fillOpacity: 0.05,
            color: "#6B8F88",
            weight: 1,
            dashArray: ""
          });
        }
        if (onHoverCell) onHoverCell(null);
      },
      click: (e) => {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);
        const next = selectedCellRef.current === code ? null : code;
        if (onSelectCell) {
          onSelectCell(next);
        }
      }
    });
  };

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom={true}
        className="w-full h-full"
        zoomControl={true}
      >
        <MapController center={defaultCenter} zoom={defaultZoom} bounds={mapBounds} />

        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          maxZoom={16}
        />

        {gridGeoJson && (
          <GeoJSON
            key={`grid-${activeLayer}-${selectedCell || "none"}`}
            data={gridGeoJson}
            style={getFeatureStyle}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
    </div>
  );
}

