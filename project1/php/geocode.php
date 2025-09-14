<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

try {
    // Get country name from request
    $countryName = $_GET['country'] ?? '';
    
    if (empty($countryName)) {
        throw new Exception('Country name is required');
    }
    
    // OpenCage API configuration
    $configFile = '../../config.php';
    if (file_exists($configFile)) {
        require_once $configFile;
        $apiKey = defined('') ? OPENCAGE_API_KEY : '';
    } else {
        $apiKey = '';
    }
    $baseUrl = 'https://api.opencagedata.com/geocode/v1/json';
    
    // Query parameters
    $params = [
        'q' => urlencode($countryName),
        'key' => $apiKey,
        'limit' => 1,
        'no_annotations' => 1
    ];
    
    $url = $baseUrl . '?' . http_build_query($params);
    
    // Make API request
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if (curl_error($ch)) {
        throw new Exception('cURL error: ' . curl_error($ch));
    }
    
    curl_close($ch);
    
    if ($httpCode !== 200) {
        throw new Exception('API request failed with HTTP code: ' . $httpCode);
    }
    
    $data = json_decode($response, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON response from API');
    }
    
    if (empty($data['results'])) {
        throw new Exception('No results found for country: ' . $countryName);
    }
    
    $result = $data['results'][0];
    $geometry = $result['geometry'];
    
    echo json_encode([
        'success' => true,
        'country' => $countryName,
        'latitude' => $geometry['lat'],
        'longitude' => $geometry['lng'],
        'formatted_address' => $result['formatted']
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
