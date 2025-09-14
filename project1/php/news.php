<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

try {
    // Get parameters from request
    $country = $_GET['country'] ?? '';
    $category = $_GET['category'] ?? 'top';

    $configFile = '../../config.php';
    if (file_exists($configFile)) {
        require_once $configFile;
        $apiKey = defined('') ? NEWS_API_KEY : '';
    } else {
        $apiKey = '';
    }
    $baseUrl = 'https://newsdata.io/api/1/news';
    
    // Query params 
    $allowedCategories = ['business','entertainment','environment','food','health','politics','science','sports','technology','top','world'];
    $category = strtolower($category);
    if (!in_array($category, $allowedCategories, true)) {
        $category = 'top';
    }
    $params = [
        'apikey' => $apiKey,
        'language' => 'en',
        'category' => $category
    ];
    
    // Add country filter
    if (!empty($country)) {
        $params['country'] = strtolower($country);
    }
    
    $url = $baseUrl . '?' . http_build_query($params);
    
    $doRequest = function($requestUrl) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $requestUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err = curl_error($ch);
        curl_close($ch);
        return [$httpCode, $response, $err];
    };

    // First attempt
    [$httpCode, $response, $err] = $doRequest($url);

    if ($httpCode === 422) {
        $params['category'] = 'top';
        $url = $baseUrl . '?' . http_build_query($params);
        [$httpCode, $response, $err] = $doRequest($url);
        if ($httpCode === 422) {
            unset($params['category']);
            $url = $baseUrl . '?' . http_build_query($params);
            [$httpCode, $response, $err] = $doRequest($url);
        }
    }

    if ($err) {
        throw new Exception('cURL error: ' . $err);
    }

    if ($httpCode !== 200) {
        $errData = json_decode($response, true);
        $msg = $errData['message'] ?? ($errData['results'] ?? 'Unknown error');
        throw new Exception('API request failed with HTTP code: ' . $httpCode . ' - ' . (is_string($msg) ? $msg : json_encode($msg)));
    }
    
    $data = json_decode($response, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON response from API');
    }
    
    if ($data['status'] !== 'success') {
        throw new Exception('API returned error: ' . ($data['message'] ?? 'Unknown error'));
    }
    
    $news = [];
    
    // Process news articles
    foreach ($data['results'] as $article) {
        $news[] = [
            'title' => $article['title'],
            'description' => $article['description'],
            'content' => $article['content'],
            'url' => $article['link'],
            'image' => $article['image_url'],
            'source' => $article['source_id'],
            'published_at' => $article['pubDate'],
            'category' => $article['category'][0] ?? 'general'
        ];
    }
    
    echo json_encode([
        'success' => true,
        'news' => $news,
        'total_results' => $data['totalResults'] ?? count($news)
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
