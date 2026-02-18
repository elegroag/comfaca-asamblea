<?php

namespace App\Models\Adapter;

use Illuminate\Support\Facades\DB;

class DbBase extends ActiveRecordBase
{
    static $db;
    static $DB_ASSOC = null;
    static $name;

    public static function rawConnect(string $name = 'mysql')
    {
        if (self::$name !== $name) self::$db = null;
        if (!isset(self::$db) || self::$db === null) {
            self::$db = DB::connection($name);
        }
        return new DbBase();
    }

    public static function setFetchMode() {}
}
