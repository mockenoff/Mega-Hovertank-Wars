<?php

class User{
	public $gid;
	public $gud;
	public $uip;
	public $uid;
	public $socket;
	public $handshake;
	
	function __construct($uid = 0, $socket = NULL) {
		$this->uid = $uid;
		$this->socket = $socket;
	}
}

?>