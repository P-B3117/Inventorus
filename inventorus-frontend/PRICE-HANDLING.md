# Price Handling in Inventorus

## Overview
Prices in the Inventorus system are stored as **integers representing cents** to avoid floating-point precision issues.

## Implementation

### Backend (Zig)
- SQL Schema: `price INTEGER NOT NULL DEFAULT 0`
- Zig Struct: `price: u16` (supports prices up to $655.35)
- Storage: Raw cents value (e.g., 150 for $1.50)

### Frontend (TypeScript/React)
- Interface: `price: number // Price in cents`
- Display: Formatted as dollars using `formatPrice()` function
- Input: User enters dollars, converted to cents automatically

## Examples

| User Input | Stored Value | Display Value |
|------------|--------------|---------------|
| $0.50      | 50          | $0.50         |
| $1.25      | 125         | $1.25         |
| $15.99     | 1599        | $15.99        |
| $100.00    | 10000       | $100.00       |

## Conversion Functions

### Frontend (components.tsx)
```typescript
// Convert cents to formatted dollar string
const formatPrice = (cents: number) => {
  return `$${(cents / 100).toFixed(2)}`;
};

// Convert dollar input to cents
const handlePriceChange = (value: string) => {
  const dollars = parseFloat(value) || 0;
  const cents = Math.round(dollars * 100);
  handleInputChange('price', cents);
};
```

## Benefits
1. **No Floating-Point Errors**: Avoids issues like `0.1 + 0.2 ≠ 0.3`
2. **Exact Arithmetic**: All price calculations are exact
3. **Database Efficiency**: Integer storage is more efficient
4. **API Consistency**: Simple integer values in JSON responses
5. **Currency Agnostic**: Easy to support different currencies

## Usage Notes
- Always store and transmit prices as integer cents
- Format for display only when presenting to users
- Validate that prices don't exceed u16 max value (65535 = $655.35)
- Round to nearest cent when converting from decimal input
