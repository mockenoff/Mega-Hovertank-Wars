<?php
session_start();
?>

<!DOCTYPE HTML>
<html>
<head>
<title>Mega Hovertank Wars - Statistics Repository</title>
<link rel="stylesheet" href="main.css" type="text/css" media="screen" />
<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.1/jquery.min.js"></script>
<script type="text/javascript">
$(document).ready(function() {
	$('#stats-search').submit(function() {
		var params = '{"uid":"' + $('#uid').val() + '","uip":"' + $('#uip').val() + '","sort":"' + $('#sort').val() + '"}';
		$.getJSON('search.php', {query: params}, function(data) {
			if(data.key < 0) $('#results').html('Error ' + data.key + '!');
			else {
				$('#results').html('<table id="rtable"><thead><tr><td>User ID</td><td>User IP</td><td>Kills</td><td>Deaths</td><td>K/D Ratio</td><td>Games Played</td></tr></thead></table>');
				$.each(data.result, function(i, item) {
					$('#rtable').append('<tr><td>' + item.uid + '</td><td>' + item.uip + '</td><td>' + item.kills + '</td><td>' + item.deaths + '</td><td>' + item.kills / item.deaths + '</td><td>' + item.games + '</td></tr>');
				});
			}
		});
		return false;
	});
});
</script>
</head>

<body>
<div id="content">
<h1>Browse Statistics</h1>
<form id="stats-search" name="stats-search">
	<label for="uid">User ID:</label><input type="text" id="uid" name="uid" />
	<label for="uip">User IP:</label><input type="text" id="uip" name="uip" />
	<label for="sort">Sort by:</label>
	<select id="sort" name="sort">
		<option value="uid0">User ID Ascending</option>
		<option value="uid1">User ID Descending</option>
		<option value="uip0">Uiser IP Ascending</option>
		<option value="uip1">Uiser IP Descending</option>
		<option value="k0">Kills Ascending</option>
		<option value="k1">Kills Descending</option>
		<option value="d0">Deaths Ascending</option>
		<option value="d1">Deaths Descending</option>
		<option value="g0">Games Played Ascending</option>
		<option value="g1">Games Played Descending</option>
	</select>
	<input type="submit" value="Search!" id="search" name="search" />
	<br /><a href="index.php" title="Back to Home">Back to Home</a>
</form>

<div id="results"></div>

<div id="footer">&copy; 2010 Mega Hovertank Wars</div>
</div>
</body>
</html>