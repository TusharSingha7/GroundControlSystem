import { useRef, useEffect, } from 'react'
import mapboxgl from 'mapbox-gl'
import { useState } from 'react';
import useMarkers from './utils/markerControls';
import downloadArrayAsJson from './utils/downloader'
import {ACCESS_TOKEN} from './config'
import getRoute from './utils/getRoute';

import 'mapbox-gl/dist/mapbox-gl.css';

import './App.css'

const INITIAL_CENTER: [number, number] = [
  77.3217,
  28.4740
]
const INITIAL_ZOOM = 12
function App() {

  const mapRef = useRef<mapboxgl.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const seqNumber = useRef(1);
  const {addMarker , removeMarker  , markersRef} = useMarkers();
  const arrayRef = useRef<number[]>([])

  const [center, setCenter] = useState<[number, number]>(INITIAL_CENTER)
  const [zoom, setZoom] = useState<number>(INITIAL_ZOOM)
  const [show, setShow] = useState<boolean>(false)
  const [long, setLong] = useState<number>(77.3217)
  const [lat, setLat] = useState<number>(28.4740)
  const [zoomLevel, setZoomLevel] = useState<number>(12)
  const [seq,setSeq] = useState<number>(1);
  const [alt,setAlt] = useState<number>(0);

  useEffect(() => {
    mapboxgl.accessToken = ACCESS_TOKEN
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current! as HTMLElement,
      center: center,
      zoom: zoom,
      style: 'mapbox://styles/mapbox/streets-v12',
      pitch: 60
    });

    mapRef.current.on('move', () => {
      const mapCenter = mapRef.current!.getCenter()
      const mapZoom = mapRef.current!.getZoom()
      const elevation = mapRef.current!.queryTerrainElevation(mapCenter) || 0;
      setCenter([ mapCenter.lng, mapCenter.lat ])
      setZoom(mapZoom)
      setAlt(elevation)
      if((mapCenter.lng).toFixed(4) === INITIAL_CENTER[0].toFixed(4) && (mapCenter.lat).toFixed(4) === INITIAL_CENTER[1].toFixed(4) && mapZoom.toFixed(2) === INITIAL_ZOOM.toFixed(2)) {
        setShow(false)
      }
      else setShow(true)
    });

    const geolocate = new mapboxgl.GeolocateControl({showAccuracyCircle : true , showUserLocation:true , showUserHeading:true});
    mapRef.current.addControl(geolocate);
    mapRef.current.on('load', () => {
      geolocate.trigger();
      mapRef.current!.addSource('mapbox-dem', {
          'type': 'raster-dem',
          'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
          'tileSize': 512,
          'maxzoom': 14 
      });
      mapRef.current!.setTerrain({
        'source': 'mapbox-dem', 
        'exaggeration': 1.5 
      });
      mapRef.current?.addSource('route' , {
        'type': 'geojson',
        'data': {
          'type' : 'Feature',
          'properties' : {},
          'geometry' : {
            'type' : 'LineString',
            'coordinates' : []
          }
        }
      })
      mapRef.current?.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#FF3300',
          'line-width': 5,
          'line-opacity': 0.75
        }
      });
      mapRef.current!.addSource('sequential-marker-line-source',{
        'type': 'geojson',
        'data': {
          'type' : 'Feature',
          'properties' : {},
          'geometry' : {
            'type' : 'LineString',
            'coordinates' : []
          }
        }
      });

      mapRef.current!.addLayer({
        id: 'sequential-marker-line-layer-id',
        type: 'line',
        source: 'sequential-marker-line-source',
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: { 
            'line-color': '#007bff', 
            'line-width': 4
        }
    });
        
    });

    mapRef.current?.on('click',(e)=>{
      const longlat = e.lngLat;
      const res = addMarker({
        map: mapRef.current!,
        coordinates: [longlat.lng,longlat.lat],
        sequenceNumber: seqNumber.current
      })
      if(res) {
        arrayRef.current.push(seqNumber.current);
        seqNumber.current += 1;
      }
    })

    return () => {
      mapRef.current?.remove()
    }
  }, [])
  
  const handleButtonClick = () => {
    mapRef.current!.flyTo({
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM
    })
  }
  const customFlyer = () => {
    mapRef.current!.flyTo({
      center : [long,lat],
      zoom : zoomLevel
    })
  }

  const deleteHandler = ()=>{
    if(markersRef.current.has(seq)) {
      const idx = arrayRef.current.indexOf(seq,0);
      arrayRef.current.splice(idx,1);
    }

    const res = removeMarker(seq);

    if(res && seq == seqNumber.current-1) seqNumber.current -= 1;

    if(markersRef.current.size == 0) {
      seqNumber.current = 1;
      setSeq(1);
    }
  }

  const displayPathHandler = ()=> {
      arrayRef.current.sort((a:number,b:number)=>a - b);
      const source : mapboxgl.GeoJSONSource | undefined = mapRef.current!.getSource('sequential-marker-line-source');
      const sortedMarkersCoordinates : [number,number][] = [];
      for(let i = 0;i<arrayRef.current.length;i++) {
        const tar_marker = markersRef.current.get(arrayRef.current[i]);
        const tar_lng = tar_marker!.getLngLat().lng;
        const tar_lat = tar_marker!.getLngLat().lat;
        sortedMarkersCoordinates.push([tar_lng , tar_lat]);
      }
        source!.setData({
          type: 'Feature',
              properties: {},
              geometry: {
                  type: 'LineString',
                  coordinates: sortedMarkersCoordinates
              }
        });
  }

  const removePathHandler = ()=>{
    const source : mapboxgl.GeoJSONSource | undefined = mapRef.current!.getSource('sequential-marker-line-source');
    source!.setData({
      type: 'Feature',
          properties: {},
          geometry: {
              type: 'LineString',
              coordinates: []
          }
    });
  }

  const downloadHandler = ()=>{
    try {
      const data = mapRef.current?.querySourceFeatures('sequential-marker-line-source');
      if(!data) alert("invalid data");
      else {
        downloadArrayAsJson(data);
      }
    }
    catch(err) {
      alert(err);
    }
  }
  const displayRouteHandler = ()=>{
    arrayRef.current.sort((a:number,b:number)=>a - b);
    const sortedMarkersCoordinates : [number,number][] = [];
      for(let i = 0;i<arrayRef.current.length;i++) {
        const tar_marker = markersRef.current.get(arrayRef.current[i]);
        const tar_lng = tar_marker!.getLngLat().lng;
        const tar_lat = tar_marker!.getLngLat().lat;
        sortedMarkersCoordinates.push([tar_lng , tar_lat]);
      }
    getRoute({
      coordinates : sortedMarkersCoordinates,
      mapRef : mapRef
    })
  }

  const removeRouteHandler = ()=> {
    const source : mapboxgl.GeoJSONSource | undefined = mapRef.current!.getSource('route');
    source!.setData({
      type: 'Feature',
          properties: {},
          geometry: {
              type: 'LineString',
              coordinates: []
          }
    });
  }

  return (
    <>
      <div className="sidebar">
        Longitude: {center[0].toFixed(4)} | Latitude: {center[1].toFixed(4)} | Alt: {alt.toFixed(4)} | Zoom: {zoom.toFixed(2)}
      </div>
      {show && <button className='reset-button' onClick={handleButtonClick}>
          Reset
        </button>}
      <div className='z-10 absolute top-10 right-0 m-4'>
        <button className='bg-red-300 rounded-md p-1 m-2' onClick = {downloadHandler}>Export mission</button><br/>
        <button className='bg-red-300 rounded-md p-1 m-2' onClick = {displayPathHandler}>Display Path</button><br/>
        <button className='bg-red-300 rounded-md p-1 m-2' onClick = {displayRouteHandler}>Display Route</button><br/>
        <button className='bg-red-300 rounded-md p-1 m-2' onClick = {removePathHandler}>Remove Path</button><br/>
        <button className='bg-red-300 rounded-md p-1 m-2' onClick = {removeRouteHandler}>Remove Route</button>
      </div>
      <div id='map-container' ref={mapContainerRef} className='h-full w-full bg-lightgrey'/>
      <div className='flex z-10 absolute bottom-10 right-0 m-4 flex-col gap-2'>
          <div className='bg-red-300 rounded-md p-1 flex ml-auto'>
            <input className='w-52' placeholder='Marker seqNo' type='number' onChange={(e)=>setSeq(Number(e.target.value))}></input>
          </div>
          <div className='bg-red-300 rounded-md p-1 flex ml-auto'>
            <button className='' onClick={deleteHandler}>Delete Waypoint</button>
          </div>
      </div>
      <div className=' bg-red-300 rounded-md p-1 flex flex-wrap z-10 absolute bottom-0 right-0 m-4'>
            <input placeholder='Enter Long' type='number' onChange={(e)=>{setLong(Number(e.target.value))}}></input>
            <input placeholder='Enter Lat' type='number' onChange={(e)=>{setLat(Number(e.target.value))}}></input>
            <input placeholder='Enter Zoom' type='number' onChange={(e)=>{setZoomLevel(Number(e.target.value))}}></input>
            <button className='px-4 rounder-md' onClick={customFlyer}> Fly</button>
      </div>
    </>
  )
}

export default App