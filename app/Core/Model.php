<?php
/**
 * Base Model Class
 */
require_once __DIR__ . '/Database.php';

abstract class Model {
    protected $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
}
?>
