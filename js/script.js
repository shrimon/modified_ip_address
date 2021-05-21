/*******************************************
 * COMMON PAGE ELEMENTS
 * *****************************************/

 const searchForm = document.querySelector("form");
 const searchInput = document.querySelector("#search");
 
 
 
 /*******************************************
  * SETUP LEAFLET/MAPBOX MAP
  * *****************************************/
 
 let mapboxURL = "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw";
 let grayscale = L.tileLayer(mapboxURL, {id: 'mapbox/light-v9', tileSize: 512, zoomOffset: -1, attribution: ""}),
     streets   = L.tileLayer(mapboxURL, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: ""}),
     satellite = L.tileLayer(mapboxURL, {id: 'mapbox/satellite-v9', tileSize: 512, zoomOffset: -1, attribution: ""});
 
 // Store marker object when adding/removing from map
 let customMarker;
 
 // Create custom icon for marker
 let blackLocationMarker = L.icon({
     iconUrl: 'images/icon-location.svg',
     iconSize:     [46, 56],
     iconAnchor:   [22, 94],
 });
 
 // Create the map
 let mymap = L.map('mapid', {
     zoomControl: false,
     layers: [streets]
 }).setView([41.145767, -98.439308], 4);
 
 // Add the base maps as layers
 L.control.layers({
     "Grayscale": grayscale,
     "Streets": streets,
     "Satellite": satellite
 }, "", { position: "bottomright"}).addTo(mymap);
 
 
 
 /*******************************************
  * SETUP FORM/BUTTON EVENT LISTENERS
  * *****************************************/
 
 function searchTracker(event) {
     event.preventDefault();
     let searchValue = searchInput.value.trim();
 
     if (validIPAddress(searchValue)) {
         callIPifyAPI(searchValue);
         return
     }
     if (validDomain(searchValue)) {
         callIPifyAPI(searchValue, "domain");
         return
     }
 
     alert("Please enter a valid Domain or IP Address");
 }
 
 searchForm.addEventListener("submit", searchTracker);
 
 
 
 /*******************************************
  * VALIDATION FUNCTIONS DOMAIN AND IP ADDRESS
  * *****************************************/
 
 function validIPAddress(value) {
     // Regex found at https://www.oreilly.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
     return /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(value);
 }
 
 function validDomain(value) {
     return /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(value);
 }
 
 
 
 /*******************************************
  * TRIGGER IPIFY API AND DISPLAY RESULTS TO PAGE
  * *****************************************/
 
 function callIPifyAPI(value, searchType = "ip") {
     searchQuery = "ipAddress=" + value;
     if (searchType == "domain") {
         searchQuery = searchQuery.replace("ipAddress", "domain");
     }
 
     fetch("https://geo.ipify.org/api/v1?apiKey=at_C92aBZ9a4WqwVYqDlf48yJIFglSNe&" + searchQuery)
         .then(response => {
             if (!response.ok) {
                 throw response.statusText;
             }
             return response.json();
         })
         .then(data => {
             let lng = data.location.lng;
             let lat = data.location.lat;
 
             // Render data to the appropriate label
             document.querySelector("#ipAddress").innerHTML = data.ip;
             document.querySelector("#location").innerHTML = data.location.city + ", " + data.location.region + " " + data.location.postalCode;
             document.querySelector("#timezone").innerHTML = "UTC" + data.location.timezone;
             document.querySelector("#isp").innerHTML = data.isp;
 
             // Move map to new location using lat, long coordinates
             mymap.setView([lat, lng], 15);
             // CustomMarker will be undefined at first page load
             if (customMarker != null) {
                 // Remove marker from map
                 customMarker.remove();
             }
             // Create custom marker and store it for later use.
             // Note: if more than one marker on map, consider a LayerGroup to manage all (mymap.addLayer(customMarker);)
             customMarker = new L.Marker([lat, lng], {icon: blackLocationMarker});
             // Add marker to map
             customMarker.addTo(mymap);
         })
         .catch(error => {
             alert("Something went wrong\n" + error);
         });
 
 }
 
 
 
 /*******************************************
  * GRABBING IP ADDRESS WITH USER'S PERMISSION
  * USING GEOLOCATION API
  * *****************************************/
 
 function userLocationGranted(position) {
     // let lat = position.coords.latitude;
     // let lng = position.coords.longitude;
 
    fetch("https://api.ipify.org?format=json")
         .then(response => {
             if (!response.ok) {
                 throw response.statusText;
             }
             return response.json();
         })
         .then(data => {
             // searchInput.value = data.ip;
             callIPifyAPI(data.ip);
         })
         .catch(error => {
             alert("Something went wrong\n" + error);
         });
 }
 navigator.geolocation.getCurrentPosition(userLocationGranted);