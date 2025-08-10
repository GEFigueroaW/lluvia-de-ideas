# Test directo de conectividad con Deepseek
Write-Host "🔍 Testing Deepseek API connectivity..." -ForegroundColor Yellow

# Test 1: Conectividad básica
Write-Host "`n1️⃣ Testing basic connectivity..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://api.deepseek.com" -Method Get -TimeoutSec 10
    Write-Host "✅ Basic connectivity: OK (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Basic connectivity failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: API endpoint
Write-Host "`n2️⃣ Testing API endpoint..." -ForegroundColor Cyan
$headers = @{
    'Authorization' = 'Bearer sk-97c8f4c543fa45acabaf02ebcac60f03'
    'Content-Type' = 'application/json'
}

try {
    $response = Invoke-WebRequest -Uri "https://api.deepseek.com/v1/models" -Method Get -Headers $headers -TimeoutSec 15
    Write-Host "✅ API endpoint: OK (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ API endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# Test 3: Chat completions
Write-Host "`n3️⃣ Testing chat completions..." -ForegroundColor Cyan
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
    Write-Host "✅ Chat completions: OK" -ForegroundColor Green
    Write-Host "   Response: $($result.choices[0].message.content)" -ForegroundColor Green
} catch {
    Write-Host "❌ Chat completions failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        try {
            $errorContent = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorContent)
            $errorText = $reader.ReadToEnd()
            Write-Host "   Error details: $errorText" -ForegroundColor Red
        } catch {
            Write-Host "   Could not read error details" -ForegroundColor Red
        }
    }
}

Write-Host "`n🏁 Test completed!" -ForegroundColor Yellow
