$(document).ready(function() {
$('#btnRun').click(function(){
    $.ajax({
        url: "http://api.geonames.org/children?geonameId=3175395&username=anropscode",
        type: 'POST',
        dataType: 'json',
        data: {
            geonameid: $('#geonameselect').val()
        },
        success: function(result) {
            console.log(result);
            if(result.status.name === "ok") {
                $('#toponymname_result').html(result['data'][0]['toponymname']);
                $('#name_result').html(result['data'][0]['name']);
                $('#lat_result').html(result['data'][0]['lat']);
                $('#lng_result').html(result['data'][0]['lng']);
                $('#geonameid_result').html(result['data'][0]['geonameid']);
                $('#countrycode_result').html(result['data'][0]['countrycode']);
                $('#countryname_result').html(result['data'][0]['countryname']);
                $('#fcl_result').html(result['data'][0]['fcl']);
                $('#fcode').html(result['data'][0]['fcode']);
            }
        },
        error: function(jqxhr, status, error) {
            console.error("Error: " + error);
            $('#error').html("Error fetching children data.");
        }
    });
});
});
