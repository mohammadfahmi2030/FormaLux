Add-Type -AssemblyName System.Security

$rsa = [System.Security.Cryptography.RSA]::Create(2048)
$req = New-Object System.Security.Cryptography.X509Certificates.CertificateRequest(
    "CN=Mohammad Fahmi, O=Mohammad Fahmi",
    $rsa,
    [System.Security.Cryptography.HashAlgorithmName]::SHA256,
    [System.Security.Cryptography.RSASignaturePadding]::Pkcs1
)

# Enhanced Key Usage for Code Signing: 1.3.6.1.5.5.7.3.3
$oidCodeSigning = New-Object System.Security.Cryptography.Oid("1.3.6.1.5.5.7.3.3", "Code Signing")
$oidColl = New-Object System.Security.Cryptography.OidCollection
$null = $oidColl.Add($oidCodeSigning)
$eku = New-Object System.Security.Cryptography.X509Certificates.X509EnhancedKeyUsageExtension($oidColl, $true)
$req.CertificateExtensions.Add($eku)

# Key Usage: DigitalSignature
$ku = New-Object System.Security.Cryptography.X509Certificates.X509KeyUsageExtension(
    [System.Security.Cryptography.X509Certificates.X509KeyUsageFlags]::DigitalSignature,
    $true
)
$req.CertificateExtensions.Add($ku)

$notBefore = [System.DateTimeOffset]::UtcNow.AddDays(-1)
$notAfter = [System.DateTimeOffset]::UtcNow.AddYears(10)
$cert = $req.CreateSelfSigned($notBefore, $notAfter)

$pfxBytes = $cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Pfx, "FormaLux2026")
[System.IO.File]::WriteAllBytes("build\MohammadFahmi.pfx", $pfxBytes)

$cerBytes = $cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert)
[System.IO.File]::WriteAllBytes("build\MohammadFahmi.cer", $cerBytes)

Write-Output "PFX and CER created successfully for publisher: Mohammad Fahmi"
