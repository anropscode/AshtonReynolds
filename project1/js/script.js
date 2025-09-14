// ---------------------------------------------------------
// GLOBAL DECLARATIONS
// ---------------------------------------------------------

var map;
var currentBorderLayer;
var currentMarkers = [];
var markerClusterGroup;

// Tile layers
var streets = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles © Esri — Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012"
});

var satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
});

var basemaps = {
    "Streets": streets,
    "Satellite": satellite
};

// Overlays
var airportsLayer = L.markerClusterGroup({
    polygonOptions: {
        fillColor: "#fff",
        color: "#000",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.5
    }
});

var citiesLayer = L.markerClusterGroup({
    polygonOptions: {
        fillColor: "#fff",
        color: "#00A",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.5
    }
});

var universitiesLayer = L.markerClusterGroup({
    polygonOptions: {
        fillColor: "#fff",
        color: "maroon",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.5
    }
});

var stadiumsLayer = L.markerClusterGroup({
    polygonOptions: {
        fillColor: "#fff",
        color: "green",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.5
    }
});

var overlays = {
    "Airports": airportsLayer,
    "Cities": citiesLayer,
    "Universities": universitiesLayer,
    "Stadiums": stadiumsLayer
};

// Custom marker icons
var AirportIcon = L.ExtraMarkers.icon({
    prefix: "fa",
    icon: "fa-plane",
    iconColor: "black",
    markerColor: "white",
    shape: "square"
});

var CitiesIcon = L.ExtraMarkers.icon({
    prefix: "fa",
    icon: "fa-city",
    markerColor: "blue",
    shape: "square"
});

var UniversitiesIcon = L.ExtraMarkers.icon({
    prefix: "fa",
    icon: "fa-university",
    markerColor: "maroon",
    shape: "square"
});

var StadiumIcon = L.ExtraMarkers.icon({
    prefix: "fa",
    icon: "fa-futbol",
    markerColor: "green",
    shape: "circle"
});

// ---------------------------------------------------------
// Initialize
// ---------------------------------------------------------

$(document).ready(function () {
    // Initialize the map
    map = L.map("map", {
        layers: [streets]
    }).setView([54.5, -4], 6);

    // Add layer control
    L.control.layers(basemaps, overlays).addTo(map);

    // Add all layers to map
    airportsLayer.addTo(map);
    citiesLayer.addTo(map);
    universitiesLayer.addTo(map);
    stadiumsLayer.addTo(map);

    // Initialize marker cluster group
    markerClusterGroup = L.markerClusterGroup();
    markerClusterGroup.addTo(map);

    // Add buttons
    addMapButtons();

    // Populate country dropdown
    populateCountryDropdown();

    // Add event listeners
    addEventListeners();

    // Load current location if available
    loadCurrentLocation();

    // Populate currency dropdown
    populateCurrencyList();
});

// ---------------------------------------------------------
// FUNCTIONS
// ---------------------------------------------------------

function addMapButtons() {
    // Home button
    var homeBtn = L.easyButton('fa-home fa-lg fa-fw', function (btn, map) {
        showCurrentCountryAndReload();
    }, 'Show current country and reload');
    homeBtn.addTo(map);

    // Weather button
    var weatherBtn = L.easyButton('fa-cloud-sun fa-lg fa-fw', function (btn, map) {
        $('#weatherModal').modal("show");
    }, 'Weather Information');
    weatherBtn.addTo(map);

    // Currency button
    var currencyBtn = L.easyButton('fa-solid fa-money-bill-transfer fa-lg fa-fw', function (btn, map) {
        $("#currencyModal").modal("show");
    }, 'Currency Calculator');
    currencyBtn.addTo(map);

    // News button
    var newsBtn = L.easyButton('fa-newspaper fa-lg fa-fw', function (btn, map) {
        $('#newsModal').modal("show");
    }, 'Breaking News');
    newsBtn.addTo(map);

    // Settings button
    var settingsBtn = L.easyButton("fa-cog fa-lg fa-fw", function (btn, map) {
        $('#settingsModal').modal("show");
    }, 'Settings');
    settingsBtn.addTo(map);
}

function populateCountryDropdown() {
    $.ajax({
        url: 'libs/php/getCountries.php',
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                var select = $('#countrySelect');
                select.empty();
                select.append('<option value="" disabled selected>Select a country</option>');
                
                response.countries.forEach(function(country) {
                    select.append('<option value="' + country.iso_a2 + '">' + country.name + '</option>');
                });
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading countries:', error);
            showToast('Error loading countries', 3000, true);
        }
    });
}

function addEventListeners() {
    // Country selection change
    $('#countrySelect').on('change', function() {
        var countryCode = $(this).val();
        if (countryCode) {
            loadCountryData(countryCode);
        }
    });

    // Currency conversion
    $('#fromAmount, #currencies').on('input change', function() {
        performCurrencyConversion();
    });

    // Weather modal
    $('#weatherModal').on('show.bs.modal', function() {
        var selectedCountry = $('#countrySelect').val();
        if (selectedCountry) {
            loadWeatherData(selectedCountry);
        }
    });

    // News modal
    $('#newsModal').on('show.bs.modal', function() {
        var selectedCountry = $('#countrySelect').val();
        if (selectedCountry) {
            loadNewsData(selectedCountry);
        }
    });

    // Marker visibility toggle
    $('#showMarkers').on('change', function() {
        var showMarkers = $(this).is(':checked');
        toggleMarkerVisibility(showMarkers);
    });
}

function loadCountryData(countryCode) {
    // Get country border
    $.ajax({
        url: 'libs/php/getCountryBorder.php',
        method: 'GET',
        data: { code: countryCode },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                displayCountryBorder(response.country);
                loadCountryMarkers(response.country.name);
                centerMapOnCountry(response.country);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading country border:', error);
            showToast('Error loading country border', 3000, true);
        }
    });
}

function displayCountryBorder(country) {
    // Remove existing border
    if (currentBorderLayer) {
        map.removeLayer(currentBorderLayer);
    }

    // Create new border layer
    currentBorderLayer = L.geoJSON(country.geometry, {
        style: {
            color: '#ff7800',
            weight: 3,
            opacity: 0.8,
            fillColor: '#ff7800',
            fillOpacity: 0.1
        }
    }).addTo(map);
}

function loadCountryMarkers(countryName) {
    // Clear existing markers
    clearMarkers();

    // Load different types of features
    var featureTypes = [
        { class: 'P', layer: citiesLayer, icon: CitiesIcon, name: 'Cities' },
        { class: 'A', layer: airportsLayer, icon: AirportIcon, name: 'Airports' },
        { class: 'S', layer: universitiesLayer, icon: UniversitiesIcon, name: 'Universities' },
        { class: 'S', layer: stadiumsLayer, icon: StadiumIcon, name: 'Stadiums' }
    ];

    featureTypes.forEach(function(featureType) {
        $.ajax({
            url: 'libs/php/geonames.php',
            method: 'GET',
            data: { 
                country: countryName, 
                featureClass: featureType.class,
                maxRows: 20
            },
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    addMarkersToLayer(response.features, featureType.layer, featureType.icon);
                }
            },
            error: function(xhr, status, error) {
                console.error('Error loading ' + featureType.name + ':', error);
            }
        });
    });
}

function addMarkersToLayer(features, layer, icon) {
    features.forEach(function(feature) {
        var marker = L.marker([feature.latitude, feature.longitude], { icon: icon })
            .bindPopup('<b>' + feature.name + '</b><br>Population: ' + feature.population);
        
        layer.addLayer(marker);
        currentMarkers.push(marker);
    });
}

function clearMarkers() {
    currentMarkers.forEach(function(marker) {
        map.removeLayer(marker);
    });
    currentMarkers = [];
}

function centerMapOnCountry(country) {
    if (country.geometry.type === 'Polygon') {
        var coordinates = country.geometry.coordinates[0];
        var bounds = L.latLngBounds(coordinates.map(function(coord) {
            return [coord[1], coord[0]];
        }));
        map.fitBounds(bounds, { padding: [50, 50] });
    } else if (country.geometry.type === 'MultiPolygon') {
        var bounds = L.latLngBounds();
        country.geometry.coordinates.forEach(function(polygon) {
            polygon[0].forEach(function(coord) {
                bounds.extend([coord[1], coord[0]]);
            });
        });
        map.fitBounds(bounds, { padding: [50, 50] });
    }
}

function loadWeatherData(countryCode) {
    var countryName = $('#countrySelect option:selected').text();
    
    $.ajax({
        url: 'libs/php/weather.php',
        method: 'GET',
        data: { location: countryName },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                displayWeatherData(response.weather);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading weather:', error);
            showToast('Error loading weather data', 3000, true);
        }
    });
}

function displayWeatherData(weather) {
    $('#weatherModalLabel').text(weather.location);
    $('#todayConditions').text(weather.current.condition);
    $('#todayIcon').attr('src', weather.current.icon);
    $('#todayMaxTemp').text(weather.current.temp_c);
    $('#todayMinTemp').text(weather.current.temp_c);
    $('#lastUpdated').text(weather.current.last_updated);

    // Display forecast
    if (weather.forecast.length > 0) {
        var day1 = weather.forecast[0];
        $('#day1Date').text(new Date(day1.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }));
        $('#day1Icon').attr('src', day1.icon);
        $('#day1MaxTemp').text(day1.max_temp_c);
        $('#day1MinTemp').text(day1.min_temp_c);
    }

    if (weather.forecast.length > 1) {
        var day2 = weather.forecast[1];
        $('#day2Date').text(new Date(day2.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }));
        $('#day2Icon').attr('src', day2.icon);
        $('#day2MaxTemp').text(day2.max_temp_c);
        $('#day2MinTemp').text(day2.min_temp_c);
    }
}

function performCurrencyConversion() {
    var amount = $('#fromAmount').val();
    var targetCurrency = $('#currencies').val();

    if (amount && targetCurrency) {
        $.ajax({
            url: 'libs/php/currency.php',
            method: 'GET',
            data: { 
                from: 'USD', 
                to: targetCurrency, 
                amount: amount 
            },
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    $('#toAmount').val(response.conversion.to.amount);
                }
            },
            error: function(xhr, status, error) {
                console.error('Error converting currency:', error);
                showToast('Error converting currency', 3000, true);
            }
        });
    }
}

function populateCurrencyList() {
    $.ajax({
        url: 'libs/php/currency.php',
        method: 'GET',
        data: { list: 1, from: 'USD' },
        dataType: 'json',
        success: function(response) {
            if (response.success && Array.isArray(response.currencies)) {
                var sel = $('#currencies');
                sel.empty();
                // Prefer common currencies first
                var preferred = ['EUR','GBP','NGN','ZAR','KES','UGX','TZS','GHS','INR','PKR','AUD','CAD','JPY','CNY'];
                var set = new Set(response.currencies);
                var ordered = preferred.filter(c=>set.has(c)).concat(response.currencies.filter(c=>!preferred.includes(c)));
                ordered.forEach(function(code){
                    sel.append('<option value="'+code+'">'+code+'</option>');
                });
                sel.val('EUR');
                performCurrencyConversion();
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading currencies:', error);
        }
    });
}

function loadNewsData(countryCode) {
    var countryName = $('#countrySelect option:selected').text();
    
    $.ajax({
        url: 'libs/php/news.php',
        method: 'GET',
        data: { country: countryCode, category: 'general' },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                displayNewsData(response.news);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error loading news:', error);
            showToast('Error loading news data', 3000, true);
        }
    });
}

function displayNewsData(news) {
    var newsContainer = $('#newsModal .modal-body');
    newsContainer.empty();

    news.slice(0, 5).forEach(function(article) {
        var newsItem = `
            <div class="news-item mb-3">
                <div class="row">
                    <div class="col-md-4">
                        <img src="${article.image || 'https://via.placeholder.com/300x200'}" class="img-fluid rounded" alt="News Image">
                    </div>
                    <div class="col-md-8">
                        <h6><a href="${article.url}" target="_blank" class="text-decoration-none">${article.title}</a></h6>
                        <p class="text-muted small">${article.source} • ${new Date(article.published_at).toLocaleDateString()}</p>
                        <p class="small">${article.description || article.content}</p>
                    </div>
                </div>
            </div>
            <hr>
        `;
        newsContainer.append(newsItem);
    });
}

function loadCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            
            // Add current location marker
            var currentLocationMarker = L.marker([lat, lng], {
                icon: L.ExtraMarkers.icon({
                    prefix: "fa",
                    icon: "fa-location-dot",
                    markerColor: "red",
                    shape: "circle"
                })
            }).addTo(map);
            
            currentLocationMarker.bindPopup('<b>Your Current Location</b><br>Lat: ' + lat.toFixed(4) + '<br>Lng: ' + lng.toFixed(4));
            
            // Center map on current location
            map.setView([lat, lng], 10);
            
            showToast('Current location loaded', 2000, false);
        }, function(error) {
            console.error('Geolocation error:', error);
            showToast('Unable to get current location', 3000, true);
        });
    }
}

function showCurrentCountryAndReload() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            
            // Reverse geocode to get country
            $.ajax({
                url: 'libs/php/geocode.php',
                method: 'GET',
                data: { country: lat + ',' + lng },
                dataType: 'json',
                success: function(response) {
                    if (response.success) {
                        // Find and select the country in dropdown
                        var countrySelect = $('#countrySelect');
                        countrySelect.val(response.country);
                        countrySelect.trigger('change');
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Error getting country:', error);
                    showToast('Error determining country', 3000, true);
                }
            });
        });
    }
}

function toggleMarkerVisibility(show) {
    if (show) {
        // Show all marker layers
        airportsLayer.addTo(map);
        citiesLayer.addTo(map);
        universitiesLayer.addTo(map);
        stadiumsLayer.addTo(map);
        markerClusterGroup.addTo(map);
    } else {
        // Hide all marker layers
        map.removeLayer(airportsLayer);
        map.removeLayer(citiesLayer);
        map.removeLayer(universitiesLayer);
        map.removeLayer(stadiumsLayer);
        map.removeLayer(markerClusterGroup);
    }
}

function showToast(message, duration, close) {
    Toastify({
        text: message,
        duration: duration,
        newWindow: true,
        close: close,
        gravity: "top",
        position: "center",
        stopOnFocus: true,
        style: {
            background: "#004687"
        },
        onClick: function () {}
    }).showToast();
}

// ---------------------------------------------------------
// Event Handlers
// ---------------------------------------------------------

document.querySelector("#share").addEventListener("click", function() {
    loadCurrentLocation();
});

function findMyCoordinates() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            console.log(position.coords.latitude, position.coords.longitude);
            showToast('Location shared successfully', 2000, false);
        }, function(err) {
            showToast('Error: ' + err.message, 3000, true);
        });
    } else {
        showToast("Geolocation is not supported by this browser.", 3000, true);
    }
}
