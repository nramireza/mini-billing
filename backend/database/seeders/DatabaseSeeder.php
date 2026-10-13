<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (Customer::query()->exists()) {
            return;
        }

        Customer::factory()
            ->count(8)
            ->create()
            ->each(function (Customer $customer): void {
                Invoice::factory()
                    ->count(fake()->numberBetween(2, 5))
                    ->for($customer)
                    ->create()
                    ->each(function (Invoice $invoice): void {
                        InvoiceItem::factory()
                            ->count(fake()->numberBetween(1, 4))
                            ->for($invoice)
                            ->create();
                    });
            });
    }
}
