
  mapboxgl.accessToken = 'pk.eyJ1IjoicmVuLWhlZ3lpIiwiYSI6ImNremhudTF1eTJjMW0yd2t1NTUzYjN4bmIifQ.IiIyBmQ93k7PgPh0rQrLEg'

  var mapCenter = [-73.842989, 40.824015]

  var map = new mapboxgl.Map({
    container: 'mapContainer', // HTML container id
    style: 'mapbox://styles/mapbox/satellite-v9', // style URL
    center: mapCenter, // starting position as [lng, lat]
    zoom: 14.5,
    // minZoom: 9,
    // maxZoom: 14
  });

//
// $.getJSON('data/zerega-fleet-locations.json', function(locations) {
//   console.log(locations)
//
//
//   // now add markers for all fleet locations
//   locations.forEach(function(location) {
//     var popup = new mapboxgl.Popup({ offset: 40 })
//       .setHTML(`
//         <p> <strong> Address: </strong>${location.address} </p>
//         <p> <strong> Site name: </strong>${location.name} </p>
//         <p> <strong> Fleet Size: </strong> ${location.fleet_size} </p>
//         <p> To electrify the <strong>${location.type}</strong> fleet parked at this location, there must be electrical infrastructure available to serve <strong>${location.estimated_demand_mva} MVA</strong> of additional demand.</p>
//       `);
//
//     // default is purple for "multiple" fleet type
//     var color = 'purple'
//
//     if (location.fleet_type === 'School Bus') {
//       color = '#FFD800'
//     }
//
//     if (location.fleet_type === 'Public Refuse Truck') {
//       color = '#19601B'
//     }
//
//     new mapboxgl.Marker({
//       color: color
//     })
//       .setLngLat([location.gps_longitude, location.gps_latitude])
//       .setPopup(popup)
//       .addTo(map);
//   })
//
//
//
// });

//legend

// define layer names for legend
const layers = [

'Public Refuse Truck',
'School Bus',
//'Police',
'Other public',
'Commercial',

//'Other'
];
const colors = [
'#19601B',
'#FFD800',
//'blue',
'purple',
'orange',
//'purple'
];

// create legend. Source: https://docs.mapbox.com/help/tutorials/choropleth-studio-gl-pt-2/#add-a-legend
const legend = document.getElementById('legend');

layers.forEach((layer, i) => {
const color = colors[i];
const item = document.createElement('div');
const key = document.createElement('span');
key.className = 'legend-key';
key.style.backgroundColor = color;

const value = document.createElement('span');
value.innerHTML = `${layer}`;
item.appendChild(key);
item.appendChild(value);
legend.appendChild(item);
});


// load markers as layers

map.on("load", function () {

  map.addSource('fleets', {
    type: 'geojson',
    data: './data/zerega-fleet-locations-merged.geojson'
  });

  map.addLayer({
    id: 'fleets',
    type: 'circle',
    source: 'fleets',
    layout: {
      'visibility': 'visible'
    },
    paint: {
      'circle-color': [
        'match',
        ['get', 'fleet_type'],
        'School bus',
        '#FFD800',
        'Sanitation',
        '#19601B',
        'Commercial',
        'orange',
        'Police',
        'blue',
        /* other */ 'purple'
        ],
      'circle-opacity': 0.7,
      'circle-radius': {
        property: 'estimated_demand_mva',
        stops: [
          [{zoom:11, value:0},1],
          [{zoom:11, value:6},4],
          [{zoom:16, value:0},10],
          [{zoom:16, value:6},40]
        ]
      }
    }
  });

  // load text layer for labels

  map.addLayer({
    id: 'fleet-labels',
    type: 'symbol',
    source: 'fleets',
    layout: {
    'text-field': ['get', 'estimated_demand_mva'],
    // 'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
    'text-justify': 'auto',
    // 'icon-image': ['get', 'icon']
    'text-size':{
      property: 'estimated_demand_mva',
      stops: [
        [{zoom:11, value:0},5],
        [{zoom:11, value:6},10],
        [{zoom:16, value:0},10],
        [{zoom:16, value:6},16]
      ]
    }
  }
  });


});


//tutorial: https://docs.mapbox.com/help/tutorials/building-a-store-locator/

function createPopUp(currentFeature) {
  const popUps = document.getElementsByClassName('mapboxgl-popup');
  /** Check if there is already a popup on the map and if so, remove it */
  if (popUps[0]) popUps[0].remove();

  const popup = new mapboxgl.Popup({ offset: 5, closeOnClick: true })
    .setLngLat(currentFeature.geometry.coordinates)
    .setHTML(`
      <p> <h3> ${currentFeature.properties.name} </h3></p>
      <p> Address: ${currentFeature.properties.address} |
      Fleet Size:  ${currentFeature.properties.fleet_size}  <br>
      Estimated Demand: <strong> ${currentFeature.properties.estimated_demand_mva} MVA </strong> </p>
      `)
    .addTo(map);
};

map.on('mouseenter', 'fleets', function(e) {

  map.getCanvas().style.cursor = 'pointer';

  /* Determine if a feature in the "locations" layer exists at that point. */
  const features = map.queryRenderedFeatures(event.point, {
    layers: ['fleets']
  });

  // /* If it does not exist, return */
  if (!features.length) return;

  /* Close all other popups and display popup for clicked store */
  createPopUp(e.features[0]);

});

map.on('mouseleave', 'fleets', function(e) {
      map.getCanvas().style.cursor = '';
      const popUps = document.getElementsByClassName('mapboxgl-popup');
      /** Check if there is already a popup on the map and if so, remove it */
      if (popUps[0]) popUps[0].remove();
    });
