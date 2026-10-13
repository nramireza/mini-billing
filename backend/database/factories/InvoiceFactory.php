<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Invoice;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Invoice>
 */
class InvoiceFactory extends Factory
{
    protected $model = Invoice::class;

    public function definition(): array
    {
        $issue = fake()->dateTimeBetween('-6 months', 'now');

        return [
            'customer_id' => Customer::factory(),
            'issue_date' => $issue,
            'due_date' => (clone $issue)->modify('+30 days'),
            'status' => fake()->randomElement(Invoice::STATUSES),
            'tax_rate' => 19.00,
            'notes' => fake()->optional()->sentence(),
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (): array => ['status' => 'draft']);
    }

    public function paid(): static
    {
        return $this->state(fn (): array => ['status' => 'paid']);
    }
}
