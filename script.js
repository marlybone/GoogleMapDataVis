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


/* variables to contribute to marker and city location for API retrieval*/
var lat = ''; 
var lng = '';
var cityInput;



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

const options = {
	method: 'GET',
	headers: {
    'X-RapidAPI-Key': '3dcd448ec1msh2b4f01bc724171fp1ee5bdjsn24e082f33ce9',
		'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
	}
};

function fetchMapOverlapData() {
    fetch(`https://wft-geo-db.p.rapidapi.com/v1/geo/countries/${searchLocation}`, options)
  .then(res => res.json())
  .then(data => {
  console.log(searchLocation);
  stat = data;
  console.log(stat)
  })
}

function citySearch() {
 searchInput = document.getElementById('country-name').value;
}

function fetchCityData() {
  fetch(`https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${cityInput}&types=CITY`, options)
	.then(response => response.json())
	.then(response => console.log(response))
	.catch(err => console.error(err));
}

function isItNegative(num) {
  var prefix = '';
    if(num > 0){
     prefix = ' ';
  }
  return prefix+num;
}