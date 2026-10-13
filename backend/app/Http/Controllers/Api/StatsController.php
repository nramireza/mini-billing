<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Invoice;
use Illuminate\Http\JsonResponse;

class StatsController extends Controller
{
    public function index(): JsonResponse
    {
        $invoices = Invoice::with('items')->get();

        return response()->json([
            'data' => [
                'customers' => Customer::count(),
                'invoices' => $invoices->count(),
                'billed_total' => round((float) $invoices->sum(fn (Invoice $invoice): float => $invoice->total), 2),
                'by_status' => collect(Invoice::STATUSES)
                    ->mapWithKeys(fn (string $status): array => [
                        $status => $invoices->where('status', $status)->count(),
                    ]),
            ],
        ]);
    }
}
