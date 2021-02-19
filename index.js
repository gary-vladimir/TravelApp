const loader = document.getElementById('loader');
const loaderBack = document.getElementById('background_loading');
const weatherImg = document.getElementById('weather');
const weatherTemp = document.getElementById('temperature');
const weatherDes = document.getElementById('description');
const weatherTitle = document.getElementById('desTitle');
const image = document.getElementById('landscape');

//get current date
let time = new Date();
let year = time.getFullYear();
let month = time.getMonth();
let day = time.getDate();

let date = new Date(year, month + 1, day);

//-------------------------------------------------------------//

//start by getting the coordinates
function getcoordinates(event) {
    //preventing default
    event.preventDefault();

    //getting user input
    const des = document.getElementById('destination').value;
    const departure = document.getElementById('departure').value;

    //checking if the form was empty
    if (des === '' || departure === '') {
        console.log('user enter no input');
        return 'empty';
    }

    //spliting date
    const depArr = departure.split('/');

    //creating a Date object with the user input values
    const depDate = new Date(depArr[2], depArr[1], depArr[0]);

    //console logging for debug
    console.log(depArr);
    console.log(des);
    console.log(departure);

    //showing loading icon
    showLoading(true);
    //fetching lat and lng from geonames api
    fetch(`http://api.geonames.org/searchJSON?q=${des}&maxRows=1&username=`)
        //handeling response as json
        .then((response) => response.json())
        .then((data) => {
            //reciving city country lat and lng
            const city = data.geonames[0].name;
            const country = data.geonames[0].countryName;
            const lat = data.geonames[0].lat;
            const lng = data.geonames[0].lng;
            console.log(city, country, lat, lng);
            //calling the get image function
            getImage(city, country, lat, lng, depDate);
        });
}

//-------------------------------------------------------------//

//getting image from pixabay api
function getImage(city, country, lat, lng, depDate) {
    console.log('Fetching pixabay');

    const key = '';

    //fetching pixabay image
    fetch(
        `https://pixabay.com/api/?key=${key}&q=${country}&orientation=horizontal&category=buildings&per_page=3`
    )
        //handling response
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            const img = data.hits[0].webformatURL;
            console.log(img);
            image.src = img;

            //cheking if it's going to display current or predicted weather
            const decision = current(depDate);
            if (decision === true) {
                console.log('get current weather');
                fetchCurrentWeather(lat, lng, city, country);
            } else if (decision === false) {
                console.log('get predicted weather');
            } else if (decision === 'missed') {
                console.log('you missed your flight');
            }
        });
}

//-------------------------------------------------------------//
function fetchCurrentWeather(lat, lng, city, country) {
    console.log('fetching');

    const keyAPI = '';
    fetch(
        `https://api.weatherbit.io/v2.0/current?lat=${lat}&lon=${lng}&key=${keyAPI}`
    )
        //handling response
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            let temperature = data.data[0].temp;
            let icon = data.data[0].weather.icon;
            let description = data.data[0].weather.description;
            console.log(temperature, icon, description);
            showLoading(false);

            //updating ui
            weatherImg.src = `svg/${icon}.svg`;
            weatherDes.innerHTML = `${description}`;
            weatherTemp.innerHTML = `${Math.round(temperature)}°C`;
            weatherTitle.innerHTML = `${city} ${country}`;
        });
}
//-------------------------------------------------------------//

//function that checks if
//the trip is within a week
function current(depDate) {
    if (depDate < date) {
        return 'missed';
        //604800000 is 7 days in milliseconds
    } else if (depDate - 604800000 <= date) {
        return true;
    } else {
        return false;
    }
}

//-------------------------------------------------------------//

//function that shows loading icon
function showLoading(userInput) {
    if (userInput) {
        loaderBack.style.display = 'block';
        loader.style.display = 'block';
    } else {
        loaderBack.style.display = 'none';
        loader.style.display = 'none';
    }
}

//-------------------------------------------------------------//
