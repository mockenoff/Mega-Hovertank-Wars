<?php

session_start();

include_once('classes/dbConnect.php');
$dbc = new dbConnect();
$conn = $dbc->conn;
if(!$conn) die('Failed to connect to database!<br />' . mysql_error());
if(!mysql_select_db('cs4311', $conn)) die('Failed to select database!<br />' . mysql_error());
$query = sprintf("SELECT uid FROM users WHERE ip = '%s'", $_SERVER['REMOTE_ADDR']);
$res = mysql_query($query);
if(mysql_num_rows($res) < 1) {
	$query = sprintf("INSERT INTO users (ip) VALUES ('%s')", $_SERVER['REMOTE_ADDR']);
	if(!mysql_query($query)) die('Could not add you as a player!<br />' . mysql_error());
	$query = sprintf("SELECT uid FROM users WHERE ip = '%s'", $_SERVER['REMOTE_ADDR']);
	$res = mysql_query($query);
}
$row = mysql_fetch_row($res);

$_SESSION['uip'] = $_SERVER['REMOTE_ADDR'];
$_SESSION['uid'] = $row[0];
$_SESSION['gud'] = 0;
if(!isset($_SESSION['gid']) || $_SESSION['gid'] == '') $_SESSION['gid'] = 0;
?>

<!DOCTYPE HTML>
<html>
<head>
<title>Mega Hovertank Wars - Browse Games</title>
<link rel="stylesheet" href="main.css" type="text/css" media="screen" />
<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.1/jquery.min.js"></script>
<script type="text/javascript">
var t;
var gid = <?php echo $_SESSION['gid']; ?>;
$(document).ready(function() {
	$('.game').click(function() {
		$.getJSON('startGame.php', {gid: this.id, uid: '<?php echo $_SESSION['uid']; ?>'}, function(data) {
			if(data.key == -1) {
				$('#error').html('An error occured. Please try again.<br />');
			}
			else if(data.key == -2) {
				$('#'+data.gid).html('This game is full!');
				//this.innerHTML = 'This game is full!';
			}
			else if(data.key == -3) {
				$('#error').html('');
				$('#content').html('You\'re already game <?php echo $_SESSION['gid']; ?>! Please wait while others get in on the action, too.');
				gid = <?php echo $_SESSION['gid']; ?>;
				wait();
			}
			else if(data.key == -4) {
				$('#'+data.gid).html('There is no game by that ID!');
				//this.innerHTML = 'There is no game by that ID!';
			}
			else {
				$('#error').html('');
				$('#content').html('<h1>Waiting for more players...</h1>You\'ve joined game ' + data.key + '! Please wait while others get in on the action, too.');
				gid = data.key;
				wait();
			}
		});
		return false;
	} );
});
function wait() {
	var ready = 0;
	$.getJSON('waitGame.php', {gid: gid}, function(data) {
		if(data.key == 1) {
			ready = 1;
			$('#content').html('Ready to go!');
			$('#error').html('');
			clearTimeout(t);
			window.location.replace('client.php');
		}
		else {
			$('#error').html('<h1>Waiting for more players...</h1>' + Math.abs(data.key) + ' of 4 players ready.');
		}
	});
	if(ready == 0) t = setTimeout("wait()",1000);
}
</script>
</head>

<body>
<div id="error"></div>
<div id="content">
<h1>Browse Games</h1>
<?php
$ingame = 0;
$query = sprintf("SELECT gid, user1, user2, user3, user4, starttime FROM games ORDER BY gid ASC");
$res = mysql_query($query);
if(mysql_num_rows($res) < 1) {
	echo "No games found! You should start a new one.";
}
else {
	$count = 0;
	while($row = mysql_fetch_row($res)) {
		$s1 = $s2 = $s3 = $s4 = 1;
		if($row[1] == $_SESSION['uid'] || $row[2] == $_SESSION['uid'] || $row[3] == $_SESSION['uid'] || $row[4] == $_SESSION['uid']) $ingame = $row[0];
		if($row[1] == $_SESSION['uid']) $_SESSION['gud'] = 1;
		elseif($row[2] == $_SESSION['uid']) $_SESSION['gud'] = 2;
		elseif($row[3] == $_SESSION['uid']) $_SESSION['gud'] = 3;
		elseif($row[4] == $_SESSION['uid']) $_SESSION['gud'] = 4;
		if($row[1] == NULL) $s1 = 0;
		if($row[2] == NULL) $s2 = 0;
		if($row[3] == NULL) $s3 = 0;
		if($row[4] == NULL) $s4 = 0;
		if($s1 + $s2 + $s3 + $s4 < 4 && $ingame == 0) {
			echo 'Available Game: <a href="#" class="game" id="' . $row[0] . '">' . $row[0] . ' with ' . ($s1 + $s2 + $s3 + $s4) . ' of 4 players</a><br />';
			$count++;
		}
	}
	if($count < 1) echo 'No games found! You should start a new one.';
}
?>
<br />
<?php
if($ingame > 0) {
	echo 'You\'re already in game ' . $ingame . '! Please wait for others to join the game.';
	echo '<script type="text/javascript">gid = ' . $ingame . '; wait();</script>';
}
else echo '<h3 class="game" id="0"><a href="#">Start a New Game</a></h3><a href="index.php" title="Back to Home">Back to Home</a>';
?>
<div id="footer">&copy; 2010 Mega Hovertank Wars</div>
</div>
</body>
</html>