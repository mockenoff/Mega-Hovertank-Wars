<?php
header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');

session_start();

$arr = null;

if(!isset($_GET['query']) || $_GET['query'] == '') $arr = array('key' => -1);
else {
	include_once('classes/dbConnect.php');
	$dbc = new dbConnect();
	$conn = $dbc->conn;
	if(!$conn || !mysql_select_db('cs4311', $conn)) $arr = array('key' => -2);
	else {
		$params = json_decode($_GET['query'], true);
		$query = 'SELECT uid, ip, kills, deaths, games FROM users';
		if($params['uid'] != '' || $params['uip'] != '') {
			$query .= ' WHERE ';
			if($params['uip'] != '') $query .= sprintf("ip LIKE '%%%s%%'", mysql_real_escape_string($params['uip']));
			if($params['uid'] != '' && $params['uip'] != '') $query .= ' AND ';
			if($params['uid'] != '') $query .= sprintf("uid LIKE '%%%s%%'", mysql_real_escape_string($params['uid']));
		}
		$query .= ' ORDER BY ';
		switch($params['sort']) {
			case 'uid0': $query .= 'uid ASC'; break;
			case 'uid1': $query .= 'uid DESC'; break;
			case 'uip0': $query .= 'ip ASC'; break;
			case 'uip1': $query .= 'ip DESC'; break;
			case 'k0': $query .= 'kills ASC'; break;
			case 'k1': $query .= 'kills DESC'; break;
			case 'd0': $query .= 'deaths ASC'; break;
			case 'd1': $query .= 'deaths DESC'; break;
			case 'g0': $query .= 'games ASC'; break;
			case 'g1': $query .= 'games DESC'; break;
		}
		$res = mysql_query($query);
		if(mysql_num_rows($res) < 1) $arr = array('key' => -3, 'query' => $query);
		else {
			$return = array();
			while($row = mysql_fetch_row($res)) {
				array_push($return, array('uid' => $row[0], 'uip' => $row[1], 'kills' => $row[2], 'deaths' => $row[3], 'games' => $row[4]));
			}
			$arr = array('key' => mysql_num_rows($res), 'query' => $query, 'result' => $return);
		}
	}
}
echo json_encode($arr);

?>