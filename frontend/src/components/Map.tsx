import { useEffect, useRef } from "react";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import * as maptilersdk from "@maptiler/sdk";

function StaticMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maptilersdk.Map | null>(null);
  useEffect(() => {
    if (!mapRef.current) return;
    maptilersdk.config.apiKey = import.meta.env.VITE_MAPTILER_API_KEY;
    const map = new maptilersdk.Map({
      container: mapRef.current,
      style: maptilersdk.MapStyle.STREETS,
      center: [-71.3, 41.48],
      zoom: 11,
    });
    mapInstanceRef.current = map;

    // Add markers for multiple locations - Known US Estates
    const locations = [
      { lng: -71.3, lat: 41.48, name: "The Breakers - Newport, RI" },
      { lng: -71.31, lat: 41.47, name: "Marble House - Newport, RI" },
      { lng: -71.29, lat: 41.49, name: "Vanderbilt Mansion - Hyde Park, NY" },
      { lng: -71.315, lat: 41.475, name: "Elms Estate - Newport, RI" },
    ];

    locations.forEach((location) => {
      new maptilersdk.Marker()
        .setLngLat([location.lng, location.lat])
        .setPopup(new maptilersdk.Popup().setHTML(`<h3>${location.name}</h3>`))
        .addTo(map);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);
  return (
    <div style={{ width: "100%", height: "500px" }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

export default StaticMap;
