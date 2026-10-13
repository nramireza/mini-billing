<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Invoice;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_lists_customers_paginated(): void
    {
        Customer::factory()->count(3)->create();

        $response = $this->getJson('/api/customers');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [['id', 'name', 'tax_id', 'invoices_count']],
                'meta' => ['current_page', 'total'],
            ])
            ->assertJsonPath('meta.total', 3);
    }

    public function test_it_searches_customers_by_name(): void
    {
        Customer::factory()->create(['name' => 'Acme SpA', 'tax_id' => '11.111.111-1']);
        Customer::factory()->create(['name' => 'Globex Ltda', 'tax_id' => '22.222.222-2']);

        $response = $this->getJson('/api/customers?q=Acme');

        $response->assertOk()->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.name', 'Acme SpA');
    }

    public function test_it_creates_a_customer(): void
    {
        $response = $this->postJson('/api/customers', [
            'name' => 'Initech SpA',
            'tax_id' => '76.543.210-K',
            'email' => 'contacto@initech.cl',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'Initech SpA')
            ->assertJsonPath('data.tax_id', '76.543.210-K');

        $this->assertDatabaseHas('customers', ['tax_id' => '76.543.210-K']);
    }

    public function test_it_validates_required_fields_and_unique_tax_id(): void
    {
        Customer::factory()->create(['tax_id' => '99.999.999-9']);

        $response = $this->postJson('/api/customers', [
            'name' => '',
            'tax_id' => '99.999.999-9',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'tax_id']);
    }

    public function test_it_updates_a_customer(): void
    {
        $customer = Customer::factory()->create();

        $response = $this->putJson("/api/customers/{$customer->id}", [
            'name' => 'Nombre Actualizado',
        ]);

        $response->assertOk()->assertJsonPath('data.name', 'Nombre Actualizado');
    }

    public function test_it_deletes_a_customer_without_invoices(): void
    {
        $customer = Customer::factory()->create();

        $this->deleteJson("/api/customers/{$customer->id}")->assertNoContent();

        $this->assertDatabaseMissing('customers', ['id' => $customer->id]);
    }

    public function test_it_blocks_deleting_a_customer_with_invoices(): void
    {
        $customer = Customer::factory()->create();
        Invoice::factory()->for($customer)->create();

        $this->deleteJson("/api/customers/{$customer->id}")->assertStatus(409);

        $this->assertDatabaseHas('customers', ['id' => $customer->id]);
    }
}
