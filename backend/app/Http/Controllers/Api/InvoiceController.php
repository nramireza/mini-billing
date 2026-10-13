<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInvoiceRequest;
use App\Http\Requests\UpdateInvoiceRequest;
use App\Http\Requests\UpdateInvoiceStatusRequest;
use App\Http\Resources\InvoiceResource;
use App\Models\Invoice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $invoices = Invoice::query()
            ->with(['customer', 'items'])
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->when($request->filled('customer_id'), fn ($query) => $query->where('customer_id', $request->integer('customer_id')))
            ->when($request->string('q')->trim()->isNotEmpty(), function ($query) use ($request): void {
                $term = '%'.$request->string('q')->trim().'%';
                $query->where(function ($query) use ($term): void {
                    $query->where('number', 'like', $term)
                        ->orWhereHas('customer', fn ($query) => $query->where('name', 'like', $term));
                });
            })
            ->orderByDesc('issue_date')
            ->orderByDesc('id')
            ->paginate($request->integer('per_page', 15));

        return InvoiceResource::collection($invoices);
    }

    public function store(StoreInvoiceRequest $request): JsonResponse
    {
        $data = $request->validated();
        $items = $data['items'];
        unset($data['items']);

        $invoice = DB::transaction(function () use ($data, $items): Invoice {
            $invoice = Invoice::create($data);
            $invoice->items()->createMany($items);

            return $invoice;
        });

        return (new InvoiceResource($invoice->load(['customer', 'items'])))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Invoice $invoice): InvoiceResource
    {
        return new InvoiceResource($invoice->load(['customer', 'items']));
    }

    public function update(UpdateInvoiceRequest $request, Invoice $invoice): InvoiceResource
    {
        $data = $request->validated();
        $items = $data['items'] ?? null;
        unset($data['items']);

        DB::transaction(function () use ($invoice, $data, $items): void {
            $invoice->update($data);

            if ($items !== null) {
                $invoice->items()->delete();
                $invoice->items()->createMany($items);
            }
        });

        return new InvoiceResource($invoice->fresh()->load(['customer', 'items']));
    }

    public function updateStatus(UpdateInvoiceStatusRequest $request, Invoice $invoice): InvoiceResource
    {
        $invoice->update($request->validated());

        return new InvoiceResource($invoice->load(['customer', 'items']));
    }

    public function destroy(Invoice $invoice): JsonResponse
    {
        $invoice->delete();

        return response()->json(null, 204);
    }
}
