// Initialisation de la carte
var map = L.map('map', {
  minZoom: 11,
  maxZoom: 16
}).setView([48.8566, 2.3522], 12);

// Fond de carte sombre, style blueprint
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap & CartoDB'
}).addTo(map);

// Limiter le déplacement hors Grand Paris
map.setMaxBounds([
  [48.5, 1.8],
  [49.2, 3.4]
]);

var allMarkers = [];
var layerGroup = L.layerGroup().addTo(map);
var currentAudio = null;

// Charger le GeoJSON
fetch('data/lieux.geojson')
  .then(response => response.json())
  .then(data => {
    data.features.forEach(feature => {
      var props = feature.properties;
      var marker = L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
        radius: 6,
        color: 'white',
        fillColor: 'white',
        fillOpacity: 1
      });
      marker.on('click', function() {
        if (currentAudio) {
          currentAudio.pause();
          currentAudio = null;
        }
        if (props.audio) {
          currentAudio = new Audio(props.audio);
          currentAudio.play();
        }
        document.getElementById('info-text').innerHTML = `<h3>${props.title}</h3><p>${props.text}</p>`;
      });
      marker.feature = props;
      marker.addTo(layerGroup);
      allMarkers.push(marker);
    });

    createFilters();
  });

// Créer les filtres croiser
function createFilters() {
  document.getElementById('apply').onclick = function() {
    var typologie = document.getElementById('typologie').value.toLowerCase();
    var periode = document.getElementById('periode').value.toLowerCase();
    var cause = document.getElementById('cause').value.toLowerCase();
    var etat = document.getElementById('etat').value.toLowerCase();

    layerGroup.clearLayers();
    allMarkers.forEach(marker => {
      var match = true;
      if (typologie && !marker.feature.typologie.toLowerCase().includes(typologie)) match = false;
      if (periode && !marker.feature.periode.toLowerCase().includes(periode)) match = false;
      if (cause && !marker.feature.cause.toLowerCase().includes(cause)) match = false;
      if (etat && !marker.feature.etat.toLowerCase().includes(etat)) match = false;
      if (match) marker.addTo(layerGroup);
    });
  };

  document.getElementById('reset').onclick = function() {
    layerGroup.clearLayers();
    allMarkers.forEach(marker => marker.addTo(layerGroup));
    document.getElementById('typologie').value = '';
    document.getElementById('periode').value = '';
    document.getElementById('cause').value = '';
    document.getElementById('etat').value = '';
  };
}
