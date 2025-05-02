<?php
/**
 * Simple PHP script to handle email sending via SMTP from the static form
 * This needs to be hosted on a PHP-enabled server
 */

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Allow cross-origin requests from your domain
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Check if this is a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get the POST data
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($data['name']) || !isset($data['email']) || !isset($data['instagram']) || !isset($data['phone']) || !isset($data['address'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

// SMTP Configuration
$smtp_host = getenv('SMTP_HOST');
$smtp_port = getenv('SMTP_PORT');
$smtp_user = getenv('SMTP_USER');
$smtp_pass = getenv('SMTP_PASS');
$smtp_from = getenv('SMTP_FROM_EMAIL');

// Fallback values if environment variables are not set
if (!$smtp_host) $smtp_host = 'smtp.gmail.com';
if (!$smtp_port) $smtp_port = 587;
if (!$smtp_user) $smtp_user = 'youremail@gmail.com';
if (!$smtp_pass) $smtp_pass = 'yourpassword';
if (!$smtp_from) $smtp_from = 'noreply@numour.com';

// Prepare the email headers
$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: Numour <$smtp_from>\r\n";

// Prepare the welcome email content
$subject = "Welcome to the Numour Family! 🎉";
$message = "
<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;'>
    <h2 style='color: #6a4c93;'>Welcome to the Numour Family! 🎉</h2>
    <p>Hello {$data['name']},</p>
    <p>We're thrilled to have you join our affiliate program! Your application has been successfully registered.</p>
    <p>Our team will review your information and get back to you shortly with the next steps.</p>
    <p>In the meantime, feel free to explore our product range and get familiar with what we offer.</p>
    <p>Best regards,<br>The Numour Team</p>
</div>
";

// Send the email
require 'vendor/autoload.php'; // Load PHPMailer

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$mail = new PHPMailer(true);

try {
    // Server settings
    $mail->SMTPDebug = 0;
    $mail->isSMTP();
    $mail->Host = $smtp_host;
    $mail->SMTPAuth = true;
    $mail->Username = $smtp_user;
    $mail->Password = $smtp_pass;
    $mail->SMTPSecure = 'tls';
    $mail->Port = $smtp_port;

    // Recipients
    $mail->setFrom($smtp_from, 'Numour Family');
    $mail->addAddress($data['email'], $data['name']);

    // Content
    $mail->isHTML(true);
    $mail->Subject = $subject;
    $mail->Body = $message;

    $mail->send();
    
    echo json_encode(['success' => true, 'message' => 'Email sent successfully']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => "Mail error: {$mail->ErrorInfo}"]);
    exit;
}

// Submit to Google Sheets
$google_webhook_url = getenv('GOOGLE_WEBHOOK_URL');
if ($google_webhook_url) {
    $payload = $data;
    $payload['timestamp'] = date('Y-m-d H:i:s');
    
    $ch = curl_init($google_webhook_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    
    $response = curl_exec($ch);
    $status_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($status_code >= 400) {
        // If Google Sheets fails, send backup email
        $backup_subject = "BACKUP: New Affiliate Registration Data";
        $backup_message = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;'>
            <h2 style='color: #d9534f;'>Backup Notification: Google Sheets Integration Failed</h2>
            <p>The system failed to send data to Google Sheets. Please manually add this affiliate to your records.</p>
            <h3>Affiliate Data:</h3>
            <ul>
                <li><strong>Name:</strong> {$data['name']}</li>
                <li><strong>Instagram:</strong> {$data['instagram']}</li>
                <li><strong>Phone:</strong> {$data['phone']}</li>
                <li><strong>Email:</strong> {$data['email']}</li>
                <li><strong>Address:</strong> {$data['address']}</li>
                <li><strong>Timestamp:</strong> {$payload['timestamp']}</li>
            </ul>
            <p>Please add this information to your Google Sheets manually.</p>
        </div>
        ";
        
        $backup_mail = new PHPMailer(true);
        
        try {
            // Server settings
            $backup_mail->SMTPDebug = 0;
            $backup_mail->isSMTP();
            $backup_mail->Host = $smtp_host;
            $backup_mail->SMTPAuth = true;
            $backup_mail->Username = $smtp_user;
            $backup_mail->Password = $smtp_pass;
            $backup_mail->SMTPSecure = 'tls';
            $backup_mail->Port = $smtp_port;
            
            // Recipients
            $backup_mail->setFrom($smtp_from, 'Numour Affiliate System');
            $backup_mail->addAddress('hanselenterprise@gmail.com', 'Hansel Enterprise');
            
            // Content
            $backup_mail->isHTML(true);
            $backup_mail->Subject = $backup_subject;
            $backup_mail->Body = $backup_message;
            
            $backup_mail->send();
        } catch (Exception $e) {
            // Log this error but don't fail the overall request
            error_log("Backup email error: {$backup_mail->ErrorInfo}");
        }
    }
}

// Return success response
echo json_encode(['success' => true, 'message' => 'Form submitted successfully']);
?>