<?php

namespace App\Models;

use Database\Factories\InvoiceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['number', 'customer_id', 'issue_date', 'due_date', 'status', 'tax_rate', 'notes'])]
class Invoice extends Model
{
    /** @use HasFactory<InvoiceFactory> */
    use HasFactory;

    public const STATUSES = ['draft', 'issued', 'paid', 'cancelled'];

    protected $appends = ['subtotal', 'tax', 'total'];

    protected function casts(): array
    {
        return [
            'issue_date' => 'date',
            'due_date' => 'date',
            'tax_rate' => 'decimal:2',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Invoice $invoice): void {
            if (empty($invoice->number)) {
                $next = (int) (static::max('id') ?? 0) + 1;
                $invoice->number = 'INV-'.str_pad((string) $next, 5, '0', STR_PAD_LEFT);
            }
        });
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    protected function subtotal(): Attribute
    {
        return Attribute::get(
            fn (): float => round((float) $this->items->sum(fn (InvoiceItem $item): float => $item->line_total), 2)
        );
    }

    protected function tax(): Attribute
    {
        return Attribute::get(
            fn (): float => round($this->subtotal * ((float) $this->tax_rate / 100), 2)
        );
    }

    protected function total(): Attribute
    {
        return Attribute::get(
            fn (): float => round($this->subtotal + $this->tax, 2)
        );
    }
}
