// API URL link for occupancy
const VERGE_API_URL = 'https://verge-api.vergebi.com/v2/api/lots/occupancy?lotIds=379,385,386,387,388';

const INFOPANEL = document.getElementById('infoPanel');
let currentFeature = null;

// Start loading effect - assuming you keep the structure where <span> is inside <p> without moving the IDs
function loadingEffect() {
    // Ensure this targets spans within the specific occupancy IDs
    const spans = document.querySelectorAll('.occupancy-grid p span');
    spans.forEach(span => {
        let tens = 0;  // Represents the tens place
        let units = 0; // Represents the units place

        span.textContent = "00"; // Set initial value to "00"
        span.loadingInterval = setInterval(() => {
            units = (units + 1) % 10; // Increment units place, wrap around at 10
            tens = (tens + 1) % 10;  // Increment tens place, wrap around at 10

            span.textContent = `${tens}${units}`; // Update text to reflect new numbers
        }, 5);
    });
}

function stopLoadingEffect(category) {
    // Make sure this targets the correct span
    const span = document.querySelector(`#${category} span`);
    if (span && span.loadingInterval) {
        clearInterval(span.loadingInterval);
    } else {
        console.error("Failed to find span or loadingInterval for category:", category);
    }
}

// Function to fetch JSON data
async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.statusText);
    }
    const data = await response.json();
    console.log("API Data:", data);  // Log to see the data structure
    return data;
}

// Function to calculate parking availability based on the Verge API data
function calculateParkingAvailability(data, currentFeatureTitle) {
    let general = 'N/A', ev = 'N/A', ada = 'N/A';
    for (const key in data) {
        const lots = data[key];
        const lot = lots.find(lot => lot.title === currentFeatureTitle);
        if (lot) {
            general = lot.total_public_parking - lot.occupied_public_parking;
            const evGroup = lot.group.find(g => g.name === 'EV');
            if (evGroup) {
                ev = evGroup.quantityOfSensors - evGroup.quantityOfOccupied;
            }
            const adaGroup = lot.group.find(g => g.name === 'ADA');
            if (adaGroup) {
                ada = adaGroup.quantityOfSensors - adaGroup.quantityOfOccupied;
            }
            break; // Break as soon as the correct lot is found
        }
    }
    console.log("Calculated Availability:", {general, ev, ada});
    return { general, ev, ada };
}

// Function to update parking availability in the DOM
async function fetchAndUpdateAvailability(shouldShowLoading = true) {
    if (shouldShowLoading) {
        loadingEffect();  // Start the slot machine effect for each digit
    }

    const response = await fetchJson(VERGE_API_URL);
    const data = response.data;  // Ensure 'data' is correctly accessed
    const { general, ev, ada } = calculateParkingAvailability(data, currentFeature.properties.Title);

    document.getElementById('generalOccupancy').innerHTML = `<span>${general}</span><br>General`;
    stopLoadingEffect('generalOccupancy');

    document.getElementById('evOccupancy').innerHTML = `<span>${ev}</span><br>EV`;
    stopLoadingEffect('evOccupancy');

    document.getElementById('adaOccupancy').innerHTML = `<span>${ada}</span><br>ADA`;
    stopLoadingEffect('adaOccupancy');
}

// Function to update info panel and show elements
function updateInfoPanel(feature) {
    if (!feature || !feature.properties) {
        console.error("Invalid feature or missing properties:", feature);
        return; // Stop execution if feature is not correctly defined
    }

    currentFeature = feature;

    updateTitle(feature);
    updateImage(feature);
    updateAddress(feature);
    updateRatesAndTimes(feature);
    updateApps(feature);
    updateIconsAndAmenities(feature);

    console.log("Feature set in updateInfoPanel:", feature);
    fetchAndUpdateAvailability(); // Fetch data after setting currentFeature
    INFOPANEL.style.display = 'block';
}


// Change Title text in infopanel with data properties from layers
function updateTitle(feature) {
    const titleElement = document.getElementById('TitleText');
    const availabilityElement = document.querySelector('.Availability');

    if (titleElement) {
        let titleText = feature.properties.Title;
        if (['on-street-parking', 'on-street-parking-no-sensor', 'on-street-ADA'].includes(feature.layer.id)) {
            titleText += ' On-Street Parking';
            availabilityElement.style.display = 'none'; // Hide availability section
        } else {
            availabilityElement.style.display = 'block'; // Show availability section
        }
        titleElement.textContent = titleText;
    }
}

// Change image of each location based on title and URL path
function updateImage(feature) {
    const parkingImage = document.getElementById('parkingImage');
    parkingImage.src = feature.properties.Title ? `/img/${feature.properties.Title}.jpg` : '/img/PlaceHolder.png';
    parkingImage.onerror = function () {
        this.src = '/img/PlaceHolder.png';
    };
}

// Change the address text with the data property
function updateAddress(feature) {
    const addressTextElement = document.getElementById('AddressText');
    const directionButtonLink = document.getElementById('AddressButton');
    const latitude = feature.geometry.coordinates[1];
    const longitude = feature.geometry.coordinates[0];
    const mapLink = `http://maps.apple.com/?q=${latitude},${longitude}`;

    if (addressTextElement) {
        addressTextElement.textContent = feature.properties.Address;
        addressTextElement.href = mapLink;
    }

    if (directionButtonLink) {
        directionButtonLink.href = mapLink;
    }
}

function updateRatesAndTimes(feature) {
    const ratesElement = document.querySelector('.ParkingInfo p');
    const rate = feature.properties.Rate;
    const maxTime = feature.properties.MaxTime;
    const openTime = feature.properties.OpenTime;
    const noParking = feature.properties.NoParking;

    if (ratesElement) {
        if (['ftl-charging-stations'].includes(feature.layer.id)) {
            ratesElement.innerHTML = `
                $${rate} an hour<br><hr>
                Max Stay: ${maxTime}<br><hr>
                Open: ${openTime}<br><hr>
                No Parking: ${noParking}<br><hr>
                EV Parking spaces must use ParkMobile for parking payment.
            `;
        } else {
            const residentRate = Math.min((feature.properties.ResidentRate || rate / 2), 1.50);
            ratesElement.innerHTML = `
                $${rate} an hour<br><hr>
                Max Stay: ${maxTime}<br><hr>
                Open: ${openTime}<br><hr>
                No Parking: ${noParking}<br><hr>
                Exact Payment Only.<br><hr>
                <em>Resident rate available only on PayByPhone: $${residentRate} per hour</em>
            `;
        }
    }
}

function updateApps(feature) {
    updateAppVisibility('#appPayByPhone', '#PayByPhoneLocation', feature.properties.PayByPhone);
    updateAppVisibility('#appParkMobile', '#ParkMobileLocation', feature.properties.ParkMobile);
}

function updateIconsAndAmenities(feature) {
    const adaElement = document.getElementById('ADA');
    const parking247Element = document.getElementById('24-7');
    const clearance7FtElement = document.getElementById('7FT');
    const electricElement = document.getElementById('EV');
    const roofElement = document.getElementById('Roof');
    const iconsElement = document.getElementById('Icons');
    const amenitiesElement = document.getElementById('Amenities');

    adaElement.style.display = feature.properties['ADA Parking'] === "TRUE" ? 'block' : 'none';
    parking247Element.style.display = feature.properties['24/7 Parking'] === "TRUE" ? 'block' : 'none';
    clearance7FtElement.style.display = feature.properties['7FT Tall Clearance'] === "TRUE" ? 'block' : 'none';
    electricElement.style.display = feature.properties['Electric Charging'] === "TRUE" ? 'block' : 'none';
    roofElement.style.display = feature.properties['Roof Covering'] === "TRUE" ? 'block' : 'none';

    if (['ADA Parking', '24/7 Parking', '7FT Tall Clearance', 'Electric Charging', 'Roof Covering'].some(prop => feature.properties[prop] === "TRUE")) {
        iconsElement.style.display = 'block';
        amenitiesElement.style.display = 'block';
    } else {
        iconsElement.style.display = 'none';
        amenitiesElement.style.display = 'none';
    }
}

// Function to update app visibility based on location value
function updateAppVisibility(appElementId, locationElementId, locationValue) {
    const appElement = document.querySelector(appElementId);
    const locationElement = document.querySelector(locationElementId);

    if (locationElement) {
        if (locationValue) {
            appElement.style.display = 'block';
            locationElement.textContent = locationValue;
        } else {
            appElement.style.display = 'none';
        }
    }
}

// Function to handle feature click
function handleFeatureClick(event, layers) {
    const features = map.queryRenderedFeatures(event.point, { layers: layers });
    if (features.length) {
        updateInfoPanel(features[0]);
    } else {
        // Safely attempt to hide the info panel
        if (INFOPANEL) {
            INFOPANEL.style.display = 'none';
        }
        // Hide all elements when clicking away from the specified layers
        const elementsToHide = ['Availability', 'Icons', 'Amenities', 'ADA', '24-7', '7FT', 'EV', 'Roof'];
        elementsToHide.forEach(id => {
            const element = document.getElementById(id);
            if (element) {  // Check if element exists before trying to modify it
                element.style.display = 'none';
            }
        });
    }
}

// Set up periodic fetching every 1 minute
setInterval(() => fetchAndUpdateAvailability(false), 60000);

// Initial fetch when the page loads, allow 'Loading...' to show
fetchAndUpdateAvailability();
