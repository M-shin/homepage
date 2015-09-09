<?php
if(isset($_POST['message']) && isset($_POST['name'])){
    $handle = fopen('feedback.txt', 'a') or die('Could not open the file');
    $from = $_POST['name'];
    $time = date('m/d h:i:s');
    $message = $_POST['message'];
    $toWrite = "Message from: $from on $time:\r\n$message\r\n\r\n";
    fwrite($handle, $toWrite);
    fclose($handle);
    echo "<strong>Thank you</strong>, your message was successfully submitted.";
}else{
    echo "Something went <strong>terribly</strong> wrong. Please tell Michael about this.";
}
?>