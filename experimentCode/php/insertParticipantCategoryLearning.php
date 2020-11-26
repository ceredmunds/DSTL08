

<?php
require "config.php";
require "common.php";


echo "Open console and check";
echo '<script>console.log("Welcome to GeeksforGeeks!"); </script>';
error_log("entrando a participant training");
try
	{
		$connection = new PDO($dsn, $username, $password, $options);

		$new_user = array(
			"id" => $_POST['participantId'],
			"trials"=> $_POST['trials'],
			"replay"=> $_POST['replay'],
			"surveyJs"=>$_POST['survey'],
			"trained"=>$_POST['trained'],

		);

		$sql = sprintf(
				"INSERT INTO %s (%s) values (%s)",
				"participant_category_learning",
				implode(", ", array_keys($new_user)),
				":" . implode(", :", array_keys($new_user))
		);

		$statement = $connection->prepare($sql);


		$statement->execute($new_user);


		echo "connection made" ;
		echo $sql ;
	}

	catch(PDOException $error)
	{
  error_log("ERROR EN EL QUERY INSERT PARTICIPANT TRAINING: ".$sql);
  error_log("ERROR EN EL QUERY INSERT PARTICIPANT TRAINING: ". $error->getMessage());

	echo "Open console and check";

    echo '<script>console.log("Welcome to GeeksforGeeks!"); </script>';
	echo $sql . "<br>" . $error->getMessage();
	}


?>
