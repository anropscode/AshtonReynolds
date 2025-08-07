$.ajax({
    url: "libs/php/children.php",
    type: 'POST',
    dataType: 'json',
    data: {
      geonames: $('#geonames').val()
    },
    success: function(result) {

      if (result.status == "ok") {
        $('#lat').html(result['lat']);
        $('#countryId').html(result['countryId']);
      }
    },
    error: function(jqxhr, status, error) {
      console.error("Error occurred:", status, error);
    }
});
