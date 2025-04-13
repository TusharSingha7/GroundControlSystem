import { useRef, useEffect, } from 'react'
import mapboxgl from 'mapbox-gl'
import { useState } from 'react';
import useMarkers from '../utils/markerAdder';

import 'mapbox-gl/dist/mapbox-gl.css';

import './App.css'

const INITIAL_CENTER: [number, number] = [
  77.1576,
  28.6014
]
const INITIAL_ZOOM = 5
function App() {

  const mapRef = useRef<mapboxgl.Map | null>(null)
  const mapContainerRef = useRef(null)
  const seqNumber = useRef(1);
  const {addMarker , removeMarker} = useMarkers();

  const [center, setCenter] = useState<[number, number]>(INITIAL_CENTER)
  const [zoom, setZoom] = useState<number>(INITIAL_ZOOM)
  const [show, setShow] = useState<boolean>(false)
  const [lat, setLat] = useState<number>(-78.7267)
  const [long, setLong] = useState<number>(37.5099)
  const [zoomLevel, setZoomLevel] = useState<number>(5)
  const [alt,setAlt] = useState<number>(0);
  const [seq,setSeq] = useState<number>(0);

  const geojson = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-77.032, 38.913],
          alitude: 0
        },
        properties: {
          title: 'Mapbox',
          description: 'Washington, D.C.'
        }
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates : [-122.414, 37.776],
          alitude: 0
        },
        properties: {
          title: 'Mapbox',
          description: 'San Francisco, California'
        }
      }
    ]
  };

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoidHVzaGFyc2luZ2g0NzkiLCJhIjoiY205ZTN6MmViMTV6MjJ2czVvcWljMHFobyJ9.9eMwG1oPRqy6YUi9_Gk_Cw'
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current! as HTMLElement,
      center: center,
      zoom: zoom,
      style: 'mapbox://styles/mapbox/streets-v12',
      pitch: 60
    });

    for (const feature of geojson.features) {
      
      new mapboxgl.Marker({draggable:true}).setLngLat(feature.geometry.coordinates as [number, number]).setAltitude(feature.geometry.alitude).setPopup(
        new mapboxgl.Popup({ offset: 25 }) 
          .setHTML(
            `<h3>${feature.properties.title}</h3>
            <h1>${feature.geometry.alitude}</h1>
            <h1>${feature.geometry.coordinates[0]}</h1>
            <h1>${feature.geometry.coordinates[1]}</h1>
            <p>${feature.properties.description}</p>`
          )
      ).addTo(mapRef.current);  

    }

    mapRef.current.on('move', () => {
      // get the current center coordinates and zoom level from the map
      const mapCenter = mapRef.current!.getCenter()
      const mapZoom = mapRef.current!.getZoom()
      setCenter([ mapCenter.lng, mapCenter.lat ])
      setZoom(mapZoom)
  
      if((mapCenter.lng).toFixed(4) === INITIAL_CENTER[0].toFixed(4) && (mapCenter.lat).toFixed(4) === INITIAL_CENTER[1].toFixed(4) && mapZoom.toFixed(2) === INITIAL_ZOOM.toFixed(2)) {
        setShow(false)
      }
      else setShow(true)
    });
    // mapRef.current.on('load', () => {
      // Add a GeoJSON source for the circle layer
      // mapRef.current!.addSource('dem', {
      //   type: 'raster-dem',
      //   url: 'mapbox://mapbox.mapbox-terrain-dem-v1'
      // });
    
      // mapRef.current!.setTerrain({ source: 'dem' });
      // mapRef.current!.addSource('center-point', {
      //   type: 'geojson',
      //   data: {
      //     type: 'FeatureCollection',
      //     features: [
      //       {
      //         type: 'Feature',
      //         geometry: {
      //           type: 'Point',
      //           coordinates: mapRef.current!.getCenter().toArray() // Initial position
      //         },
      //         properties : {

      //         }
      //       }
      //     ]
      //   }
      // });
    
      // // Add a circle layer for the red dot
      // mapRef.current!.addLayer({
      //   id: 'center-point-layer',
      //   type: 'circle',
      //   source: 'center-point',
      //   paint: {
      //     'circle-radius': 5,
      //     'circle-color': '#F84C4C' // Red color
      //   }
      // });
    
      // Update circle position on mapRef.current movement
    //   mapRef.current!.on('move', () => {
    //     const center = mapRef.current!.getCenter();
    //     const geojson: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
    //       type: 'FeatureCollection',
    //       features: [
    //         {
    //           type: 'Feature',
    //           geometry: {
    //             type: 'Point',
    //             coordinates: [center.lng, center.lat]
    //           },
    //           properties: {}
    //         }
    //       ]
    //     };
    //     const source = mapRef.current!.getSource('center-point');
    //     if (source) {
    //       (source as mapboxgl.GeoJSONSource).setData(geojson);
    //     }
    //   });
    // });
    

    mapRef.current!.on('click',()=> {
        console.log(mapRef.current?.getCenter())
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
      }
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
      center : [lat,long],
      zoom : zoomLevel
    })
  }

  const handleAddMaker = () => {
    addMarker({
      map: mapRef.current!,
      coordinates: center,
      altitude: alt,
      title: "Untitled Marker",
      description: "",
      sequenceNumber: seqNumber.current
    })
    seqNumber.current += 1;
  }

  const deleteHandler = ()=>{
    const res = removeMarker(seq);
    if(res && seq == seqNumber.current-1) seqNumber.current -= 1;
  }

  return (
    <>
      <div className='w-2 h-2 rounded-lg absolute z-10 bg-red-400 inset-0 m-auto'></div>
      <div className="sidebar">
        Longitude: {center[0].toFixed(4)} | Latitude: {center[1].toFixed(4)} | Zoom: {zoom.toFixed(2)}
      </div>
      {show && <button className='reset-button' onClick={handleButtonClick}>
          Reset
        </button>}
      <div className='z-10 absolute bottom-30 right-0 m-4'>
        <button className='bg-red-300 rounded-md p-1 m-2'>Download</button><br/>
        <button className='bg-red-300 rounded-md p-1 m-2'>Connect</button>
      </div>
      <div id='map-container' ref={mapContainerRef} className='h-full w-full bg-lightgrey'/>
      <div className='flex z-10 absolute bottom-10 right-0 m-4 flex-col gap-2'>
          <div className='bg-red-300 rounded-md p-1 flex ml-auto'>
            <input className='w-52' placeholder='Marker seqNo' type='number' onChange={(e)=>setSeq(Number(e.target.value))}></input>
            <button className='bg-red-300' onClick={deleteHandler}>CustomSeq</button>
          </div>
          <div className='bg-red-300 rounded-md p-1 flex ml-auto'>
            <input placeholder='Enter SeqNumber' type='number' onChange={(e)=>setSeq(Number(e.target.value))}></input>
            <button className='' onClick={deleteHandler}>Delete Marker</button>
          </div>
          <div className='bg-red-300 rounded-md p-1 flex ml-auto'>
            <input placeholder='Enter Alt' type='number' onChange={(e)=>{setAlt(Number(e.target.value))}}></input>
            <button className='' onClick={handleAddMaker}>Add Marker</button>
          </div>
      </div>
      <div className=' bg-red-300 rounded-md p-1 flex flex-wrap z-10 absolute bottom-0 right-0 m-4'>
            <input placeholder='Enter Lat' type='number' onChange={(e)=>{setLat(Number(e.target.value))}}></input>
            <input placeholder='Enter Long' type='number' onChange={(e)=>{setLong(Number(e.target.value))}}></input>
            <input placeholder='Enter Zoom' type='number' onChange={(e)=>{setZoomLevel(Number(e.target.value))}}></input>
            <button className='px-4 rounder-md' onClick={customFlyer}> Fly</button>
      </div>
    </>
  )
}

export default App