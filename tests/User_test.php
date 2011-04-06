<?php
require_once('simpletest/autorun.php');
require_once('../classes/User.php');

class TestOfUser extends UnitTestCase {
	function testUserConstructorEmptyParams() {
		$user = new User();
		$this->assertEqual($user->uid, 0);
		$this->assertNull($user->socket);
	}
	function testUserConstructorFullParams() {
		$user = new User(1, 'socket');
		$this->assertEqual($user->uid, 1);
		$this->assertNotNull($user->socket);
	}
}

?>