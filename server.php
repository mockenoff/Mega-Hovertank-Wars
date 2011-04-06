#!/usr/bin/php -q
<?php

error_reporting(E_ALL);
set_time_limit(0);
ob_implicit_flush();

include_once('classes/SocketServer.php');
include_once('classes/User.php');
include_once('classes/Game.php');
include_once('classes/dbConnect.php');

$ip = '192.168.1.67';
$port = 12345;

try{
  $mySocketServer = new SocketServer($ip, $port);
} catch (Project_Exception_AutoLoad $e) {
    echo "FATAL ERROR: CAN'T FIND SOCKET SERVER CLASS.";
}

?>