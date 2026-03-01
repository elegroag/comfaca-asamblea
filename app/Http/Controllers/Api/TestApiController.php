<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class TestApiController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            "success" => true,
            "message" => "Test API working"
        ]);
    }
}
