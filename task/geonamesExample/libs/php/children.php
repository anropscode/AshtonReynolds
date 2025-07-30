<?php
	ini_set('display_errors', 'On');
	error_reporting(E_ALL);
	
	$executionStartTime = microtime(true);
	
	$url = "http://api.geonames.org/children?geonameId=3175395&username=demo"
     . "&toponymName=" . urlencode($_REQUEST['toponymName']);
     . "&areaname=" . urlencode($_REQUEST['areaname']);
	 . "&lat=" . urlencode($_REQUEST['lat']);
	 . "&lng=" . urlencode($_REQUEST['lng']);
	 . "&geonameId=" . urlencode($_REQUEST['geonameId']);
	 . "&CountryCode=" . urlencode($_REQUEST['CountryCode']);
	 . "&CountryName=" . urlencode($_REQUEST['CountryName']);
	 . "&fcl=" . urlencode($_REQUEST['fcl']);
	 . "&fcode=" . urlencode($_REQUEST['fcode']);

	$ch = curl_init();
	curl_setopt($ch,CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch,CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch,CURLOPT_URL, $url);
	
	$result=curl_exec($ch);
	
	curl_close($ch);
	
	$decode = json_decode($result, true);
	
	$output['status']['code'] = 200;
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['ReturnedIn'] = "intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = $decode['geonameId'];
	
	header('Content-Type: application/json; charset-UTF-8');
	
	echo json_encode($output);
?>
