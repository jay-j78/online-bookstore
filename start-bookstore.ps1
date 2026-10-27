# Navigate to the bookstore project folder
Set-Location "C:\Users\ASUS\Desktop\j_pro\online-bookstore\online-bookstore"

# Check that Java is available
if (-not (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
    Write-Host "Java was not found. Check JAVA_HOME." -ForegroundColor Red
    exit 1
}

# Ask for your MySQL password securely
$securePassword = Read-Host "Enter your MySQL root password" -AsSecureString
$env:DB_PASSWORD = [System.Net.NetworkCredential]::new("", $securePassword).Password

# Start the Spring Boot application
.\mvnw.cmd spring-boot:run
