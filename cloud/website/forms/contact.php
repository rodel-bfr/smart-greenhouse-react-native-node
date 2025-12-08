<?php
// Afișare erori în faza de test
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // 1. Conectare la baza de date
    $servername = "localhost";
    // Note: Configure these credentials in your local environment or .env file.
    $username = "YOUR_DB_USER";
    $password = "YOUR_DB_PASSWORD";
    $dbname = "contact_db";          // schimbă dacă DB-ul tău are alt nume

    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        http_response_code(500);
        die("Conexiune eșuată: " . $conn->connect_error);
    }

    // 2. Curățare și validare input
    function clean_input($data)
    {
        return htmlspecialchars(stripslashes(trim($data)));
    }

    $nume = clean_input($_POST["name"] ?? '');
    $email = clean_input($_POST["email"] ?? '');
    $subiect = clean_input($_POST["subject"] ?? '');
    $mesaj = clean_input($_POST["message"] ?? '');
    $necitit = 1; // implicit mesaj nou

    if (empty($nume) || empty($email) || empty($subiect) || empty($mesaj)) {
        http_response_code(400);
        echo "Toate câmpurile sunt obligatorii.";
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo "Email invalid.";
        exit;
    }

    // 3. Inserare în baza de date
    $stmt = $conn->prepare("INSERT INTO mesaje (nume, email, subiect, mesaj, necitit) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssi", $nume, $email, $subiect, $mesaj, $necitit);

    if ($stmt->execute()) {
        // răspuns pentru php-email-form.js → "success"
        echo "OK";
    } else {
        http_response_code(500);
        echo "Eroare la salvare: " . $stmt->error;
    }

    $stmt->close();
    $conn->close();
} else {
    http_response_code(405); // Method Not Allowed
    echo "Metoda nu este permisă.";
}
?>