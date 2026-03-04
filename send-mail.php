<?php
// ── Load .env manually (no Composer needed) ──
function loadEnv(string $path): void {
    if (!file_exists($path)) return;
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (str_starts_with(trim($line), '#')) continue;
        [$key, $value] = array_map('trim', explode('=', $line, 2));
        $_ENV[$key] = $value;
        putenv("$key=$value");
    }
}

loadEnv(__DIR__ . '/.env');

// ── Only accept POST ──
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

header('Content-Type: application/json');

// ── Sanitize inputs ──
$name    = htmlspecialchars(trim($_POST['name']    ?? ''));
$email   = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$tour    = htmlspecialchars(trim($_POST['tour']    ?? 'Not specified'));
$message = htmlspecialchars(trim($_POST['message'] ?? ''));

// ── Validate ──
if (!$name || !$email || !$message) {
    echo json_encode(['success' => false, 'message' => 'Please fill in all required fields.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Please enter a valid email address.']);
    exit;
}

// ── Mail config from .env ──
$mailHost     = $_ENV['MAIL_HOST']      ?? '127.0.0.1';
$mailPort     = (int)($_ENV['MAIL_PORT'] ?? 1025);
$mailFrom     = $_ENV['MAIL_FROM']      ?? 'noreply@cabbytours.lk';
$mailFromName = $_ENV['MAIL_FROM_NAME'] ?? 'Cabby Tours';
$mailTo       = $_ENV['MAIL_TO']        ?? 'owner@cabbytours.lk';
$mailToName   = $_ENV['MAIL_TO_NAME']   ?? 'Cabby Tours Owner';

// ── Build email ──
$subject = "New Enquiry from $name — Cabby Tours";

$body = "
<!DOCTYPE html>
<html>
<head>
  <meta charset='UTF-8'>
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f0; margin: 0; padding: 20px; }
    .card { background: white; max-width: 580px; margin: 0 auto; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #0d3d2b, #1a6645); padding: 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.01em; }
    .header p  { color: rgba(255,255,255,0.6); margin: 6px 0 0; font-size: 13px; }
    .body { padding: 32px; }
    .field { margin-bottom: 20px; }
    .field-label { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #2ca06e; margin-bottom: 6px; }
    .field-value { font-size: 15px; color: #1a2e22; line-height: 1.6; background: #f8fdf9; border: 1px solid #e0f0e8; border-radius: 10px; padding: 12px 16px; }
    .message-box { white-space: pre-wrap; }
    .footer { background: #f8fdf9; border-top: 1px solid #e8f4ed; padding: 20px 32px; text-align: center; font-size: 12px; color: #999; }
    .badge { display: inline-block; background: #e8f7ef; color: #2ca06e; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 50px; margin-top: 8px; }
  </style>
</head>
<body>
  <div class='card'>
    <div class='header'>
      <h1>✈️ New Tour Enquiry</h1>
      <p>Received from the Cabby Tours website</p>
    </div>
    <div class='body'>
      <div class='field'>
        <div class='field-label'>Full Name</div>
        <div class='field-value'>$name</div>
      </div>
      <div class='field'>
        <div class='field-label'>Email Address</div>
        <div class='field-value'><a href='mailto:$email' style='color:#2ca06e;text-decoration:none;'>$email</a></div>
      </div>
      <div class='field'>
        <div class='field-label'>Tour of Interest</div>
        <div class='field-value'>$tour</div>
      </div>
      <div class='field'>
        <div class='field-label'>Message</div>
        <div class='field-value message-box'>$message</div>
      </div>
    </div>
    <div class='footer'>
      This email was sent automatically from cabbytours.lk
      <br>
      <span class='badge'>Reply directly to: $email</span>
    </div>
  </div>
</body>
</html>
";

// ── Send via socket to local SMTP ──
function sendSmtp(
    string $host, int $port,
    string $from, string $fromName,
    string $to,   string $toName,
    string $subject, string $htmlBody
): bool {

    $socket = @fsockopen($host, $port, $errno, $errstr, 5);
    if (!$socket) return false;

    $boundary = md5(uniqid());
    $fromEncoded = "=?UTF-8?B?" . base64_encode($fromName) . "?=";
    $toEncoded   = "=?UTF-8?B?" . base64_encode($toName)   . "?=";
    $subjectEncoded = "=?UTF-8?B?" . base64_encode($subject) . "?=";

    $headers  = "From: $fromEncoded <$from>\r\n";
    $headers .= "To: $toEncoded <$to>\r\n";
    $headers .= "Reply-To: $from\r\n";
    $headers .= "Subject: $subjectEncoded\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "Content-Transfer-Encoding: base64\r\n";
    $headers .= "X-Mailer: CabbyTours-PHP\r\n";

    $encodedBody = chunk_split(base64_encode($htmlBody));

    $commands = [
        "EHLO localhost",
        "MAIL FROM:<$from>",
        "RCPT TO:<$to>",
        "DATA",
        "$headers\r\n$encodedBody\r\n.",
        "QUIT"
    ];

    foreach ($commands as $cmd) {
        fputs($socket, $cmd . "\r\n");
        fgets($socket, 512);
    }

    fclose($socket);
    return true;
}

$sent = sendSmtp(
    $mailHost, $mailPort,
    $mailFrom, $mailFromName,
    $mailTo,   $mailToName,
    $subject,  $body
);

if ($sent) {
    echo json_encode([
        'success' => true,
        'message' => 'Your message has been sent! We\'ll get back to you within 24 hours.'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Sorry, something went wrong. Please try again or contact us directly.'
    ]);
}