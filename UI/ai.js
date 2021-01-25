const accessToken = 'pk.eyJ1IjoiYm5sbGVlIiwiYSI6ImNqc2p1a2l1YjFhZmo0NHA2bzZmeXU1N2gifQ.tt8a18tTYMgBdvpsuwB4GQ'
const SUBMIT = "submit";

const demoForm = document.getElementById("gps-demo");
const latitudeInput = document.getElementById("latitude");
const longitudeInput = document.getElementById("longitude");


var mymap = L.map('mapid').setView([51.505, -0.09], 20);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: accessToken
}).addTo(mymap);

function handleDemoFormSubmit(event) {
  event.preventDefault();
  const latitudeInputValue = latitudeInput.value;
  const longitudeInputValue = longitudeInput.value;
  if (!latitudeInputValue) {
    alert("Please specify latitude position")
    return;
  }
  if (!longitudeInputValue) {
    alert("Please specify longitude position")
    return;
  }

  const latitude = parseFloat(latitudeInputValue);
  const longitude = parseFloat(longitudeInputValue);

  mymap.setView([latitude, longitude]);
}

demoForm.addEventListener(SUBMIT, handleDemoFormSubmit);