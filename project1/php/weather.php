<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

try {
    // Get location from request
    $location = $_GET['location'] ?? '';
    
    if (empty($location)) {
        throw new Exception('Location is required');
    }
    
    // WeatherAPI
    $configFile = '../../config.php';
    if (file_exists($configFile)) {
        require_once $configFile;
        $apiKey = defined('') ? WEATHER_API_KEY : '';
    } else {
        $apiKey = '';
    }
    $baseUrl = 'http://api.weatherapi.com/v1';
    
    // Get current weather
    $forecastUrl = $baseUrl . '/forecast.json?' . http_build_query([
        'key' => $apiKey,
        'q' => urlencode($location),
        'days' => 3,
        'aqi' => 'no'
    ]);
    
    // API request
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $forecastUrl);
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
    
    // Extract weather data
    $current = $data['current'];
    $forecast = $data['forecast']['forecastday'];
    
    $weatherData = [
        'location' => $data['location']['name'] . ', ' . $data['location']['country'],
        'current' => [
            'temp_c' => $current['temp_c'],
            'temp_f' => $current['temp_f'],
            'condition' => $current['condition']['text'],
            'icon' => $current['condition']['icon'],
            'last_updated' => $current['last_updated']
        ],
        'forecast' => []
    ];
    
    // Process data
    foreach ($forecast as $day) {
        $weatherData['forecast'][] = [
            'date' => $day['date'],
            'max_temp_c' => $day['day']['maxtemp_c'],
            'min_temp_c' => $day['day']['mintemp_c'],
            'condition' => $day['day']['condition']['text'],
            'icon' => $day['day']['condition']['icon']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'weather' => $weatherData
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
