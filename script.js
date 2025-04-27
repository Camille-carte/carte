
// Initialiser la carte
var map = L.map('map', {
  zoomControl: false,
  minZoom: 11,
  maxZoom: 16
}).setView([48.8566, 2.3522], 12);

// Fond de carte vectoriel sans labels
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
}).addTo(map);

const introText = `
  <p>Cette carte propose une lecture du Grand Paris à travers les sons disparus entre 1959 et 2025. Elle s’intéresse aux paysages sonores effacés ou transformés, envisagés comme témoins des mutations sociales, politiques et spatiales. Ces sons ont peu à peu quitté l’espace urbain, emportés par des processus d’effacement volontaire, de reconfiguration spatiale ou de mise au silence normative. 
En sélectionnant des lieux précis, la carte explore la dimension politique du sonore : ce que l’on est autorisé à entendre, ce qui doit être tu, ce qui devient inaudible. Chaque point de la carte donne accès à un extrait sonore accompagné d’un texte bref, contextualisant la disparition, les logiques à l’œuvre, et la situation actuelle du lieu. Ces fragments doivent être entendus non comme des objets de nostalgie, mais comme des traces, comme un vecteur de mémoire, d’existence sociale.
Le silence qui les remplace s’inscrit dans l’avènement d’un idéal urbain pacifié, une ville contrôlée, propre, tranquille, qui exclut ce qui déborde, dérange.
Cette cartographie n’est pas figée. Elle est pensée comme un support évolutif, susceptible d’être enrichi au fil du temps par d’autres sons effacés, d’autres récits, d’autres lieux. Elle invite à poursuivre l’enquête, à écouter autrement, à documenter ce qui disparaît encore.</p>
`;


// Afficher le texte d'intro au début
document.getElementById('info-text').innerHTML = introText;

var allMarkers = [];
var layerGroup = L.layerGroup().addTo(map);

// Limiter la carte au Grand Paris
map.setMaxBounds([
  [48.5, 1.8],
  [49.2, 3.4]
]);

var allMarkers = [];
var layerGroup = L.layerGroup().addTo(map);
var currentAudio = null;

// Charger les données des lieux
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
        if (props.audio) {
          var audio = new Audio(props.audio);
          audio.play();
        }
        document.getElementById('info-text').innerHTML = `
          <h3>${props.title}</h3>
          <p>${props.text}</p>
        `;
      });
      
      marker.feature = props; // Stocke les propriétés pour le filtrage
      marker.addTo(layerGroup);
      allMarkers.push(marker);
    });

    createFilters();
  });


// Créer les filtres
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
    .map(cb => cb.id.replace('filter-', '')); // Récupère les périodes cochées

  layerGroup.clearLayers();

  allMarkers.forEach(marker => {
    var periode = marker.feature.periode;
    if (selected.length === 0 || selected.some(sel => periode.includes(sel))) {
      marker.addTo(layerGroup);
    }
  });
}

// Ajouter un événement pour reset sur le titre
window.onload = function() {
  document.getElementById('page-title').addEventListener('click', function() {
    document.getElementById('info-text').innerHTML = introText;
  });
};
