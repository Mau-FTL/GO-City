// Utility function to get the user agent
function getUserAgent() {
    return navigator.userAgent || navigator.vendor || window.opera;
}

    // Utility function to fetch JSON data
    async function fetchJson(url) {
        const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!response.ok) throw new Error('Network response was not ok: ' + response.statusText);
        return response.json();
    }

// Function to create and display the modal for Windows users
function showWindowsModal(app) {
    // Create modal elements
    const modal = document.createElement('div');
    modal.id = 'windowsModal';
    modal.style.position = 'fixed';
    modal.style.zIndex = '1000';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.overflow = 'auto';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
    
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#fff';
    modalContent.style.margin = '15% auto';
    modalContent.style.padding = '20px';
    modalContent.style.border = '1px solid #888';
    modalContent.style.width = '80%';
    modalContent.style.maxWidth = '500px';
    modalContent.style.textAlign = 'center';
    
    const modalText = document.createElement('p');
    modalText.innerText = "You'll be redirected to the app's website. Pay for parking only after arriving, as spaces are not guaranteed in advance. Parking is first come, first served.";
    
    const cancelButton = document.createElement('button');
    cancelButton.innerText = 'Cancel';
    cancelButton.onclick = () => document.body.removeChild(modal);
    
    const okButton = document.createElement('button');
    okButton.innerText = 'Ok';
    okButton.style.marginLeft = '10px';
    okButton.onclick = () => {
        document.body.removeChild(modal);
        if (app === 'paybyphone') {
            window.location.href = 'https://www.paybyphone.com';
        } else if (app === 'parkmobile') {
            window.location.href = 'https://www.parkmobile.com';
        }
    };
    
    modalContent.appendChild(modalText);
    modalContent.appendChild(cancelButton);
    modalContent.appendChild(okButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// Function to open deep links or websites
function openApp(app, location) {
    const userAgent = getUserAgent();
    let urlScheme, fallbackUrl;

    if (/Windows/i.test(userAgent)) {
        showWindowsModal(app);
        return;
        if (app === 'paybyphone') {
            urlScheme = 'https://www.paybyphone.com';
        } else if (app === 'parkmobile') {
            urlScheme = 'https://www.parkmobile.com';
        }
    } else {
        if (app === 'paybyphone') {
            urlScheme = 'pbp://search/advertisedLocation?location=' + location; //URL works for both Android and iOS
            fallbackUrl = 'https://apps.apple.com/app/id448474183';
        } else if (app === 'parkmobile') {
            urlScheme = 'https://apps.apple.com/us/app/parkmobile-park-pay-go/id365399299'; //URL only works for iOS
            fallbackUrl = 'https://apps.apple.com/us/app/parkmobile-park-pay-go/id365399299';
        }
    }


    if (urlScheme) {
        window.location.href = urlScheme;
        setTimeout(() => {
            if (fallbackUrl) {
                window.location.href = fallbackUrl;
            }
        }, 3000); // Adjust the timeout as needed
    }

}

// Function to open PayByPhone app or website
function openPayByPhone() {
    const payByPhoneLocationElement = document.querySelector('#PayByPhoneLocation');
    const location = payByPhoneLocationElement ? payByPhoneLocationElement.textContent : '####';
    openApp('paybyphone', location);
}

// Function to open ParkMobile app or website
function openParkMobile() {
    const parkMobileLocationElement = document.querySelector('#ParkMobileLocation');
    const location = parkMobileLocationElement ? parkMobileLocationElement.textContent : '####';
    openApp('parkmobile', location);
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