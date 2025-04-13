// hooks/useMarkers.ts
import { useRef } from 'react';
import mapboxgl from 'mapbox-gl';

export type MarkerRefs = Map<number, mapboxgl.Marker>;
export type addMarkerOptions = {
    map: mapboxgl.Map,
    coordinates: [number, number],
    sequenceNumber: number,
    altitude?: number,
    title?: string,
    description?: string
}

export default function useMarkers() {
  const markersRef = useRef<MarkerRefs>(new Map());

  const addMarker = ({
    map,
    coordinates,
    sequenceNumber,
    altitude = 0,
    title = "Untitled Marker",
    description = ""
  }: addMarkerOptions) => {
    const marker = new mapboxgl.Marker({ draggable: true })
      .setLngLat(coordinates)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <h3>${title}</h3>
          <h1>Alt: ${altitude}</h1>
          <h1>Lat: ${coordinates[0]}</h1>
          <h1>Lng: ${coordinates[1]}</h1>
          <h1>Seq: ${sequenceNumber}</h1>
          <p>${description}</p>
        `)
      )
      .addTo(map);

    markersRef.current.set(sequenceNumber, marker);
  };

  const removeMarker = (sequenceNumber: number) => {
    if (markersRef.current.has(sequenceNumber)) {
      const marker = markersRef.current.get(sequenceNumber);
      marker?.remove();
      markersRef.current.delete(sequenceNumber);
      return true;
    }
    return false;
  };

  return { addMarker, removeMarker, markersRef };
}
