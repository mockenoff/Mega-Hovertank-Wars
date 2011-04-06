<?php
require_once('simpletest/autorun.php');
require_once('../classes/SocketServer.php');

class TestOfSocketServer extends UnitTestCase {
	function testSocketServerEmptyParams() {
		$user = new SocketServer();
	}
}

?>