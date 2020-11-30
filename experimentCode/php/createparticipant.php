<?php
require "config.php";
require "common.php";

//error_reporting(E_ALL ^ E_NOTICE);


try
	{
		$connection = new PDO($dsn, $username, $password, $options);

		$new_user = array(
			"prolific_id" => $_POST['prolific_id'],
			"session_id"  => $_POST['session_id'],
			"condition_exp"  => $_POST['condition_exp'],
			"colours"  => $_POST['colours'],
            "category_colour_association"  => $_POST['category_colours'],
			"shortMonitoringTask"  => $_POST['trialsShortVersion'],
			"longMonitoringTask"  => $_POST['trialsLongVersion'],

		);
		$sql = sprintf(
				"INSERT INTO %s (%s) values (%s)",
				"usersprolific",
				implode(", ", array_keys($new_user)),
				":" . implode(", :", array_keys($new_user))
		);

		$statement = $connection->prepare($sql);
		$statement->execute($new_user);
		$last_id = $connection->lastInsertId();

		echo $last_id;
	}
	catch(PDOException $error)
	{
		echo $sql . "<br>" . $error->getMessage();
	}
?>
