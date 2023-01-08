var APIKEY = 'AIzaSyC75kqs_RD694ILnPBt0cOAsyzQwpSBfaU';
const myLngLat = {lat: 51.4931, lng: -0.118092};
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

let min = Number.MAX_VALUE;
let max = -Number.MAX_VALUE;
let variable;
let countryData;
let map;
let admin;

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

    map.data.setStyle(styleFeature);
    map.data.addListener("mouseover", mouseInToRegion);
    map.data.addListener("mouseout", mouseOutOfRegion);

    google.maps.event.addListenerOnce(map.data, "addfeature", () => {
    google.maps.event.trigger(
      document.getElementById("census-variable"),
      "change"
    );
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
    loadMapShapes();
}

async function loadMapShapes() { map.data.loadGeoJson('https://s3.amazonaws.com/rawstore.datahub.io/23f420f929e0e09c39d916b8aaa166fb.geojson', { idPropertyName: "ISO_A3" });

   map.data.addListener('click', function(e) {
    searchLocation = (e.feature.getProperty('ISO_A3').slice(0, 2));
    fetchMapOverlapData();
  });
    map.data.addListener('click', function(e) {
    lat = e.latLng.lng();
    lng = e.latLng.lat();
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

function loadTheData() {
    fetch('data.csv')
      .then(res => res.text())
      .then(data => {
        const rows = data.split(/\r?\n/).map(row => {
        if (row.includes('"')) {
        return row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      }
        else {
        return row.split(',');
  }      
});
        console.log(rows)
        const rowss = rows.filter(rows => rows.includes(selected));
        countryData = rowss.map(row => ({ index11: parseFloat(Number(row[12]).toFixed(2)), index0: row[1]})).filter(element => !isNaN(element.index11)); 

        countryData.forEach((row) => {
          if(row.index11 < min) {
            min = Math.floor(row.index11);
          }
          if(row.index11 > max) {
            max = Math.ceil(row.index11);
          }
        document.getElementById('census-min').textContent =
          min.toLocaleString();
        document.getElementById('census-max').textContent =
          max.toLocaleString();
       const admin = map.data.getFeatureById(row.index0)
        if (admin) {
          admin.setProperty('census_variable', row.index11)
          console.log(admin)
        }
        });
      });
  }

/* function to clear the date and return values back to default*/
function clearData(){
      min = Number.MAX_VALUE;
      max = -Number.MAX_VALUE;

      map.data.forEach((row) =>{
        row.setProperty('census_variable', undefined);       
      });
      document.getElementById('data-box').style.display = 'none';
      document.getElementById("data-caret").style.display = "none";
}

/*function to connect colors to data and styles*/
function styleFeature(feature) {
  const low = [5, 69, 54];
  const high = [151, 83, 34];

  const delta =
    (feature.getProperty("census_variable") - min) /
    (max - min);
  const color = [];

  for (let i = 0; i < 3; i++) {
    color.push((high[i] - low[i]) * delta + low[i]);
  }

  let showRow = true;

  if (
    feature.getProperty("census_variable") == null ||
    isNaN(feature.getProperty("census_variable"))
  ) {
    showRow = false;
  }

  let outlineWeight = 0.5,
    zIndex = 1;

  if (feature.getProperty("admin") === "hover") {
    outlineWeight = zIndex = 2;
  }
  return {
    strokeWeight: outlineWeight,
    strokeColor: "#fff",
    zIndex: zIndex,
    fillColor: "hsl(" + color[0] + "," + color[1] + "%," + color[2] + "%)",
    fillOpacity: 0.75,
    visible: showRow,
  };
}
/*function to present country name, data in the vat value when hovering over*/
function mouseInToRegion(e) {
  e.feature.setProperty("admin", "hover");
  const percent =
    ((e.feature.getProperty("census_variable") - min) /
      (max - min)) *
    100;

 document.getElementById("data-label").textContent =
    e.feature.getProperty("ADMIN");
  document.getElementById("data-value").textContent = e.feature
    .getProperty("census_variable")
    .toLocaleString();
  document.getElementById("data-box").style.display = "block";
  document.getElementById("data-caret").style.display = "block";
  document.getElementById("data-caret").style.paddingLeft = percent + "%";
}

/*return to normal on mouse out.*/
function mouseOutOfRegion(e) {
  e.feature.setProperty("admin", "normal");
}
  

/*

cost of living is selected and types in city name and search button will save values on the inputted city - 

then I will need to get the city name and coutry name and put them in different variables

use these two variables to make the get request

present the data on the tourism.html much the same as the tourist attractions
-------------------------------------------------------------------------------
to add - 
*button to increase distance to search tourist attractions - 2.5k - 5k - 10k - 15k
* add a table with cost of living data
*css improvements and look at efficiency

*/