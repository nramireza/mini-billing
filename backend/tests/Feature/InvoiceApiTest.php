<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoiceApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_an_invoice_and_computes_totals(): void
    {
        $customer = Customer::factory()->create();

        $response = $this->postJson('/api/invoices', [
            'customer_id' => $customer->id,
            'issue_date' => '2026-10-01',
            'tax_rate' => 19,
            'items' => [
                ['description' => 'Servicio A', 'quantity' => 2, 'unit_price' => 1000],
                ['description' => 'Servicio B', 'quantity' => 1, 'unit_price' => 500],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.subtotal', 2500)
            ->assertJsonPath('data.tax', 475)
            ->assertJsonPath('data.total', 2975)
            ->assertJsonPath('data.number', 'INV-00001')
            ->assertJsonCount(2, 'data.items');

        $this->assertDatabaseCount('invoice_items', 2);
    }

    public function test_it_requires_at_least_one_item(): void
    {
        $customer = Customer::factory()->create();

        $response = $this->postJson('/api/invoices', [
            'customer_id' => $customer->id,
            'issue_date' => '2026-10-01',
            'items' => [],
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors(['items']);
    }

    public function test_it_rejects_an_unknown_customer(): void
    {
        $response = $this->postJson('/api/invoices', [
            'customer_id' => 999,
            'issue_date' => '2026-10-01',
            'items' => [['description' => 'X', 'quantity' => 1, 'unit_price' => 100]],
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors(['customer_id']);
    }

    public function test_it_filters_invoices_by_status(): void
    {
        Invoice::factory()->count(2)->draft()->create();
        Invoice::factory()->count(3)->paid()->create();

        $this->getJson('/api/invoices?status=paid')
            ->assertOk()
            ->assertJsonPath('meta.total', 3);
    }

    public function test_it_shows_an_invoice_with_relations(): void
    {
        $invoice = Invoice::factory()->create();
        InvoiceItem::factory()->count(2)->for($invoice)->create();

        $this->getJson("/api/invoices/{$invoice->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $invoice->id)
            ->assertJsonCount(2, 'data.items')
            ->assertJsonPath('data.customer.id', $invoice->customer_id);
    }

    public function test_it_replaces_items_on_update_and_recalculates(): void
    {
        $invoice = Invoice::factory()->create();
        InvoiceItem::factory()->create([
            'invoice_id' => $invoice->id,
            'quantity' => 1,
            'unit_price' => 100,
        ]);

        $response = $this->putJson("/api/invoices/{$invoice->id}", [
            'tax_rate' => 0,
            'items' => [
                ['description' => 'Nuevo', 'quantity' => 10, 'unit_price' => 200],
            ],
        ]);

        $response->assertOk()
            ->assertJsonPath('data.subtotal', 2000)
            ->assertJsonPath('data.total', 2000)
            ->assertJsonCount(1, 'data.items');

        $this->assertDatabaseCount('invoice_items', 1);
    }

    public function test_it_updates_the_status(): void
    {
        $invoice = Invoice::factory()->draft()->create();

        $this->patchJson("/api/invoices/{$invoice->id}/status", ['status' => 'paid'])
            ->assertOk()
            ->assertJsonPath('data.status', 'paid');

        $this->assertDatabaseHas('invoices', ['id' => $invoice->id, 'status' => 'paid']);
    }

    public function test_it_deletes_an_invoice_and_its_items(): void
    {
        $invoice = Invoice::factory()->create();
        InvoiceItem::factory()->for($invoice)->create();

        $this->deleteJson("/api/invoices/{$invoice->id}")->assertNoContent();

        $this->assertDatabaseCount('invoices', 0);
        $this->assertDatabaseCount('invoice_items', 0);
    }

    public function test_it_returns_dashboard_stats(): void
    {
        Invoice::factory()->count(2)->paid()->create();
        Invoice::factory()->draft()->create();

        $this->getJson('/api/stats')
            ->assertOk()
            ->assertJsonPath('data.invoices', 3)
            ->assertJsonPath('data.by_status.paid', 2)
            ->assertJsonPath('data.by_status.draft', 1);
    }
}
