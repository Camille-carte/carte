// Initialiser la carte
var map = L.map('map', {
  zoomControl: false,
  minZoom: 11,
  maxZoom: 16
}).setView([48.8566, 2.3522], 12);

// Fond de carte vectoriel sans labels
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap & CartoDB'
}).addTo(map);

// Limiter la carte au Grand Paris
map.setMaxBounds([
  [48.5, 1.8],
  [49.2, 3.4]
]);

var allMarkers = [];
var layerGroup = L.layerGroup().addTo(map);
var currentAudio = null;

// Charger les données GeoJSON
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
        if (currentAudio) { currentAudio.pause(); currentAudio = null; }
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

// Créer les filtres par période
function createFilters() {
  var checkboxes = document.querySelectorAll('#filters-panel input[type=checkbox]');
  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      applyFilters();
    });
  });
}

// Appliquer les filtres
function applyFilters() {
  var selected = Array.from(document.querySelectorAll('#filters-panel input[type=checkbox]:checked'))
    .map(cb => cb.value);
  layerGroup.clearLayers();
  allMarkers.forEach(marker => {
    var period = marker.feature.periode;
    if (selected.length === 0 || selected.some(sel => period.includes(sel))) {
      marker.addTo(layerGroup);
    }
  });
}
