<?php
function lights(){
$state = exec('gpio mode 0');
if($state=="1"){
exec('gpio write 0 0');
}else{
exec('gpio write 0 1');
}
}
if($_SERVER['REQUEST_METHOD']=='POST'){
lights();
}
?>
<html>
<head>
<title>The Lights</title>
<style type="text/css">
.light {
	-moz-box-shadow:inset 0px 1px 0px 0px #ffffff;
	-webkit-box-shadow:inset 0px 1px 0px 0px #ffffff;
	box-shadow:inset 0px 1px 0px 0px #ffffff;
	background:-webkit-gradient( linear, left top, left bottom, color-stop(0.05, #db58db), color-stop(1, #fff985) );
	background:-moz-linear-gradient( center top, #db58db 5%, #fff985 100% );
	filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#db58db', endColorstr='#fff985');
	background-color:#db58db;
	-webkit-border-top-left-radius:6px;
	-moz-border-radius-topleft:6px;
	border-top-left-radius:6px;
	-webkit-border-top-right-radius:6px;
	-moz-border-radius-topright:6px;
	border-top-right-radius:6px;
	-webkit-border-bottom-right-radius:6px;
	-moz-border-radius-bottomright:6px;
	border-bottom-right-radius:6px;
	-webkit-border-bottom-left-radius:6px;
	-moz-border-radius-bottomleft:6px;
	border-bottom-left-radius:6px;
	text-indent:0;
	border:1px solid #474747;
	display:inline-block;
	color:#000000;
	font-family:arial;
	font-size:15px;
	font-weight:bold;
	font-style:normal;
	height:50px;
	line-height:50px;
	width:100px;
	text-decoration:none;
	text-align:center;
	text-shadow:1px 1px 0px #ffffff;
}
.light:hover {
	background:-webkit-gradient( linear, left top, left bottom, color-stop(0.05, #fff985), color-stop(1, #db58db) );
	background:-moz-linear-gradient( center top, #fff985 5%, #db58db 100% );
	filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#fff985', endColorstr='#db58db');
	background-color:#fff985;
}.light:active {
	position:relative;
	top:1px;
}</style>
</head>
<body>
<form action="index.php" method="post">
<input type="submit" class="light" value="The Lights">
</body>
</html>

