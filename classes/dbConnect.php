<?php
class dbConnect {
	public $conn;
	private $server;
	private $user;
	private $pword;

	function __construct($server = 'localhost', $user = 'root', $pword = 'password') {
		$this->server = $server;
		$this->user = $user;
		$this->pword = $pword;
		$this->conn = mysql_connect($this->server, $this->user, $this->pword);
	}
}
?>