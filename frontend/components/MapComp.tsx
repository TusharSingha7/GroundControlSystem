
import mapboxgl from 'mapbox-gl'; // or "const mapboxgl = require('mapbox-gl');"
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoidHVzaGFyc2luZ2g0NzkiLCJhIjoiY205ZTN6MmViMTV6MjJ2czVvcWljMHFobyJ9.9eMwG1oPRqy6YUi9_Gk_Cw';
const map = new mapboxgl.Map({
	container: 'map', // container ID
	style: 'mapbox://styles/mapbox/streets-v12', // style URL
	center: [-74.5, 40], // starting position [lng, lat]
	zoom: 9, // starting zoom
});