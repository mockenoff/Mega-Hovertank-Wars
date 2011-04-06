<?php
header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');

session_start();

$arr = null;
// Make sure there are input parameters
if(!isset($_GET['gid']) || !isset($_GET['uid'])) {
	$arr = array('key' => -1);
}
else {
	include_once('classes/dbConnect.php');
	$dbc = new dbConnect();
	$conn = $dbc->conn;
	if(!$conn || !mysql_select_db('cs4311', $conn)) $arr = array('key' => -1);
	else {
		// Make sure they player isn't already in a game
		$query = sprintf("SELECT gid FROM games WHERE (user1 = '%s' AND status1 = 0) OR (user2 = '%s' AND status2 = 0) OR (user3 = '%s' AND status3 = 0) OR (user4 = '%s' AND status4 = 0)", mysql_real_escape_string($_GET['uid']), mysql_real_escape_string($_GET['uid']), mysql_real_escape_string($_GET['uid']), mysql_real_escape_string($_GET['uid']));
		$res = mysql_query($query);
		if(mysql_num_rows($res) > 0) {
			$arr = array('key' => -3);
			$row = mysql_fetch_row($res);
			$_SESSION['gid'] = $row[0];
		}
		elseif($_GET['gid'] == 0) {
			// Attempt to start a new game
			$query = sprintf("INSERT INTO games (user1, status1, starttime) VALUES ('%s', 0, '%s')", mysql_real_escape_string($_GET['uid']), date('Y-m-d H:i:s'));
			if(!mysql_query($query)) $arr = array('key' => -1);
			else {
				// Have to fetch first to return
				$query = sprintf("SELECT gid FROM games WHERE user1 = '%s' AND status1 = 0", mysql_real_escape_string($_GET['uid']));
				$res = mysql_query($query);
				$row = mysql_fetch_row($res);
				$arr = array('key' => $row[0]);
				$_SESSION['gid'] = $row[0];
			}
		}
		elseif($_GET['gid'] > 0) {
			// Attempt to join an ongoing game
			$query = sprintf("SELECT user1, user2, user3, user4, starttime FROM games WHERE gid = '%s'", mysql_real_escape_string($_GET['gid']));
			$res = mysql_query($query);
			// There is no game by that ID
			if(mysql_num_rows($res) < 1) $arr = array('key' => -4, 'gid' => $_GET['gid']);
			else {
				$row = mysql_fetch_row($res);
				$s1 = $s2 = $s3 = $s4 = 1;
				$low = 4;
				if($row[4] == NULL) $s4 = 0; 
				if($row[3] == NULL) { $s3 = 0; $low = 3; }
				if($row[2] == NULL) { $s2 = 0; $low = 2; }
				if($row[1] == NULL) { $s1 = 0; $low = 1; }
				if($s1 + $s2 + $s3 + $s4 < 4) {
					$query = sprintf("UPDATE games SET user%s = '%s', status%s = 0 WHERE gid = '%s'", $low+1, mysql_real_escape_string($_GET['uid']), $low+1, mysql_real_escape_string($_GET['gid']));
					if(!mysql_query($query)) $arr = array('key' => -1);
					else $arr = array('key' => $_GET['gid']);
					$_SESSION['gid'] = $_GET['gid'];
				}
				else $arr = array('key' => -2, 'gid' => $_GET['gid']);
			}
		}
		else $arr = array('key' => -1);
	}
}

echo json_encode($arr);
?>