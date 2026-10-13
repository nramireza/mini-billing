<?php

namespace Database\Factories;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Customer>
 */
class CustomerFactory extends Factory
{
    protected $model = Customer::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->company(),
            'tax_id' => fake()->unique()->numerify('##.###.###-#'),
            'email' => fake()->unique()->companyEmail(),
            'phone' => fake()->numerify('+56 9 #### ####'),
            'address' => fake()->address(),
        ];
    }
}
