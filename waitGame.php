<?php
header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');

session_start();

$arr = null;
if(!isset($_GET['gid'])) $arr = array('key' => 0);
else {
	include_once('classes/dbConnect.php');
	$dbc = new dbConnect();
	$conn = $dbc->conn;
	if(!$conn || !mysql_select_db('cs4311', $conn)) $arr = array('key' => 0);
	$query = sprintf("SELECT user1, user2, user3, user4 FROM games WHERE gid = '%s'", mysql_real_escape_string($_GET['gid']));
	$res = mysql_query($query);
	if(mysql_num_rows($res) < 1) $arr = array('key' => 0);
	else {
		$row = mysql_fetch_row($res);
		if($row[0] == NULL || $row[1] == NULL || $row[2] == NULL || $row[3] == NULL) {
			$s1 = $s2 = $s3 = $s4 = 1;
			if($row[0] == NULL) $s1 = 0;
			if($row[1] == NULL) $s2 = 0;
			if($row[2] == NULL) $s3 = 0;
			if($row[3] == NULL) $s4 = 0;
			$arr = array('key' => -($s1 + $s2 + $s3 + $s4));
		}
		else {
			$arr = array('key' => 1);
			$_SESSION['gid'] = $_GET['gid'];
		}
	}
}
echo json_encode($arr);

?>