var APIKEY = 'AIzaSyC75kqs_RD694ILnPBt0cOAsyzQwpSBfaU';
const myLngLat = {lat: 51.4931, lng: -0.118092};
var polygonData = 'https://s3.amazonaws.com/rawstore.datahub.io/23f420f929e0e09c39d916b8aaa166fb.geojson';
var mapStyle = [{
          'featureType': 'all',
          'elementType': 'all',
          'stylers': [{'visibility': 'off'}]
        }, {
          'featureType': 'landscape',
          'elementType': 'geometry',
          'stylers': [{'visibility': 'on'}, {'color': '#fcfcfc'}]
        }, {
          'featureType': 'water',
          'elementType': 'labels',
          'stylers': [{'visibility': 'off'}]
        }, {
          'featureType': 'water',
          'elementType': 'geometry',
          'stylers': [{'visibility': 'on'}, {'hue': '#5f94ff'}, {'lightness': 60}]
        }];



  function initMap() {
     var options = {
     center: myLngLat,
     zoom: 5,
     styles: mapStyle,
   };
  
  var map = new google.maps.Map(document.getElementById('map'), options)
  var marker = new google.maps.Marker({
    position: myLngLat,
    map:map,
    draggable: false
  });

  map.data.loadGeoJson(polygonData);
   map.data.setStyle({
    fillColor: 'green',
    strokeWeight: 0.7,
    strokeColor: 'white',
    strokeOpacity: 0.4
   });
  map.data.addListener('click', function(e) {
    searchLocation = (e.feature.getProperty('ISO_A3').slice(0, 2));
    fetchMapOverlapData();
  });
    map.data.addListener('mouseover', function(e) {
      map.data.overrideStyle(e.feature, {strokeWeight: 2.5, strokeOpacity: 1})
    map.data.addListener('mouseout', function(e) {
      map.data.overrideStyle(e.feature, {strokeWeight: 0.7, strokeOpacity: 0.4})
    });
      });
    map.data.addListener('click', function(e) {
    lat = e.latLng.lng();
    lng = e.latLng.lat();
});
  
  const input = document.getElementById('country-name');
  const autoComplete = new google.maps.places.Autocomplete(input, cityOptions);
  autoComplete.bindTo("bounds", map);
  
  autoComplete.addListener('place_changed', () => {
    var place = autoComplete.getPlace();
    if (place.geometry) {
      marker.setPosition(place.geometry.location);
      map.setCenter(place.geometry.location);
      lat = place.geometry.location.lat();
      lng = place.geometry.location.lng();
      latLong = ({ lat, lng });
    }
  });
    
async function searchPlaces() {
    const service = new google.maps.places.PlacesService(map);
    const { results, status } = await new Promise(resolve => service.nearbySearch({
        location: latLong,
        radius: 5000,
        type: 'tourist_attraction'
    }, (results, status) => resolve({ results, status })));

    if (status !== google.maps.places.PlacesServiceStatus.OK) return;

    const details = await Promise.all(results.map(result => new Promise(resolve => service.getDetails({
        placeId: result.place_id,
        fields: ['name', 'formatted_address', 'geometry', 'photos', 'rating', 'url', 'review'],
        language: 'en'
    }, (place, status) => resolve({ place, status })))));
    places = details.filter(({ status }) => status === google.maps.places.PlacesServiceStatus.OK).map(({ place }) => place);
    console.log('done');
    sessionStorage.setItem('places', JSON.stringify(places));
    window.open('tourism.html');
}

    
  var element = document.getElementById('button');
  element.addEventListener('click', function() {
  citySearch();
  searchPlaces();
});
}


/* variables to contribute to marker and city location for API retrieval*/
var lat = ''; 
var lng = '';
var place = '';
var cityInput = '';
var latLong = '';

/* Variable to assist with click event to get the countries ISO code*/
var searchLocation;
var stat = '';
var geo = '';


/* Variables to assist with autocomplete city name in the search bar*/
var searchInput = '';
const cityOptions = {
  types: ['(cities)'],
  strickBounds: false,
}


/* PlacesSearch function*/ 
var mapDiv = document.getElementById('map');
var mapOptions = {
  center: myLngLat,
  zoom: 6,
  styles: mapStyle
};
let places = [];



/* API key for RapidAPI*/
const options = {
	method: 'GET',
	headers: {
    'X-RapidAPI-Key': '3dcd448ec1msh2b4f01bc724171fp1ee5bdjsn24e082f33ce9',
		'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
	}
};

/* API to fetch data from GEOGB cities */
function fetchMapOverlapData() {
    fetch(`https://wft-geo-db.p.rapidapi.com/v1/geo/countries/${searchLocation}`, options)
  .then(res => res.json())
  .then(data => {
  console.log(searchLocation);
  stat = data;
  })
}

/* function to get the value of the city and then only get the first word of the city */
function citySearch() {
 searchInput = document.getElementById('country-name').value;
  cityInput = searchInput.match(/\b\w+/);
    fetchCityData();
}

/* Another API call to geoDB to get the data for the specific city */
function fetchCityData() {
  fetch(`https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${cityInput}&types=CITY`, options)
	.then(response => response.json())
	.then(response => console.log(response))
	.catch(err => console.error(err));
}

function createBoxes(data) {
  const container = document.querySelector("#container");
    data.forEach(obj => {
    let div = document.createElement('div');
    div.classList.add('box');
    div.innerHTML = `
    <h1>${obj.name}</h1>
    <h4>Address: ${obj.formatted_address}</h3>
    <div>
    <h5>${obj.reviews[0].author_name}</h5>
    <p>${obj.reviews[0].text}</p>
    </div>
    <div class='rating'>
    <h2>${obj.rating}</h2>
    <i class="fas fa-star" style="color: yellow;"></i>
    </div
    `;
    container.appendChild(div);
    })
}