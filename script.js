
const map = L.map('map').setView([48.8566, 2.3522], 11);
L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap',
  opacity: 0.3
}).addTo(map);

const categoryColors = {
  ouvrier: '#cc4c4c',
  migrant: '#2e86ab',
  industriel: '#8e44ad',
  colonial: '#7f8c8d'
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

let geojsonLayer;
fetch('data/lieux.geojson')
  .then(res => res.json())
  .then(data => {
    geojsonLayer = L.geoJSON(data, {
      pointToLayer: createMarker,
      onEachFeature: function (feature, layer) {
        layer.category = feature.properties.category;
      }
    }).addTo(map);
  });

const checkboxes = document.querySelectorAll('#filters input[type=checkbox]');
checkboxes.forEach(cb => {
  cb.addEventListener('change', () => {
    const active = Array.from(checkboxes)
      .filter(c => c.checked)
      .map(c => c.value);
    geojsonLayer.eachLayer(layer => {
      if (active.includes(layer.category)) {
        layer.setStyle({ opacity: 1, fillOpacity: 0.8 });
        layer.addTo(map);
      } else {
        map.removeLayer(layer);
      }
    });
  });
});
