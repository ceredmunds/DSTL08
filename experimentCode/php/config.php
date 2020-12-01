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
$host       = "db5001253360.hosting-data.io";
$username   = "dbu103281";
$password   = "Tjotssw1_dstl08";
$dbname     = "dbs1071296";

$dsn        = "mysql:host=$host;dbname=$dbname";
$options    = array(
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
              );
