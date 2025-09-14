<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

try {
    // Get parameters from request
    $listOnly = isset($_GET['list']) ? (bool)$_GET['list'] : false;
    $from = $_GET['from'] ?? 'USD';
    $to = $_GET['to'] ?? 'EUR';
    $amount = $_GET['amount'] ?? 1;
    
    // Validate amount
    if (!is_numeric($amount) || $amount <= 0) {
        throw new Exception('Invalid amount');
    }
    
    // Free currency API (no API key required)
    // Using open.er-api.com which provides free latest rates with CORS enabled
    $baseUrl = 'https://open.er-api.com/v6/latest/' . strtoupper($from);
    
    // Make API request
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $baseUrl);
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
    
    // Normalize fields across providers
    $resultOk = isset($data['result']) ? ($data['result'] === 'success') : true;
    if (!$resultOk) {
        throw new Exception('Currency API returned an error');
    }

    $baseCurrency = $data['base_code'] ?? ($data['base'] ?? strtoupper($from));
    $rates = $data['rates'] ?? [];

    // If only listing currencies is requested
    if ($listOnly) {
        $codes = array_keys($rates);
        sort($codes);
        echo json_encode([
            'success' => true,
            'base' => $baseCurrency,
            'currencies' => $codes,
            'last_updated' => $data['time_last_update_utc'] ?? ($data['date'] ?? null)
        ]);
        return;
    }
    $targetCurrency = strtoupper($to);
    
    if (!isset($rates[$targetCurrency])) {
        throw new Exception('Target currency not supported: ' . $targetCurrency);
    }
    
    $exchangeRate = $rates[$targetCurrency];
    $convertedAmount = $amount * $exchangeRate;
    
    echo json_encode([
        'success' => true,
        'conversion' => [
            'from' => [
                'currency' => $baseCurrency,
                'amount' => (float)$amount
            ],
            'to' => [
                'currency' => $targetCurrency,
                'amount' => round($convertedAmount, 4)
            ],
            'exchange_rate' => $exchangeRate,
            'last_updated' => $data['time_last_update_utc'] ?? ($data['date'] ?? null)
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
