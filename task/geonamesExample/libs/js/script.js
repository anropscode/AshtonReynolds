$('#btnRun').click(function(){
    $.ajax({
        url: "C:\\Users\\dottr\\OneDrive\\Documents\\AshtonsCodingFolders\\task\\geonamesExample\\libs\\php\\children.php",
        type: 'POST',
        dataType: 'json',
        data: {
            'geonameId': $('#geonameId').val()
        },
        success: function(result) {
            console.log(result);
            if(result.status.name === "ok") {
                $('#txtToponymName').html(result['data'][0]['toponymName']);
                $('#txtAreaname').html(result['data'][0]['areaname']);
                $('#txtLat').html(result['data'][0]['lat']);
                $('#txtLng').html(result['data'][0]['lng'])
                $('#txtGeonameId').html(result['data'][0]['geonameId']);
                $('#txtCountryCode').html(result['data'][0]['countryCode']);
                $('#txtCountryName').html(result['data'][0]['countryName']);
                $('#txtFcl').html(result['data'][0]['fcl']);
                $('#txtFcode').html(result['data'][0]['fcode']);
            }
        },
        error: function(jqxhr, status, error) {
            console.error("Error: " + error);
            $('#error').html("Error fetching children data.");
        }
    });
});
