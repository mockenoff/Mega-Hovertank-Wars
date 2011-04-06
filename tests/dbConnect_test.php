<?php
require_once('simpletest/autorun.php');
require_once('../classes/dbConnect.php');

class TestOfdbConnect extends UnitTestCase {
	function testdbConnectEmptyParams() {
		$db = new dbConnect();
		$this->assertTrue($db->conn);
	}
	function testdbConnectCorrectParams() {
		$db = new dbConnect('localhost', 'root', 'password');
		$this->assertTrue($db->conn);
	}
}

?>