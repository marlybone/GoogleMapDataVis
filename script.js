let map;
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

/* variables for cost of living API */
let cityName;
let countryName;
let value;
let costs;


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
    'X-RapidAPI-Key': '465cd1dd34msh19e6aab3eb40ec2p172d7djsn2291a31a6271',
		'X-RapidAPI-Host': 'cost-of-living-and-prices.p.rapidapi.com'
	}
};
     var mapOptions = {
     center: myLngLat,
     zoom: 5,
     styles: mapStyle,
   };


/* Event Listeners */
  const select = document.getElementById('census-variable')
  let selected = select.value;
 select.addEventListener('change', () => {
      clearData();
      selected = select.value;
      loadTheData();
    })

  function initMap() {
    map = new google.maps.Map(document.getElementById('map'), mapOptions)
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
        fields: ['name', 'formatted_address', 'geometry', 'rating', 'review'],
        language: 'en'
    }, (place, status) => resolve({ place, status })))));
    places = details.filter(({ status }) => status === google.maps.places.PlacesServiceStatus.OK).map(({ place }) => place);
    sessionStorage.setItem('places', JSON.stringify(places));
  window.open('tourism.html')
}

  var element = document.getElementById('button');
  element.addEventListener('click', function() {
  citySearch();
  searchPlaces();
});
}

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
    <p class='address'>Address: ${obj.formatted_address}</p>
         <div class="swiffy-slider">
  <ul class="slider-container"> 
        ${obj.reviews ? obj.reviews.map(review => `
    <li>
      ${review.author_name ? `<h5 style="max-width: 100%;height: auto;">${review.author_name}</h5>` : ''}
      ${review.text ? `<p>${review.text}</p>` : ''}
      ${review.relative_time_description ? `<h6>${review.relative_time_description}</h6>` : ''}
    </li>
  `).join('') : ''}
    </ul>
    <button type="button" class="slider-nav"></button>
    <button type="button" class="slider-nav slider-nav-next"></button>
    <div class="slider-indicators">
        <button class="active"></button>
        <button></button>
        <button></button>
        </div>
     ${obj.rating ? `
    <div class='rating'>
      <h2>${obj.rating}</h2>
      <i class="fas fa-star" style="color: yellow; -webkit-text-stroke-width: 1px;
    -webkit-text-stroke-color: black;"></i>
    </div>
  ` : ''}
    `;
    container.appendChild(div);
    })
}

/* cost of living function for api data retrieval*/

function livingCost() {
  var re = /^\w+/;

  let input = document.getElementById('country-name');
  value = input.value;

  cityName = value.match(re);
  countryName = value.match(/\b\w+$/)[0];

  fetch(`https://cost-of-living-and-prices.p.rapidapi.com/prices?city_name=${cityName}&country_name=${countryName}`, options)
  .then(res => res.json())
  .then(data => {
    cost = Object.assign({}, data);
    console.log(cost)
  });
}

/* person types in city but the function won't initialise until cost of living drop down is selected

cost of living is selected and types in city name and search button will save values on the inputted city 

then I will need to get the city name and coutry name and put them in different variables

use these two variables to make the get request

present the data on the tourism.html much the same as the tourist attractions
-------------------------------------------------------------------------------
to add - 
*button to increase distance to search tourist attractions - 2.5k - 5k - 10k - 15k
*would like to add city geojson data to highlight city when it has been search and perhaps even revert the map styles to off within the polygon bounds
* cost of living calculator? with values of the citys api data as keys on the keyboard so people can just click the button to add the price of e.g apartment rent, beer etc may be too many things to add though
* more country data things like - inflation / excess covid deaths? gdp growth, birth rate, happiness, life expentancy?
*css improvements and look at efficiency

*/