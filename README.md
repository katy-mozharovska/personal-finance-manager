# Pocket Ledger — Personal Finance Manager

A simple personal finance management application built with TypeScript. It helps users track income and expenses, manage categories, and review their spending.

## Features

- Create, edit, and delete income and expense records.
- Manage transaction categories.
- Filter transactions by category and type.
- Generate financial reports for selected periods.
- Visualize expenses by category.
- Export transaction data to CSV and JSON.
- Persist data in browser local storage.

## Technologies

- TypeScript
- HTML5
- Bootstrap 5
- Vite
- Highcharts
- Local Storage

## Getting Started

**Prerequisites:** Node.js 22 or later and npm.

1. Clone the repository:
   ```bash
   git clone https://github.com/katy-mozharovska/personal-finance-manager.git
   ```

2. Navigate to the project directory:
   ```bash
   cd personal-finance-manager
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build the project:
   ```bash
   npm run build
   ```

## Data Storage

Application data is stored locally in the browser using Local Storage. No backend or database connection is required.

## CI

GitHub Actions automatically runs the project build on pushes and pull requests targeting the `main` branch.