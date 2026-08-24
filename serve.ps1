# Simple static file server using HttpListener
param(
  [int]$Port = 8000,
  [string]$Root = "D:\HealthDashBoard"
)

Add-Type -AssemblyName System.Web
$listener = New-Object System.Net.HttpListener
$prefix = "http://*:$Port/"
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Output "Listening on $prefix serving from $Root"

function Get-MimeType([string]$path){
  $ext = [System.IO.Path]::GetExtension($path).ToLower()
  switch($ext){
    '.html'{return 'text/html'}
    '.htm'{return 'text/html'}
    '.css'{return 'text/css'}
    '.js'{return 'application/javascript'}
    '.json'{return 'application/json'}
    '.png'{return 'image/png'}
    '.jpg'{return 'image/jpeg'}
    '.jpeg'{return 'image/jpeg'}
    '.svg'{return 'image/svg+xml'}
    '.woff'{return 'font/woff'}
    '.woff2'{return 'font/woff2'}
    '.ttf'{return 'font/ttf'}
    default { return 'application/octet-stream' }
  }
}

while ($true) {
  $context = $listener.GetContext()
  try{
    $req = $context.Request
    $rawUrl = $req.RawUrl
    # strip query
    $u = $rawUrl.Split('?')[0]
    if($u -eq '/' -or [string]::IsNullOrEmpty($u)){
      $filePath = Join-Path $Root 'index.html'
    } else {
      $safe = $u.TrimStart('/') -replace '\.\.', ''
      $filePath = Join-Path $Root $safe
    }
    if(Test-Path $filePath){
      $bytes = [System.IO.File]::ReadAllBytes($filePath)
      $mime = Get-MimeType $filePath
      $context.Response.ContentType = $mime
      $context.Response.ContentLength64 = $bytes.Length
      $context.Response.OutputStream.Write($bytes,0,$bytes.Length)
      $context.Response.StatusCode = 200
    } else {
      $msg = "404 - Not Found"
      $buf = [System.Text.Encoding]::UTF8.GetBytes($msg)
      $context.Response.StatusCode = 404
      $context.Response.ContentType = 'text/plain'
      $context.Response.ContentLength64 = $buf.Length
      $context.Response.OutputStream.Write($buf,0,$buf.Length)
    }
    $context.Response.OutputStream.Close()
  }catch{
    Write-Error $_
  }
}

$listener.Stop()