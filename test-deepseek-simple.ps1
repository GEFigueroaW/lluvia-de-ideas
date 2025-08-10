# Test directo de conectividad con Deepseek
Write-Host "Testing Deepseek API connectivity..." -ForegroundColor Yellow

# Test 1: Conectividad basica
Write-Host "1. Testing basic connectivity..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://api.deepseek.com" -Method Get -TimeoutSec 10
    Write-Host "SUCCESS: Basic connectivity OK (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "FAILED: Basic connectivity failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: API endpoint
Write-Host "2. Testing API endpoint..." -ForegroundColor Cyan
$headers = @{
    'Authorization' = 'Bearer sk-97c8f4c543fa45acabaf02ebcac60f03'
    'Content-Type' = 'application/json'
}

try {
    $response = Invoke-WebRequest -Uri "https://api.deepseek.com/v1/models" -Method Get -Headers $headers -TimeoutSec 15
    Write-Host "SUCCESS: API endpoint OK (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "FAILED: API endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# Test 3: Chat completions
Write-Host "3. Testing chat completions..." -ForegroundColor Cyan
$body = @{
    model = "deepseek-chat"
    messages = @(
        @{
            role = "user"
            content = "Responde solo: Test OK"
        }
    )
    max_tokens = 10
    temperature = 0.1
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-WebRequest -Uri "https://api.deepseek.com/v1/chat/completions" -Method Post -Headers $headers -Body $body -TimeoutSec 20
    $result = $response.Content | ConvertFrom-Json
    Write-Host "SUCCESS: Chat completions OK" -ForegroundColor Green
    Write-Host "Response: $($result.choices[0].message.content)" -ForegroundColor Green
} catch {
    Write-Host "FAILED: Chat completions failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

Write-Host "Test completed!" -ForegroundColor Yellow
