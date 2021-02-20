const loader = document.getElementById('loader');
const loaderBack = document.getElementById('background_loading');
const weatherImg = document.getElementById('weather');
const weatherTemp = document.getElementById('temperature');
const weatherDes = document.getElementById('description');
const weatherTitle = document.getElementById('desTitle');
const image = document.getElementById('landscape');
const isIn = document.getElementById('isIn');

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
    let dep = document.getElementById('departure').value;

    //checking if the form was empty
    if (des === '' || dep === '') {
        console.log('user enter no input');
        return 'empty';
    }

    //console logging for debug
    console.log(dep);
    console.log(des);

    //spliting the string
    dep = dep.split('-');

    //creating new date object
    const depDate = new Date(dep[0], dep[1], dep[2]);
    //showing loading icon
    showLoading(true);
    //fetching lat and lng from geonames api
    fetch(
        `http://api.geonames.org/searchJSON?q=${des}&maxRows=1&username=garyelcrack`
    )
        //handeling response as json
        .then((response) => response.json())
        .then((data) => {
            //reciving city country lat and lng
            console.log(data);

            const country = data.geonames[0].countryName;
            const countryCode = data.geonames[0].countryCode;
            const lat = data.geonames[0].lat;
            const lng = data.geonames[0].lng;
            console.log(country, lat, lng);

            //calling the get image function
            getImage(country, countryCode, lat, lng, depDate);
        });
}

//-------------------------------------------------------------//

//getting image from pixabay api
function getImage(country, countryCode, lat, lng, depDate) {
    console.log('Fetching pixabay');

    const key = '20301277-4d7b37531e70ff2cdc2a73b79';

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

            //cheking if it's going to display current or predicted weather
            const decision = current(depDate);
            if (decision === true) {
                console.log('get current weather');
                fetchCurrentWeather(lat, lng, country, countryCode, img);
            } else if (decision === false) {
                console.log('get predicted weather');
            } else if (decision === 'missed') {
                console.log('you missed your flight');
            }
        });
}

//-------------------------------------------------------------//
function fetchCurrentWeather(lat, lng, country, countryCode, img) {
    console.log('fetching');

    const keyAPI = '3a66ac00d89042c29498022e4cbac050';
    fetch(
        `https://api.weatherbit.io/v2.0/current?lat=${lat}&lon=${lng}&key=${keyAPI}`
    )
        //handling response
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            //getting temperature icon description and city
            let city = data.data[0].city_name;
            let temperature = data.data[0].temp;
            let icon = data.data[0].weather.icon;
            let description = data.data[0].weather.description;
            console.log(city, temperature, icon, description);

            //hide loading icon
            showLoading(false);

            const isInTime = 'less than 7 days';
            //updating ui
            updateUI(
                icon,
                description,
                temperature,
                city,
                country,
                countryCode,
                isInTime,
                img
            );
        });
}
//-------------------------------------------------------------//
function fetchFutureWeather(lat, lng, country, countryCode) {
    console.log('fetching');

    const keyAPI = '3a66ac00d89042c29498022e4cbac050';
    fetch(
        `https://api.weatherbit.io/v2.0/current?lat=${lat}&lon=${lng}&key=${keyAPI}`
    )
        //handling response
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            /*
            //getting temperature icon description and city
            let city = data.data[0].city_name;
            let temperature = data.data[0].temp;
            let icon = data.data[0].weather.icon;
            let description = data.data[0].weather.description;
            console.log(city, temperature, icon, description);

            //hide loading icon
            showLoading(false);

            const isInTime = 'more than a week';
            //updating ui
            updateUI(
                icon,
                description,
                temperature,
                city,
                country,
                countryCode,
                isInTime
            );*/
        });
}
//-------------------------------------------------------------//

//function that updates the UI with icon description temperature and location
function updateUI(
    icon,
    description,
    temperature,
    city,
    country,
    countryCode,
    isInTime,
    img
) {
    image.src = img;
    isIn.innerHTML = isInTime;
    weatherImg.src = `../styles/svg/${icon}.svg`;
    weatherDes.innerHTML = `${description}`;
    weatherTemp.innerHTML = `${Math.round(temperature)}°C`;
    //if the country + city are more than 18 charecters
    //it will show the country code
    if (country.length + city.length > 19) {
        weatherTitle.innerHTML = `${city} ${countryCode}`;
    } else {
        weatherTitle.innerHTML = `${city} ${country}`;
    }
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

export {
    showLoading,
    current,
    updateUI,
    fetchCurrentWeather,
    fetchFutureWeather,
    getImage,
    getcoordinates,
};
