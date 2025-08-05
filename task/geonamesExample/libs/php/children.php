<?php
	ini_set('display_errors', 'On');
	error_reporting(E_ALL);
	
	$executionStartTime = microtime(true);
	
	
	$geonameid = isset($_REQUEST['geonameid']) ? $_REQUEST['geonameid'] : '3175395';
	$url = "http://api.geonames.org/children?geonameId=3175395" . urlencode($geonameid) . "&username=anropscode";

	$ch = curl_init();
	curl_setopt($ch,CURLOPT_SSL_VERIFYPEER,false);
	curl_setopt($ch,CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch,CURLOPT_URL, $url);
	
	$result=curl_exec($ch);
	
	curl_close($ch);
	
	$decode = json_decode($result, true);
	
	$output['status']['code'] = 200;
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['ReturnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
	$output['data'] = $decode['geonames'];
	
	header('Content-Type: application/json; charset-UTF-8');
	
	file_put_contents('debug.txt', print_r($decode, true));
	echo json_encode($output);
?>
