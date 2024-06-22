<?php
header('Content-Type: application/json');

// Collect headers
$headers = getallheaders();

// Collect request method
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Collect request data based on method
$requestData = [];
if ($requestMethod === 'GET') {
    $requestData = $_GET;
} elseif ($requestMethod === 'POST') {
    $requestData = json_decode(file_get_contents('php://input'), true);
}

// Collect additional server information
$serverInfo = [
    'REMOTE_ADDR' => $_SERVER['REMOTE_ADDR'],
    'REQUEST_URI' => $_SERVER['REQUEST_URI'],
    'QUERY_STRING' => $_SERVER['QUERY_STRING'],
    'SERVER_NAME' => $_SERVER['SERVER_NAME'],
    'SERVER_PORT' => $_SERVER['SERVER_PORT'],
    'REQUEST_TIME' => $_SERVER['REQUEST_TIME'],
];

// Prepare response
$response = [
    'headers' => $headers,
    'request_method' => $requestMethod,
    'request_data' => $requestData,
    'server_info' => $serverInfo
];

// Print response as JSON
echo json_encode($response, JSON_PRETTY_PRINT);
?>


