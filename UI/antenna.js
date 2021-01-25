// attach this inner html to an element and add antenna.js
const antennaInnerHtml = `<svg width="100%" height="100%" viewBox="0 0 100 100"  xmlns="http://www.w3.org/2000/svg" >
          <style>
            .small { font: 3px sans-serif; }
          </style>
          <defs>
            <marker id="arrowhead" markerWidth="3" markerHeight="3" refX="0" refY="1.5" orient="auto">
              <polygon points="0 0, 3 1.5, 0 3" fill="white"  />
            </marker>
          </defs>

          <!-- For debugging purposes, rectangle displays viewbox -->
          <rect x="0" y="0" width="100" height="100" opacity="0.5"></rect>

          <!-- Azimuth Position -->
          <text x="15%", y="20%", class="small" id="azimuth-text">Azimuth: 270°</text>

          <g>
            <circle cx="25%" cy="50%" r="20%" fill="blue" />
            <g id="azimuth-gps-arrow" transform="rotate(270, 25, 50)">
              <line x1="25%" y1="65%" x2="25%" y2="40%" stroke="white" stroke-width="1.5" marker-end="url(#arrowhead)" />
            </g>
            <g transform="rotate(0, 25, 50)">
              <circle cx="25%" cy="30%" r="1%" />
              <text x="23.7" y="28" class="small">0</text>
            </g>
            <g transform="rotate(30, 25, 50)">
              <circle cx="25%" cy="30%" r="1%" />
              <text x="23.7" y="28" class="small">30</text>
            </g>
            <g transform="rotate(60, 25, 50)">
              <circle cx="25%" cy="30%" r="1%" />
              <text x="23.7" y="28" class="small">60</text>
            </g>
            <g transform="rotate(90, 25, 50)">
              <circle cx="25%" cy="30%" r="1%" />
              <text x="23.7" y="28" class="small">90</text>
            </g>
            <g transform="rotate(120, 25, 50)">
              <circle cx="25%" cy="30%" r="1%" />
              <text x="22.7" y="28" class="small">120</text>
            </g>
            <g transform="rotate(150, 25, 50)">
              <circle cx="25%" cy="30%" r="1%" />
              <text x="22.7" y="28" class="small">150</text>
            </g>
            <g transform="rotate(180, 25, 50)">
              <circle cx="25%" cy="30%" r="1%" />
              <text x="22.7" y="28" class="small">180</text>
            </g>
            <g transform="rotate(210, 25, 50)">
              <circle cx="25%" cy="30%" r="1%" />
              <text x="22.7" y="28" class="small">210</text>
            </g>
            <g transform="rotate(240, 25, 50)">
              <circle cx="25%" cy="30%" r="1%" />
              <text x="22.7" y="28" class="small">240</text>
            </g>
            <g transform="rotate(270, 25, 50)">
              <circle cx="25%" cy="30%" r="1%" />
              <text x="22.7" y="28" class="small">270</text>
            </g>
            <g transform="rotate(300, 25, 50)">
              <circle cx="25%" cy="30%" r="1%" />
              <text x="22.7" y="28" class="small">300</text>
            </g>
            <g transform="rotate(330, 25, 50)">
              <circle cx="25%" cy="30%" r="1%" />
              <text x="22.7" y="28" class="small">330</text>
            </g>
          </g>

          <!-- Elevation Position -->
          <text x="65%", y="20%", class="small" id="elevation-text">Elevation: 30°</text>

          <g>
            <circle cx="75%" cy="50%" r="20%" fill="blue" />
            <g id="elevation-gps-arrow" transform="rotate(-30, 75, 50)">
              <line x1="60%" y1="50%" x2="85%" y2="50%" stroke="white" stroke-width="1.5" marker-end="url(#arrowhead)" />
            </g>
            <g transform="rotate(-0, 75, 50)">
              <circle cx="95%" cy="50%" r="1%" />
              <text x="97" y="51" class="small">0</text>
            </g>
            <g transform="rotate(-30, 75, 50)">
              <circle cx="95%" cy="50%" r="1%" />
              <text x="97" y="51" class="small">30</text>
            </g>
            <g transform="rotate(-60, 75, 50)">
              <circle cx="95%" cy="50%" r="1%" />
              <text x="97" y="51" class="small">60</text>
            </g>
            <g transform="rotate(-90, 75, 50)">
              <circle cx="95%" cy="50%" r="1%" />
              <text x="97" y="51" class="small">90</text>
            </g>
          </g>
        </svg>
        <h1>Testing GPS UI! </h1>
        <form id="GPS-test-form">
          <label for="azimuth">Azimuth</label>
          <input type="number" name="azimuth" id="azimuth" value="270">
          <label for="elevation">Elevation</label>
          <input type="number" name="elevation" id="elevation" value="30">
          <input type="submit" value="Set!">
        </form>
`
const SUBMIT = "submit";
const TRANSFORM = "transform";
const GPSTestForm = document.getElementById("GPS-test-form");
const azimuthInput = document.getElementById("azimuth");
const azimuthArrow = document.getElementById("azimuth-gps-arrow");
const azimuthArrowRotateOrigin = { x: 25, y: 50};
const azimuthText = document.getElementById("azimuth-text")
const elevationInput = document.getElementById("elevation");
const elevationArrow = document.getElementById("elevation-gps-arrow");
const elevationArrowRotateOrigin = { x: 75, y: 50 };
const elevationText = document.getElementById("elevation-text")

function GPSText(measurement, angle) {
  return `${measurement}: ${angle}°`;
}

function rotate(element, angle, x, y) {
  element.setAttribute(TRANSFORM, `rotate(${angle}, ${x}, ${y})`)
}

function handleGPSTestFormSubmit(event) {
  event.preventDefault();
  const azimuthInputValue = azimuthInput.value;
  const elevationInputValue = elevationInput.value;
  if (!azimuthInputValue) {
    alert("Please specify azimuth position")
    return;
  }
  if (!elevationInputValue) {
    alert("Please specify elevation position")
    return;
  }

  const azimuth = parseFloat(azimuthInputValue);
  const elevation = parseFloat(elevationInputValue);
  rotate(azimuthArrow, azimuth, azimuthArrowRotateOrigin.x, azimuthArrowRotateOrigin.y);
  rotate(elevationArrow, -elevation, elevationArrowRotateOrigin.x, elevationArrowRotateOrigin.y);
  azimuthText.textContent = GPSText('Azimuth', azimuthInputValue);
  elevationText.textContent = GPSText('Elevation', elevationInputValue);
}

GPSTestForm.addEventListener(SUBMIT, handleGPSTestFormSubmit);
