<?php
require_once('simpletest/browser.php');
require_once('simpletest/autorun.php');

class TestOfBrowsing extends UnitTestCase {
	function testBrowser() {
		$browser = new SimpleBrowser();
		$browser->get('http://' . $_SERVER['SERVER_ADDR'] . '/index.php');
		$this->assertEqual($browser->getTitle(), 'Mega Hovertank Wars - Home');
	}
	function testBrowserStatistics() {
		$browser = new SimpleBrowser();
		$browser->get('http://' . $_SERVER['SERVER_ADDR'] . '/index.php');
		$browser->click('Statistics Repository');
		$this->assertEqual($browser->getTitle(), 'Mega Hovertank Wars - Statistics Repository');
		$browser->setField('uid', '');
		$browser->setField('uip', '');
		$browser->setField('sort', '');
		$browser->click('search');
		$this->assertPattern('/<table id="rtable"><thead>/i', $browser->getContent());
		$browser->click('Back to Home');
		$this->assertEqual($browser->getTitle(), 'Mega Hovertank Wars - Home');
	}
	function testBrowserBrowse() {
		$browser = new SimpleBrowser();
		$browser->get('http://' . $_SERVER['SERVER_ADDR'] . '/index.php');
		$browser->click('Start Playing');
		$this->assertEqual($browser->getTitle(), 'Mega Hovertank Wars - Browse Games');
		$browser->click('Back to Home');
		$this->assertEqual($browser->getTitle(), 'Mega Hovertank Wars - Home');
	}
	function testBrowserDisconnect() {
		$browser = new SimpleBrowser();
		$browser->get('http://' . $_SERVER['SERVER_ADDR'] . '/disconnect.php');
		$this->assertEqual($browser->getTitle(), 'Mega Hovertank Wars - Home');
	}
}

?>