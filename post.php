<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <link rel="stylesheet/less" type="text/css" href="./style/form.less" />
        <script src="http://cdnjs.cloudflare.com/ajax/libs/less.js/2.7.1/less.min.js"></script>
        <script src="./lib/utility.js"></script>
		<script src="./form.js"></script>
		<title>Form</title>
	</head>
	<body>
		<center>
<?php
include_once("./pLib/utility.php");
include_once("./pLib/FileHandler.php");
$log = new FileHandler("./log.txt");
$q1 = $_POST["q1"];
$q2 = $_POST["q2"];
$q3 = $_POST["q3"];
if ($q3 == "else") {
	$q3 = $_POST["q3-else"];
}
$q4 = $_POST["q4"];
$q5_old = $_POST["q5_old"];
$q5_weight = $_POST["q5_weight"];
if ($q1 != "" && $q2 != "" && $q3 != "" &&
    $q4 != "" && $q5_old != "" && $q5_weight != "") {
	$log->append(array(
		"q1" => $q1,
		"q2" => $q2,
		"q3" => $q3,
		"q4" => $q4,
		"q5" => array(
			"0" => $q5_old,
			"1" => $q5_weight
		)
	));
	print("<font class=\"title\">Success</font>");
} else {
	print("<font class=\"title\">Failed</font>");
}
?>
		</center>
	</body>
</html>
