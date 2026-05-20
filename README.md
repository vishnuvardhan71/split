# Split Expense Tracker

A single-page React app to split group expenses, track net balances, and compute minimum settlement payments.

## Features

- Add/remove group members
- Record expenses with description, amount, and payer
- **Equal split** — divide among selected members
- **Custom split** — per-person amounts (must sum to total)
- Live net balances (paid − owed)
- Minimum-transaction settlement summary

## Quick start

```bash
cd split
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Demo data

Click **Load demo (A, B, C)** for three equal-split expenses (₹25 + ₹20 + ₹45 = ₹90):

- **A** is owed ₹40 (paid ₹70, fair share ₹30)
- **B** owes ₹10
- **C** owes ₹30

Settlements: B pays A ₹10, C pays A ₹30.

## Build

```bash
npm run build
npm run preview
```
