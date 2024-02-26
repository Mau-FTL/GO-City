// PayByPhone Deep Links
function openPayByPhone() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/android/i.test(userAgent)) {
        window.location.href = 'intent://open#Intent;scheme=paybyphone;package=com.paybyphone;end', '_blank';
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        window.location.href = 'https://apps.apple.com/us/app/paybyphone-parking/id448474183', '_blank';
    } else {
        window.location.href = 'https://www.paybyphone.com', '_blank';
    }
}

// ParkMobile Deep Links
function openParkMobile() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/android/i.test(userAgent)) {
        window.location.href = 'intent://open#Intent;scheme=parkmobile;package=com.parkmmobile;end', '_blank';
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        window.location.href = 'https://apps.apple.com/us/app/parkmobile-park-pay-go/id365399299', '_blank';
    } else {
        window.location.href = 'https://www.parkmobile.com', '_blank';
    }
}