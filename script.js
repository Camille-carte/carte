// Initialisation de la carte
var map = L.map('map', {
  minZoom: 11,
  maxZoom: 16,
}).setView([48.8566, 2.3522], 12); // Centré sur Paris

const categoryColors = {
  bidonville: '#cc4c4c',
  usine: '#2e86ab',
  a: '#8e44ad',
  a: '#7f8c8d'
};

function createMarker(feature, latlng) {
  const cat = feature.properties.category;
  const color = categoryColors[cat] || '#555';
  const marker = L.circleMarker(latlng, {
    radius: 8,
    fillColor: color,
    color: '#fff',
    weight: 1,
    fillOpacity: 0.8
  });
  marker.bindPopup(`
    <strong>${feature.properties.title}</strong><br/>
    <audio controls src="${feature.properties.audio}" style="width:100%"></audio>
    <p style="margin-top: 0.5em">${feature.properties.text}</p>
  `);
  return marker;
}

    
// Ajout d'un fond de carte OpenStreetMap
L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png', {
  attribution: '&copy; Stamen Design, &copy; OpenStreetMap contributors'
}).addTo(map);

// Ajout des limites du Grand Paris pour ne pas dézoomer à l'infini
map.setMaxBounds([
  [48.5, 1.8], // Sud-Ouest
  [49.2, 3.4]  // Nord-Est
]);

// Création des groupes de filtres
var allMarkers = [];
var layerGroup = L.layerGroup().addTo(map);

// Chargement du GeoJSON
fetch('data/lieux.geojson')
  .then(response => response.json())
  .then(data => {
    data.features.forEach(feature => {
      var props = feature.properties;
      var marker = L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]]);
      marker.bindPopup(
        `<h3>${props.title}</h3>
         <p>${props.text}</p>
         ${props.audio ? `<audio controls autoplay src="${props.audio}"></audio>` : ''}`
      );
      marker.feature = props; // Ajout des propriétés pour filtrer ensuite
      marker.addTo(layerGroup);
      allMarkers.push(marker);
    });

    // Génération automatique des filtres
    createFilters();
  });

function createFilters() {
  const filterContainer = L.control({ position: 'topright' });

  filterContainer.onAdd = function() {
    const div = L.DomUtil.create('div', 'filter-container');
    div.innerHTML = `
      <h4>Filtres</h4>
      <label>Typologie</label><input id="typologie" type="text" placeholder="Ex: Bidonville">
      <label>Période</label><input id="periode" type="text" placeholder="Ex: 1960–1980">
      <label>Cause</label><input id="cause" type="text" placeholder="Ex: Gentrification">
      <label>Devenu</label><input id="etat" type="text" placeholder="Ex: Écoquartier">
      <button id="apply">Appliquer</button>
      <button id="reset">Reset</button>
    `;
    return div;
  };

  filterContainer.addTo(map);

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
