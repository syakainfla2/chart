<?php
class FileHandler
{
	private $fileName = "";

	public function __construct($fileName) {
		$this->fileName = $fileName;
	}

	public function append($text) {
		if (is_string($text)) {
			file_put_contents($this->fileName, $text."\n", FILE_APPEND | LOCK_EX);
		} else {
			file_put_contents($this->fileName, json_encode($text)."\n", FILE_APPEND | LOCK_EX);
		}
	}

	public function readJSON() {
		$lines = file($this->fileName);
		$ret = array();
		foreach ($lines as $line) {
			$json = json_decode($line);
			if ($json == null) { $json = $line; }
			$ret[] = $json;
		}
		return $ret;
	}

	public function read() {
		return file($this->fileName);
	}
}
?>
