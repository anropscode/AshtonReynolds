$(document).ready(function() {
    // Geoname Info
    $("#buttonrun1").on("click", function () {
        const geonameId = $('#geonameId').val().trim();
        if (!geonameId) {
            $('#results').html("Error: Please enter a Geoname ID");
            return;
        }
        
        $('#results').html("Loading...");
        
        $.ajax({
            url: "libs/php/children.php",
            type: 'POST',
            dataType: 'json',
            data: {
                geonames: geonameId
            },
            success: function(result) {
                $('#results').empty();
                if (result.status.name == "error") {
                    $('#results').html("Error: " + result.status.description);
                    return;
                }
                if (result.status.name == "ok" && result.data && result.data.geonames) {
                    if (result.data.geonames.length > 0) {
                        $('#results').html(`
                            <p>Latitude: ${result.data.geonames[0].lat}</p>
                            <p>Longitude: ${result.data.geonames[0].lng}</p>
                        `);
                    } else {
                        $('#results').html("No results found for geoname ID: " + geonameId);
                    }
                } else {
                    $('#results').html("No valid data returned. Please check the geoname ID and try again.");
                }
            },
            error: function(jqxhr, status, error) {
                $('#results').html("Error: " + error);
            }
        });
    });

    // Country Info
    $("#buttonrun2").on("click", function () {
        const countryCode = $('#countryCode').val().trim();
        if (!countryCode) {
            $('#results').html("Error: Please enter a Country Code");
            return;
        }

        $('#results').html("Loading...");

        $.ajax({
            url: "libs/php/countryinfo.php",
            type: 'POST',
            dataType: 'json',
            data: {
                country: countryCode
            },
            success: function(result) {
                $('#results').empty();
                if (result.status.name == "error") {
                    $('#results').html("Error: " + result.status.description);
                    return;
                }
                if (result.status.name == "ok" && result.data && result.data.geonames) {
                    if (result.data.geonames.length > 0) {
                        $('#results').html(`
                            <p>Population: ${result.data.geonames[0].population}</p>
                            <p>Currency: ${result.data.geonames[0].currencyCode}</p>
                        `);
                    } else {
                        $('#results').html("No results found for country code: " + countryCode);
                    }
                } else {
                    $('#results').html("No valid data returned. Please check the country code and try again.");
                }
            },
            error: function(jqxhr, status, error) {
                $('#results').html("Error: " + error);
            }
        });
    });

    // General Country Info
    $("#buttonrun3").on("click", function () {
        const countryCode = $('#generalCountryCode').val().trim();
        if (!countryCode) {
            $('#results').html("Error: Please enter a Country Code");
            return;
        }
        
        $('#results').html("Loading...");
        
        $.ajax({
            url: "libs/php/generalcountryinfo.php",
            type: 'POST',
            dataType: 'json',
            data: {
                countryCode: countryCode
            },
            success: function(result) {
                $('#results').empty();
                if (result.status.name == "error") {
                    $('#results').html("Error: " + result.status.description);
                    return;
                }
                if (result.status.name == "ok" && result.data && result.data.length > 0) {
                    const countryInfo = result.data[0];
                    $('#results').html(`
                        <p>Continent: ${countryInfo.continent}</p>
                        <p>Capital: ${countryInfo.capital}</p>
                        <p>Languages: ${countryInfo.languages}</p>
                        <p>Geoname ID: ${countryInfo.geonameId}</p>
                        <p>South: ${countryInfo.south}</p>
                        <p>ISO Alpha-3: ${countryInfo.isoAlpha3}</p>
                        <p>North: ${countryInfo.north}</p>
                        <p>FIPS Code: ${countryInfo.fipsCode}</p>
                        <p>Population: ${countryInfo.population}</p>
                        <p>East: ${countryInfo.east}</p>
                        <p>ISO Numeric: ${countryInfo.isoNumeric}</p>
                        <p>Area in Sq Km: ${countryInfo.areaInSqKm}</p>
                        <p>Country Code: ${countryInfo.countryCode}</p>
                        <p>West: ${countryInfo.west}</p>
                        <p>Country Name: ${countryInfo.countryName}</p>
                    `);
                } else {
                    $('#results').html("No results found for country code: " + countryCode);
                }
            },
            error: function(jqxhr, status, error) {
                $('#results').html("Error: " + error);
            }
        });
    });
});
