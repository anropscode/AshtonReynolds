<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

try {
    // Get parameters from request
    $country = $_GET['country'] ?? '';
    $featureClass = $_GET['featureClass'] ?? 'P'; // P for cities, A for countries, etc.
    $maxRows = $_GET['maxRows'] ?? 10;
    
    if (empty($country)) {
        throw new Exception('Country is required');
    }
    
    // Geonames API configuration
    $configFile = '../../config.php';
    if (file_exists($configFile)) {
        require_once $configFile;
        $username = defined('GEONAMES_USERNAME') ? GEONAMES_USERNAME : 'YOUR_GEONAMES_USERNAME';
    } else {
        $username = 'YOUR_GEONAMES_USERNAME'; // Replace with your actual username
    }
    $baseUrl = 'http://api.geonames.org/searchJSON';
    
    // Query parameters
    $params = [
        'q' => urlencode($country),
        'featureClass' => $featureClass,
        'maxRows' => $maxRows,
        'username' => $username,
        'style' => 'FULL'
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
    
    $features = [];
    
    // Process geographical features
    if (isset($data['geonames']) && is_array($data['geonames'])) {
        foreach ($data['geonames'] as $feature) {
            $features[] = [
                'name' => $feature['name'],
                'latitude' => $feature['lat'],
                'longitude' => $feature['lng'],
                'feature_class' => $feature['featureClass'],
                'feature_code' => $feature['featureCode'],
                'country_code' => $feature['countryCode'],
                'population' => $feature['population'] ?? 0,
                'elevation' => $feature['elevation'] ?? 0,
                'timezone' => $feature['timezone']['timeZoneId'] ?? ''
            ];
        }
    }
    
    echo json_encode([
        'success' => true,
        'features' => $features,
        'total_results' => count($features)
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
