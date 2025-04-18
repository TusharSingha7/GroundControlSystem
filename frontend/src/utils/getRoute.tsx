import { ACCESS_TOKEN } from '../config';
import mbxDirections from '@mapbox/mapbox-sdk/services/directions';

export default async function getRoute({
    coordinates,
    mapRef
} : {
    coordinates : [number,number][],
    mapRef : React.RefObject<mapboxgl.Map | null>
}) {
    if(coordinates.length < 2) return null;
    const directionsService = mbxDirections({ accessToken: ACCESS_TOKEN });
    let waypointsarray = [];
    for(let i = 0;i<coordinates.length;i++) {
        waypointsarray.push({
            coordinates : coordinates[i]
        })
    }
    const res = directionsService.getDirections({
    profile: 'driving',
    geometries: 'geojson',
    waypoints: waypointsarray
    })
    .send()
    const query = await res;
    const json = query.body;
    const data = json.routes[0];
    const geojson: GeoJSON.Feature<GeoJSON.Geometry> = {
      type: 'Feature',
      properties: {},
      geometry: data.geometry
    };
    const source : mapboxgl.GeoJSONSource | undefined = mapRef.current!.getSource('route')
    source!.setData(geojson);
  
  }