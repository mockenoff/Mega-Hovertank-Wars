<?php

class Game {
	public static $MAX_PLAYERS = 4;
	public static $ROUND_TIME = 600; // In seconds
	public $gid;
	public $players;
	public $timeLeft;
	private $startTime;

	function __construct($gid = 0) {
		$this->gid = $gid;
		$this->players = array();
		$this->timeLeft = Game::$ROUND_TIME;
		$this->startTime = time();
	}

	public function addPlayer($uid = 0, $socket = NULL) {
		$n = count($this->players);
		if($n >= Game::$MAX_PLAYERS)
			throw new Exception('Too Many Players');
		elseif(!@is_null($this->players[$uid]))
			throw new Exception('Player Already In Game ' . $this->gid);
		else {
			$this->players[$uid] = array(
				'uid' => $uid,
				'socket' => $socket,
				'status' => 0,
				'xPos' => 0,
				'yPos' => 0,
				'xVec' => 0,
				'yVec' => 0,
				'fired' => 0
			);
		}
	}
	
	public function killPlayer($uid = 0) {
		return $this->dropPlayer($uid, NULL);
	}

	public function dropPlayer($uid = 0, $socket = NULL) {
		if(array_key_exists($uid, $this->players) === FALSE) return false;
		unset($this->players[$uid]);
		return true;
	}

	public function getPlayers() {
		$ids = array();
		foreach($this->players as $user) {
			array_push($ids, array('uid' => $user['uid'], 'socket' => $user['socket']));
		}
		return $ids;
	}
	
	public function timeLeft() {
		$this->timeLeft = Game::$ROUND_TIME - (time() - $this->startTime);
		return $this->timeLeft;
	}
	
	public function isFull() {
		if(count($this->players) < Game::$MAX_PLAYERS) return false;
		return true;
	}
}

?>