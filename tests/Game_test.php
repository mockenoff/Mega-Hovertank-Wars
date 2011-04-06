<?php
require_once('simpletest/autorun.php');
require_once('../classes/Game.php');

class TestOfGame extends UnitTestCase {
	function testGameConstructorEmptyParams() {
		$game = new Game();
		$this->assertEqual($game->gid, 0);
		$this->assertEqual(count($game->players), 0);
		$this->assertEqual($game->timeLeft, 600);
		$this->assertEqual(count($game->getPlayers()), 0);
		$this->assertTrue($game->timeLeft() <= 600);
		$this->assertFalse($game->isFull());
		$this->assertFalse($game->dropPlayer());
		$this->assertFalse($game->killPlayer());
		$game->addPlayer();
		$this->assertEqual(count($game->getPlayers()), 1);
		$this->expectException(new Exception('Player Already In Game 0'));
		$game->addPlayer();
		$game->addPlayer(1);
		$game->addPlayer(2);
		$game->addPlayer(3);
		$this->assertTrue($game->isFull());
		$this->expectException(new Exception('Too Many Players'));
		$game->addPlayer(4);
		$this->assertTrue($game->dropPlayer());
		$this->assertTrue($game->killPlayer(1));
		$this->assertFalse($game->isFull());
	}
	function testGameConstructorFullParams() {
		$game = new Game(1);
		$this->assertEqual($game->gid, 1);
		$this->assertEqual(count($game->players), 0);
		$this->assertEqual($game->timeLeft, 600);
		$this->assertEqual(count($game->getPlayers()), 0);
		$this->assertTrue($game->timeLeft() <= 600);
		$this->assertFalse($game->isFull());
		$this->assertFalse($game->dropPlayer());
		$this->assertFalse($game->killPlayer());
		$game->addPlayer();
		$this->assertEqual(count($game->getPlayers()), 1);
		$this->expectException(new Exception('Player Already In Game 1'));
		$game->addPlayer();
		$game->addPlayer(1);
		$game->addPlayer(2);
		$game->addPlayer(3);
		$this->assertTrue($game->isFull());
		$this->expectException(new Exception('Too Many Players'));
		$game->addPlayer(4);
		$this->assertTrue($game->dropPlayer());
		$this->assertTrue($game->killPlayer(1));
		$this->assertFalse($game->isFull());
	}
}

?>