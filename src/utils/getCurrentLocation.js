export const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by your browser."));
            return;
        }

        // Try High Accuracy (GPS)
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy, // ✅ accuracy in meters
                    source: "gps",
                });
            },
            (error) => {
                // If high accuracy fails, try low accuracy (network/wifi)
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                            accuracy: position.coords.accuracy, // ✅ accuracy in meters
                            source: "network",
                        });
                    },
                    (err) => {
                        reject(new Error("Unable to fetch location. Please enable location services."));
                    },
                    {
                        enableHighAccuracy: false,
                        timeout: 8000,
                        maximumAge: 0,
                    }
                );
            },
            {
                enableHighAccuracy: true,
                timeout: 8000,
                maximumAge: 0,
            }
        );
    });
};
