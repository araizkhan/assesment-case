# Billing Periods Calculator

A function that calculates monthly billing periods based on a cutoff date and year.

## How to Run

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Function Usage

```javascript
const { calcBillingPeriods } = require('./calcBillingPeriods');

// Both string and numeric years work
const periods1 = calcBillingPeriods(15, "2023"); // ✅ Works
const periods2 = calcBillingPeriods(15, 2023);   // ✅ Now works too
```
