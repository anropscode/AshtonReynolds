$.ajax({
    url: "libs/php/children.php",
    type: 'POST',
    dataType: 'json',
    data: {
      geonames: $('#geonames').val()
    },
    success: function(result) {

      if (result.status == "ok") {
        $('#geonames').html(result['geonames']);
      }
    },
    error: function(jqxhr, status, error) {
      console.error("Error occurred:", status, error);
    }
});

