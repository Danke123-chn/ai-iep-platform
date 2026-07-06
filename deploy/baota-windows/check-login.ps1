# Detect new (phone) vs old (email) login page. No Chinese in output.
param(
  [string[]]$Urls = @(
    "http://127.0.0.1:3000/auth/login",
    "http://127.0.0.1/auth/login"
  )
)

function Test-LoginPage {
  param([string]$Url)

  Write-Host ""
  Write-Host "URL: $Url"

  try {
    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 15
    $html = $response.Content
  } catch {
    Write-Host "  ERROR: $($_.Exception.Message)"
    return
  }

  # Production build minifies function names; use UI strings and attributes.
  $isNewPhoneLogin =
    $html.Contains('autoComplete="tel-national"') -or
    $html.Contains("13800000000")
  $isOldEmailLogin =
    $html.Contains("you@example.com") -and
    $html.Contains('type="email"')

  if ($isNewPhoneLogin -and -not $isOldEmailLogin) {
    Write-Host "  RESULT: NEW phone/SMS login page"
  } elseif ($isOldEmailLogin -and -not $isNewPhoneLogin) {
    Write-Host "  RESULT: OLD email login page - run rebuild"
  } elseif ($isNewPhoneLogin -and $isOldEmailLogin) {
    Write-Host "  RESULT: MIXED markers - check manually"
  } else {
    Write-Host "  RESULT: UNKNOWN - not a recognized login page"
  }

  Write-Host "  phone_marker: $isNewPhoneLogin"
  Write-Host "  email_marker: $isOldEmailLogin"
  Write-Host "  http_status: $($response.StatusCode)"
}

foreach ($url in $Urls) {
  Test-LoginPage -Url $url
}

Write-Host ""
