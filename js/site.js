'use strict';
/* global mapboxgl MapboxClient */

mapboxgl.accessToken = 'pk.eyJ1IjoiY29kZWZvcmFmcmljYSIsImEiOiJzbUlkVDRNIn0.JUlW50UqJRZ3em2BKUBJIg';
var isDragging, isCursorOverPoint, storedPopupText;


// Set map co-ordinates from URL
var ClimateChangeProjections = {
  map: {
    center: [0,0],
    zoom: 1.5
  },
  point: {
    coordinates: [36.832800445739764,-1.2847089229405242]
  }
}
if (getUrlParameters('center', '', true) != false) {
  var map_ctr = getUrlParameters('center', '', true).split(',');
  var map_zoom = getUrlParameters('zoom', '', true);
  ClimateChangeProjections.map.center = [Number(map_ctr[0]), Number(map_ctr[1])];
  ClimateChangeProjections.map.zoom = Number(map_zoom);
};
if (getUrlParameters('point', '', true) != false) {
  var point = getUrlParameters('point', '', true).split(',');
  ClimateChangeProjections.point.coordinates = [Number(point[0]), Number(point[1])];
};
ClimateChangeProjections.setUrlParameters = function () {
  window.location.hash = setUrlParameters('center', map.getCenter().lng + ',' + map.getCenter().lat);
  window.location.hash = setUrlParameters('zoom', map.getZoom());
  window.location.hash = setUrlParameters('point', geojson.features[0].geometry.coordinates.join(','));
  ClimateChangeProjections.embedBox.setUrl();
};
ClimateChangeProjections.embedBox = {
  is_open: false,
  toggle: function() {
    document.getElementById('embed-box').style.display = (this.is_open) ? 'none' : 'block';
    this.is_open = (this.is_open) ? false : true;
  },
  setUrl: function() {
    document.getElementById('embed-box').innerHTML = '<code>&lt;iframe src="'+window.location.href+'" width="100%" height="600px" &gt;&lt;/iframe&gt;</code>'
  }
}
ClimateChangeProjections.embedBox.setUrl();


var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v9',
  center: ClimateChangeProjections.map.center,
  zoom: ClimateChangeProjections.map.zoom
});

// Disable scroll zooming in iframe
if ( window.location !== window.parent.location ) {
  // The page is in an iframe
  map.scrollZoom.disable();
} else {
  // The page is not in an iframe
  map.scrollZoom.enable();
}

var client = new MapboxClient(mapboxgl.accessToken);

var geocoder = new MapboxGeocoder({
  placeholder: 'Search a location',
  flyTo: false,
  accessToken: mapboxgl.accessToken
});

map.addControl(geocoder, 'top-left');

map.addControl(new mapboxgl.NavigationControl(), 'top-left');

// Used for the draggable point on the map.
var geojson = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: ClimateChangeProjections.point.coordinates
    }
  }]
};

var popup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false
});

map.on('load', function() {

  // Apply sources and layer styling
  map.addSource('temperature', {
    type: 'vector',
    url: 'mapbox://dnomadb.bm36vjqh'
  });

  map.addSource('point', {
    type: 'geojson',
    data: geojson
  });

  map.addLayer({
    id: 'point-casing',
    source: 'point',
    type: 'circle',
    paint: {
      'circle-radius': 15,
      'circle-color': '#fff'
    }
  });

  map.addLayer({
    id: 'point',
    source: 'point',
    type: 'circle',
    paint: {
      'circle-radius': 10,
      'circle-color': 'rgba(0,0,0,0.25)'
    }
  });

  map.addLayer({
    id: 'temperature2070',
    type: 'fill',
    source: 'temperature',
    'source-layer': 'worldclim',
    paint: {
      'fill-color': 'transparent',
      'fill-antialias': false
    }
  }, 'water');

  map.addLayer({
    id: 'temperature2050',
    type: 'fill',
    source: 'temperature',
    'source-layer': 'worldclim',
    paint: {
      'fill-color': 'transparent',
      'fill-antialias': false
    }
  }, 'water');

  map.addLayer({
    id: 'temperature2016',
    type: 'fill',
    source: 'temperature',
    'source-layer': 'worldclim',
    paint: {
      'fill-color': 'transparent',
      'fill-antialias': false
    }
  }, 'water');

  // Events
  map.on('mousemove', move);
  map.on('mousedown', dragDown);
  map.on('touchstart', move);
  map.on('touchstart', dragDown);
  map.on('zoomend', ClimateChangeProjections.setUrlParameters);
  map.on('dragend', ClimateChangeProjections.setUrlParameters);
  map.on('mouseup', ClimateChangeProjections.setUrlParameters);
  map.on('touchend', ClimateChangeProjections.setUrlParameters);

  // Initialize the viz
  var initialCoords = geojson.features[0].geometry.coordinates;
  setPointLoading(initialCoords);
  window.setTimeout(function() {
    geolocatePoint(initialCoords);
    generateVisualization(map.project(initialCoords));
  }, 2000);
});

function move(e) {
  var features = map.queryRenderedFeatures(e.point, { layers: ['point'] });

  if (features.length) {
    map.setPaintProperty('point', 'circle-color', 'rgba(0,0,0,0.5)');
    map.getCanvasContainer().style.cursor = 'move';
    isCursorOverPoint = true;
    map.dragPan.disable();
    popup.setText('Drag me!');
  } else {
    map.setPaintProperty('point', 'circle-color', 'rgba(0,0,0,0.25)');
    map.getCanvasContainer().style.cursor = '';
    isCursorOverPoint = false;
    if (storedPopupText) popup.setText(storedPopupText);
    map.dragPan.enable();
  }
}

function dragDown() {
  if (!isCursorOverPoint) return;
  isDragging = true;
  popup.remove();
  map.getCanvasContainer().style.cursor = 'grab';
  map.on('mousemove', onDragMove);
  map.on('mouseup', onDragUp);
  map.on('touchmove', onDragMove);
  map.on('touchend', onDragUp);
}

function onDragMove(e) {
  if (!isDragging) return;
  var coords = e.lngLat;
  map.getCanvasContainer().style.cursor = 'grabbing';
  geojson.features[0].geometry.coordinates = [coords.lng, coords.lat];
  map.getSource('point').setData(geojson);
}

function setPointLoading(coords) {
  var load = document.createElement('div');
  load.className = 'loading';
  popup
    .setLngLat(coords)
    .setDOMContent(load)
    .addTo(map);
}

function onDragUp(e) {
  if (!isDragging) return;
  generateVisualization(e.point);
  var coords = [e.lngLat.lng, e.lngLat.lat];
  setPointLoading(coords);
  geolocatePoint(coords);
  isDragging = false;
  map.off('mousemove', onDragMove);
  map.off('mouseup', onDragUp);
  map.off('touchmove', onDragMove);
  map.off('touchend', onDragUp);
}

geocoder.on('result', function(e) {
  generateVisualization(map.project(e.result.center));
  storedPopupText = e.result.place_name;
  document.getElementById('location').textContent = storedPopupText;
  geojson.features[0].geometry.coordinates = e.result.center;
  map.getSource('point').setData(geojson);
  popup
    .setLngLat(e.result.center)
    .setText(storedPopupText)
    .addTo(map);
});

function generateVisualization(pos) {
  var features = map.queryRenderedFeatures(pos, {
    layers: ['temperature2016']
  });

  if (!features.length) return;
  var feature = features[0];
  var currentTemp = feature.properties.band_3;

  var col_2070 = ['rgba(250,111,116,0)', 'rgba(250,111,116,0.75)'];
  var col_2050 = ['rgba(179,108,163,0)', 'rgba(179,108,163,0.75)'];
  var col_2016 = ['rgba(62,113,154,0)', 'rgba(62,113,154,0.75)'];

  // only works w/ one so far
  map.setPaintProperty('temperature2070', 'fill-color', {
    property: 'band_1',
    stops: [
      [currentTemp - 20, col_2070[0]],
      [currentTemp - 10, col_2070[1]],
      [currentTemp + 10, col_2070[1]],
      [currentTemp + 20, col_2070[0]]
    ]
  });

  map.setPaintProperty('temperature2050', 'fill-color', {
    property: 'band_2',
    stops: [
      [currentTemp - 20, col_2050[0]],
      [currentTemp - 10, col_2050[1]],
      [currentTemp + 10, col_2050[1]],
      [currentTemp + 20, col_2050[0]]
    ]
  });

  map.setPaintProperty('temperature2016', 'fill-color', {
    property: 'band_3',
    stops: [
      [currentTemp - 20, col_2016[0]],
      [currentTemp - 10, col_2016[1]],
      [currentTemp + 10, col_2016[1]],
      [currentTemp + 20, col_2016[0]]
    ]
  });

  buildLegend([{
    label: '2016',
    color: col_2016[1],
    value: feature.properties.band_1 / 10 + '<sup>o</sup>C'
  }, {
    label: '2050',
    color: col_2050[1],
    value: feature.properties.band_2 / 10 + '<sup>o</sup>C'
  }, {
    label: '2070',
    color: col_2070[1],
    value: feature.properties.band_3 / 10 + '<sup>o</sup>C'
  }]);
}

function buildLegend(keys) {
  var legend = document.getElementById('legend');
  legend.innerHTML = '';
  keys.forEach(function(key) {
    var block = document.createElement('div');
    block.className = 'col4 pad1x pad0y';
    block.style.backgroundColor = key.color;

    var value = document.createElement('value');
    value.className = 'small strong center block legend-value';
    value.innerHTML = key.value;

    var date = document.createElement('date');
    date.className = 'micro center quiet block';
    date.textContent = key.label;

    block.appendChild(value);
    block.appendChild(date);
    legend.appendChild(block);
  });
}

function geolocatePoint(coords) {
  client.geocodeReverse({
    longitude: coords[0],
    latitude: coords[1]
  }, {
    dataset: 'mapbox.places',
    types: 'neighborhood,locality,region,country'
  }).then(function(res) {
    storedPopupText = res.features.length ? res.features[0].place_name : 'No location found';
    document.getElementById('location').textContent = storedPopupText;
    popup.setText(storedPopupText);
  }).catch(function(err) {
    console.warn(err);
  });
}

// Append custom attribution
var bottomContainer = document.querySelector('.mapboxgl-ctrl-bottom-right');
var attribution = document.createElement('div');
attribution.className = 'mapboxgl-ctrl-attrib mapboxgl-ctrl hide-mobile';

var attrib = document.createElement('a');
attrib.target = '_blank';
attrib.textContent = 'Climate data WorldClim';
attrib.href = 'http://www.worldclim.org/download/';

attribution.appendChild(attrib);
bottomContainer.appendChild(attribution);
