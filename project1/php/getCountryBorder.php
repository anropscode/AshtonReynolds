<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

try {
    // Get country code 
    $countryCode = $_GET['code'] ?? '';
    
    if (empty($countryCode)) {
        throw new Exception('Country code is required');
    }
    
    // Read the JSON file
    $jsonFile = '../../countryBorders.geo.json';
    
    if (!file_exists($jsonFile)) {
        throw new Exception('Country borders file not found');
    }
    
    $jsonContent = file_get_contents($jsonFile);
    $countries = json_decode($jsonContent, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON format');
    }
    
    $countryBorder = null;
    
    // Find country by ISO code
    foreach ($countries['features'] as $feature) {
        $properties = $feature['properties'];
        if ($properties['iso_a2'] === $countryCode || $properties['iso_a3'] === $countryCode) {
            $countryBorder = [
                'name' => $properties['name'],
                'iso_a2' => $properties['iso_a2'],
                'iso_a3' => $properties['iso_a3'],
                'geometry' => $feature['geometry']
            ];
            break;
        }
    }
    
    if ($countryBorder === null) {
        throw new Exception('Country not found');
    }
    
    echo json_encode([
        'success' => true,
        'country' => $countryBorder
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
