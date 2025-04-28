import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { Box } from "@chakra-ui/react";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

// Set mapbox token from environment variables
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

export interface MapLocation {
  lng: number;
  lat: number;
  address?: string;
}

interface MapboxMapProps {
  initialLocation?: MapLocation;
  onLocationChange?: (location: MapLocation) => void;
  height?: string;
  zoom?: number;
  interactive?: boolean;
}

const MapboxMap = ({
  initialLocation,
  onLocationChange,
  height = "300px",
  zoom = 13,
  interactive = true,
}: MapboxMapProps) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const geocoder = useRef<MapboxGeocoder | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const initialCoordinates = initialLocation
      ? [initialLocation.lng, initialLocation.lat]
      : [-74.5, 40]; // Default to a location in the US

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: initialCoordinates as [number, number],
      zoom: zoom,
    });

    // Add navigation controls
    mapInstance.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add geocoder search if interactive
    if (interactive) {
      const geocoderInstance = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken as string,
        mapboxgl: mapboxgl as any,
        marker: false,
        placeholder: "Search for a location",
      });

      // Add geocoder to the top of the map
      mapInstance.addControl(geocoderInstance, "top-left");
      geocoder.current = geocoderInstance;

      // Listen for result selection
      geocoderInstance.on("result", (e) => {
        const coordinates = e.result.geometry.coordinates;
        updateMarker(coordinates[0], coordinates[1], e.result.place_name);
      });
    }

    // Add click handler if interactive
    if (interactive) {
      mapInstance.on("click", (e) => {
        updateMarker(e.lngLat.lng, e.lngLat.lat);
        reverseGeocode(e.lngLat.lng, e.lngLat.lat);
      });
    }

    // Add initial marker if coordinates are provided
    if (initialLocation) {
      const markerInstance = new mapboxgl.Marker({ draggable: interactive })
        .setLngLat([initialLocation.lng, initialLocation.lat])
        .addTo(mapInstance);

      marker.current = markerInstance;

      if (interactive) {
        markerInstance.on("dragend", () => {
          const lngLat = markerInstance.getLngLat();
          reverseGeocode(lngLat.lng, lngLat.lat);
          onLocationChange?.({ lng: lngLat.lng, lat: lngLat.lat });
        });
      }
    }

    mapInstance.on("load", () => {
      setMapLoaded(true);
    });

    map.current = mapInstance;

    // Cleanup function
    return () => {
      mapInstance.remove();
      map.current = null;
      marker.current = null;
      geocoder.current = null;
    };
  }, []);

  // Update marker position
  const updateMarker = (lng: number, lat: number, address?: string) => {
    if (!map.current) return;

    if (marker.current) {
      marker.current.setLngLat([lng, lat]);
    } else {
      marker.current = new mapboxgl.Marker({ draggable: interactive })
        .setLngLat([lng, lat])
        .addTo(map.current);

      if (interactive) {
        marker.current.on("dragend", () => {
          const lngLat = marker.current!.getLngLat();
          reverseGeocode(lngLat.lng, lngLat.lat);
          onLocationChange?.({ lng: lngLat.lng, lat: lngLat.lat });
        });
      }
    }

    map.current.flyTo({
      center: [lng, lat],
      zoom: zoom,
    });

    onLocationChange?.({ lng, lat, address });
  };

  // Convert coordinates to address
  const reverseGeocode = async (lng: number, lat: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const address = data.features[0].place_name;
        onLocationChange?.({ lng, lat, address });
      } else {
        onLocationChange?.({ lng, lat });
      }
    } catch (error) {
      onLocationChange?.({ lng, lat });
    }
  };

  return (
    <Box
      ref={mapContainer}
      height={height}
      width="100%"
      borderRadius="md"
      overflow="hidden"
    />
  );
};

export default MapboxMap;
