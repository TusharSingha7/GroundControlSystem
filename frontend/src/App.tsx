import { useRef, useEffect, MouseEventHandler } from 'react'
import mapboxgl from 'mapbox-gl'
import { useState } from 'react';

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

  const [center, setCenter] = useState<[number, number]>(INITIAL_CENTER)
  const [zoom, setZoom] = useState<number>(INITIAL_ZOOM)
  const [show, setShow] = useState<boolean>(false)
  const [lat, setLat] = useState<number>(28.6014)
  const [long, setLong] = useState<number>(77.1576)
  const [zoomLevel, setZoomLevel] = useState<number>(5)

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoidHVzaGFyc2luZ2g0NzkiLCJhIjoiY205ZTN6MmViMTV6MjJ2czVvcWljMHFobyJ9.9eMwG1oPRqy6YUi9_Gk_Cw'
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current! as HTMLElement,
      center: center,
      zoom: zoom
    });

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
  return (
    <>
      <div className="sidebar">
        Longitude: {center[0].toFixed(4)} | Latitude: {center[1].toFixed(4)} | Zoom: {zoom.toFixed(2)}
      </div>
      <div className='absolute z-10 bg-red-300 right-0 bottom-0 m-4 rounded-md p-1 flex flex-wrap'>
        <input placeholder='Enter Lat' type='number' onChange={(e)=>{setLat(Number(e.target.value))}}></input>
        <input placeholder='Enter Long' type='number' onChange={(e)=>{setLong(Number(e.target.value))}}></input>
        <input placeholder='Enter Zoom' type='number' onChange={(e)=>{setZoomLevel(Number(e.target.value))}}></input>
        <button className='px-4 rounder-md' onClick={customFlyer}> Fly</button>
      </div>
      {show && <button className='reset-button' onClick={handleButtonClick}>
          Reset
        </button>}
      <div id='map-container' ref={mapContainerRef} className='h-full w-full bg-lightgrey'/>
    </>
  )
}

export default App