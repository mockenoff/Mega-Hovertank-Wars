<?php
session_start();
if($_SESSION['uid'] == '')
	header('Location: http://' . $_SERVER['SERVER_ADDR'] . '/index.php');

include_once('classes/dbConnect.php');
$dbc = new dbConnect();
$conn = $dbc->conn;
mysql_select_db('cs4311', $conn);

$query = sprintf("SELECT gid FROM games WHERE user1 = '%s' OR user2 = '%s' OR user3 = '%s' OR user4 = '%s'", $_SESSION['uid'], $_SESSION['uid'], $_SESSION['uid'], $_SESSION['uid']);
$res = mysql_query($query);
$row = mysql_fetch_row($res);
$_SESSION['gid'] = $row[0];

$query = sprintf("SELECT user1, user2, user3, user4 FROM games WHERE gid = '%s'", $_SESSION['gid']);
$res = mysql_query($query);
$row = mysql_fetch_row($res);
$num = 0;
if($row[0] == $_SESSION['uid']) $num = 1;
if($row[1] == $_SESSION['uid']) $num = 2;
if($row[2] == $_SESSION['uid']) $num = 3;
if($row[3] == $_SESSION['uid']) $num = 4;
$query = sprintf("UPDATE games SET user%s = 0, status%s = 0 WHERE gid = '%s' AND user%s = '%s'", $num, $num, $_SESSION['gid'], $num, $_SESSION['uid']);
mysql_query($query);
$_SESSION['gid'] = 0;
$_SESSION['gud'] = 0;

/*
** Instead of redirect, probably should output a message based on $_GET['id']
** where 2 = got killed, 3 = round ended (time), and < 0 means there was an error
*/
$rmsg = '';
if($_GET['id'] == 2) $rmsg = 'You\'re dead';
elseif($_GET['id'] == 3) $rmsg = 'Time ran out';
elseif($_GET['id'] == 4) $rmsg = 'You\'re the winner!';
?>

<!DOCTYPE HTML>
<html>
<head>
<title>Mega Hovertank Wars - <?php echo $rmsg; ?></title>
<link rel="stylesheet" href="main.css" type="text/css" media="screen" />
</head>
<body>
<div id="content">
	<h1><?php echo $rmsg; ?></h1>
	<a href="index.php" title="Back to Home">Back to Home</a>
</div>
</body>
</html>