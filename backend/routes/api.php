<?php

use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\StatsController;
use Illuminate\Support\Facades\Route;

Route::get('stats', [StatsController::class, 'index']);

Route::patch('invoices/{invoice}/status', [InvoiceController::class, 'updateStatus']);

Route::apiResource('customers', CustomerController::class);
Route::apiResource('invoices', InvoiceController::class);
