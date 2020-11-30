

<?php



require "config.php";
require "common.php";


try
	{

$connection = new PDO($dsn, $username, $password, $options);


$new_user = array(
			"id" => $_POST['participantId'],
			"trials"=> $_POST['trials'],
			"replay"=> $_POST['replay'],

		);

		$sql = sprintf(
				"INSERT INTO %s (%s) values (%s)",
				"participantmonitoring",
				implode(", ", array_keys($new_user)),
				":" . implode(", :", array_keys($new_user))
		);


		$statement = $connection->prepare($sql);
		$statement->execute($new_user);

		echo $sql ;
	}

	catch(PDOException $error)
	{
		echo $sql . "<br>" . $error->getMessage();
	}


?>
