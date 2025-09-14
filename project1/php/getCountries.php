<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

try {
    // Read the country borders JSON file
    $jsonFile = '../../countryBorders.geo.json';
    
    if (!file_exists($jsonFile)) {
        throw new Exception('Country borders file not found');
    }
    
    $jsonContent = file_get_contents($jsonFile);
    $countries = json_decode($jsonContent, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON format');
    }
    
    $countryList = [];
    
    // Extract country information
    foreach ($countries['features'] as $feature) {
        $properties = $feature['properties'];
        $countryList[] = [
            'name' => $properties['name'],
            'iso_a2' => $properties['iso_a2'],
            'iso_a3' => $properties['iso_a3']
        ];
    }
    
    // Sort countries by name
    usort($countryList, function($a, $b) {
        return strcmp($a['name'], $b['name']);
    });
    
    echo json_encode([
        'success' => true,
        'countries' => $countryList
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
