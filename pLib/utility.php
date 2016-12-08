<?php
class util {
	public static function dump($var) {
		echo "<pre>";
		var_dump($var);
		echo "</pre>";
	}

	public static function Object($array) {
		$ret = "{ ";
		foreach ($array as $key => $value) {
			$ret .= $key.": ";
			switch (gettype($value)) {
				case "array":
				case "object":
					$ret .= util::Object($value);
					break;
				case "int":
				case "double":
					$ret .= $value;
					break;
				default:
					$ret .= "\"".$value."\"";
					break;
			}
			$ret .= ", ";
		}
		return $ret."}";
	}
}

?>
