$('#btnRun').click(function(){
    $.ajax({
        url: "C:\\Users\\dottr\\OneDrive\\Documents\\AshtonsCodingFolders\\task\\geonamesExample\\libs\\php\\children.php",
        type: 'POST',
        dataType: 'json',
        data: {
            toponymName: $('#seltoponymName').val(),
            areaname: $('#selareaname').val(),
            lat: $('#sellat').val(),
            lng: $('#sellng').val(),
            geonameId: $('#selgeonameId').val(),
            countryCode: $('#selcountryCode').val(),
            countryName: $('#selcountryName').val(),
            fcl: $('#selfcl').val(),
            fcode: $('#selfcode').val()
        },
        success: function(result) {
            console.log(result);
            if(result.status.name === "ok") {
                $('#txtDivisions').html(result['data'][0]['divisions']);
                $('#txtPopulatedPlaces').html(result['data'][0]['populatesplaces']);
            }
        },
        error: function(jqxhr, status, error) {
            console.error("Error: " + error);
            $('#txtDivisions').html("Error fetching divisions");
            $('#txtPopulatedPlaces').html("Error fetching populated places");
        }
    });
});