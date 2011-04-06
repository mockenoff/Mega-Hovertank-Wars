<?php
include_once('User.php');
include_once('Game.php');
include_once('dbConnect.php');
class socketServer {
	private $ip;
	private $port;
	private $users;
	private $games;
	private $master;
	private $sockets;
	private $debug;
	private $dbc;
	
	function __construct($ip = '127.0.0.1', $port = 12345) {
		$this->ip = $ip;
		$this->port = $port;
		$this->games = array();
		$this->users = array();
		$this->debug = true;
		$this->master = $this->WebSocket($ip, $port);
		$this->sockets = array($this->master);
		$this->dbc = new dbConnect();
		mysql_select_db('cs4311', $this->dbc->conn);
		$this->listen();
	}

	private function WebSocket($address, $port) {
		$master = socket_create(AF_INET, SOCK_STREAM, SOL_TCP)     or die("socket_create() failed");
		socket_set_option($master, SOL_SOCKET, SO_REUSEADDR, 1)    or die("socket_option() failed");
		socket_bind($master, $address, $port)                      or die("socket_bind() failed");
		socket_listen($master, 20)                                 or die("socket_listen() failed");
		echo "Server Started : " . date('Y-m-d H:i:s') . "\n";
		echo "Master socket  : " . $master."\n";
		echo "Listening on   : " . $address . " port " . $port . "\n\n";
		return $master;
	}
	
	private function listen() {
		while(true){
			$changed = $this->sockets;
			socket_select($changed, $write = NULL, $except = NULL, NULL);
			foreach($changed as $socket) {
				$this->checkTime();
				if($socket == $this->master){
					$client = socket_accept($this->master);
					if($client < 0) { $this->console('socket_accept() failed'); continue; }
					else{ $this->connect($client); }
				}
				else {
					$bytes = @socket_recv($socket, $buffer, 2048, 0);
					if($bytes == 0) { $this->disconnect($socket); }
					else {
						$user = $this->getuserbysocket($socket);
						if(!$user->handshake) { $this->dohandshake($user, $buffer); }
						else{ $this->process($user, $buffer); }
					}
				}
			}
		}
	}

	private function connect($socket) {
		$user = new User(uniqid(), $socket);
		array_push($this->users, $user);
		array_push($this->sockets, $socket);
		$this->console($socket . " CONNECTED!");
	}
	
	private function process($user, $msg) {
/*		if(substr($msg, 0, 22) == "<policy-file-request/>") {
			echo "POLICY FILE REQUEST\n";
			$crossFile = file("crossdomain.xml");
			$crossFile = join('',$crossFile);
			$this->send($user->socket, $crossFile);
			return;
		}*/
		$msg = $this->unwrap($msg);
		$this->say("< " . $msg);
		$data = explode('|', $msg);
		switch($data[0]) {
			case 0:
				$this->send($user->socket, '10|'.$data[1].'|'.$data[2].'|'.$data[3].'|'.$data[4].'|Received initialized user data');
				$user->gid = $data[1];
				$user->uip = $data[2];
				$user->uid = $data[3];
				$user->gud = $data[4];
				if(array_key_exists($data[1], $this->games) === FALSE) {
					$game = new Game($data[1]);
					$this->games[$data[1]] = $game;
					$this->console('New game object ' . $data[1]);
				}
				$this->games[$data[1]]->addPlayer($data[3], $user->socket);
				$this->incrementStat(0, $data[3]);
				if($this->games[$data[1]]->isFull()) {
					$players = $this->games[$data[1]]->getPlayers();
					$msg = '0';
					foreach($players as $player) {
						$usr = $this->getuserbyuid($player['uid']);
						$msg .= '|' . $usr->gud . '|' . $usr->uid;
					}
					$this->broadcast($data[1], 0, $user->socket, $msg);
				}
				break;
			case 1:
				$this->send($user->socket, 'Received input data!');
				$this->broadcast($data[1], $data[3], $user->socket, $msg);
				break;
			case 2:
				if($this->getuserbyuid($data[5]) != null) {
					$this->incrementStat(1, $data[5]);
					$this->incrementStat(2, $data[6]);
					$this->broadcast($data[1], $data[3], $user->socket, $msg);
				}
				break;
			case 5:
				$this->broadcast($data[1], $data[3], $user->socket, $msg);
				break;
			default:
				$this->console('Unknown command: ' . $msg);
				break;
		}
	}

	private function broadcast($gid, $uid, $socket, $msg = '') {
		$players = $this->games[$gid]->getPlayers();
		foreach($players as $player) {
			if($player['uid'] != $uid) $this->send($player['socket'], $msg);
		}
	}

	private function send($client, $msg) {
		$this->say("> " . $msg);
		$msg = $this->wrap($msg);
		socket_write($client, $msg, strlen($msg));
	} 

	private function disconnect($socket) {
		$found = null;
		$n = count($this->users);
		for($i = 0; $i < $n; $i++) {
			if($this->users[$i]->socket == $socket) { $found = $i; break; }
		}
		if(!is_null($found)) {
			$this->broadcast($this->users[$found]->gid, $this->users[$found]->uid, 0, '2|'.$this->users[$found]->gid.'|'.$this->users[$found]->uip.'|'.$this->users[$found]->uid.'|'.$this->users[$found]->gud.'|'.$this->users[$found]->uid.'|0');
			$this->games[$this->users[$found]->gid]->dropPlayer($this->users[$found]->uid, $socket);
			if(count($this->games[$this->users[$found]->gid]->players) < 1) {
				$query = sprintf("DELETE FROM games WHERE gid = '%s'", $this->users[$found]->gid);
				if(!mysql_query($query, $this->dbc->conn))
					$this->console('Failed to delete game ' . $this->users[$found]->gid . ' from the database: ' . mysql_error());
				unset($this->games[$this->users[$found]->gid]);
			}
			array_splice($this->users, $found, 1);
		}
		$index = array_search($socket, $this->sockets);
		socket_close($socket);
		$this->console($socket . " DISCONNECTED!");
		if($index >= 0) { array_splice($this->sockets, $index, 1); }
	}

	private function dohandshake($user, $buffer) {
		$this->console("\nRequesting handshake...");
		$this->console($buffer);
		list($resource, $host, $origin) = $this->getheaders($buffer);
		$this->console("Handshaking...");
		$upgrade  = "HTTP/1.1 101 Web Socket Protocol Handshake\r\n" .
			"Upgrade: WebSocket\r\n" .
			"Connection: Upgrade\r\n" .
			"WebSocket-Origin: " . $origin . "\r\n" .
			"WebSocket-Location: ws://" . $host . $resource . "\r\n" .
			"\r\n";
		socket_write($user->socket, $upgrade . chr(0), strlen($upgrade . chr(0)));
		$user->handshake = true;
		$this->console($upgrade);
		$this->console("Done handshaking...");
		return true;
	}

	private function getheaders($req) {
		$r = $h = $o = null;
		if(preg_match("/GET (.*) HTTP/"   ,$req,$match)) { $r = $match[1]; }
		if(preg_match("/Host: (.*)\r\n/"  ,$req,$match)) { $h = $match[1]; }
		if(preg_match("/Origin: (.*)\r\n/",$req,$match)) { $o = $match[1]; }
		return array($r, $h, $o);
	}

	private function getuserbysocket($socket) {
		$found = null;
		foreach($this->users as $user) {
			if($user->socket == $socket) { $found = $user; break; }
		}
		return $found;
	}
	
	private function getuserbyuid($uid = -1) {
		$found = null;
		foreach($this->users as $user) {
			if($user->uid == $uid) { $found = $user; break; }
		}
		return $found;
	}
	
	private function checkTime() {
		foreach($this->games as $game) {
			$players = $game->getPlayers();
			$this->console($game->timeLeft());
			if(count($players) == 1 && $game->timeLeft() < 595) {
				foreach($players as $player) {
					$this->say('Winner of game ' . $game->gid);
					$this->broadcast($game->gid, 0, 0, '4|' . $game->gid . '|0|0|0');
				}
			}
			if($game->timeLeft() <= 0) {
				$this->say('Out of time for game ' . $game->gid);
				$this->broadcast($game->gid, 0, 0, '3|' . $game->gid . '|0|0|0');
			}
		}
	}
	
	private function incrementStat($action = -1, $uid = -1) {
		$query = '';
		switch($action) {
			case 0:
				$query = sprintf("UPDATE users SET games=games+1 WHERE uid = '%s'", mysql_real_escape_string($uid));
				break;
			case 1:
				$query = sprintf("UPDATE users SET deaths=deaths+1 WHERE uid = '%s'", mysql_real_escape_string($uid));
				break;
			case 2:
				$query = sprintf("UPDATE users SET kills=kills+1 WHERE uid = '%s'", mysql_real_escape_string($uid));
				break;
		}
		if($query != '') {
			$this->console($query);
			if(!mysql_query($query))
				$this->console('Failed to run query for incrementStat(' . $action . ',' . $uid . '): ' . mysql_error());
		}
	}

	private function console($msg = "") { if($this->debug) { echo $msg . "\n"; } }
	private function     say($msg = "") { echo $msg . "\n"; }
	private function    wrap($msg = "") { return chr(0) . $msg . chr(255); }
	private function  unwrap($msg = "") { return substr($msg, 1, strlen($msg) - 2); }
}

?>