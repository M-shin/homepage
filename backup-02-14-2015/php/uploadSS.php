<?php
if(isset($_POST['data'])){
    $data = $_POST['data'];
    $file = md5(uniqid()) . '.png';
    $uri =  substr($data,strpos($data,",")+1);
    $success = file_put_contents('../ss/'.$file, base64_decode($uri));
    echo '../ss/'.$file;
    exit;
}
if(isset($_GET['name'])){
    $file = $_GET['name'];
    if(file_exists($file)){
        header('Content-Description: File Transfer');
        header('Content-Type: image/png');
        header('Content-Disposition: attachment; filename='.basename($file));
        header('Content-Transfer-Encoding: binary');
        header('Expires: 0');
        header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
        header('Pragma: public');
        header('Content-Length: ' . filesize($file));
        ob_clean();
        flush();
        readfile($file);
        exit;
    }else {
        echo "uh oh";
    }
}
?>