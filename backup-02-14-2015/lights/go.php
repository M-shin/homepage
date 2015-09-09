<?php

$state = exec('gpio read 0');
echo($state);
if ($state == "1"){
	exec('gpio write 0 0');
}else{
	exec('gpio write 0 1');
}


?>
