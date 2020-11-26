<?php

/**
 * Configuration for database connection
 *
 */
/*Test*/

/*
$host       = "localhost:3306";
$username   = "root";
$password   = "root";
$dbname     = "dstl";
*/

/*PRODUCTION*/
$host       = "db5000953762.hosting-data.io";
$username   = "dbu1233005";
$password   = "Tjotssw1_e2";
$dbname     = "dbs831850";




$dsn        = "mysql:host=$host;dbname=$dbname";
$options    = array(
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
              );
