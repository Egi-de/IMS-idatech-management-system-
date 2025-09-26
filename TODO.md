# TODO: Make Financial Report Cards Fully Functional with Backend Integration

## Overview

Enhance the financial reports in `client/src/pages/Financial.jsx` to integrate with the backend via API calls to `server/finance/views.py`. Compute structured report data server-side for efficiency. Add loading states, error handling, charts in modals, and PDF download option. Ensure senior-level quality: clean, performant, accessible code.

## Steps

### 1. Update Backend: Enhance ReportView in server/finance/views.py

- [x] Parse query params: report_type (monthly/pnl/cashflow/custom), start_date, end_date, type_filter.
- [x] Filter queryset by dates (using date\_\_range for start/end) and type.
- [x] Compute aggregates: total_income (Sum for Income), total_expenses (Sum for Expense), net_profit.
- [x] For P&L and Cash Flow: Compute category breakdowns using annotate/group by.
- [x] For Monthly: Default to current month if no dates.
- [x] For Custom: Use provided filters.
- [x] Serialize filtered transactions.
- [x] Return structured JSON: {type, period, income, expenses, net, transactions: [], income_by_category: {}, expenses_by_category: {}}.
- [x] Handle edge cases: No data (return 0s/empty), invalid dates.
- [x] Add imports: timezone, datetime.
- [x] Test: Manually via Django shell or Postman (e.g., GET /api/reports/?report_type=monthly).

### 2. Add PDF Generation Backend (Optional but Amazing)

- [ ] Install reportlab: Add to server/requirements.txt.
- [ ] Create new view: ReportPDFView (POST with params, generate PDF using reportlab, return file response).
- [ ] Update api.js: Add generatePDFReport(params).
- [ ] In frontend modals: Add Download PDF button calling the API.

### 3. Update Frontend: client/src/pages/Financial.jsx

- [ ] Import getReports from api.js.
- [ ] Add states: reportData, reportLoading, reportError.
- [ ] Implement handleGenerateReport(async, with params based on type, set data/loading, open modal).
- [ ] Implement handleCustomReport (open builder modal).
- [ ] Add handleCustomFilterChange and generateCustom (API call with filters).
- [ ] Complete Custom Report Builder Modal: Full form (Inputs for dates, Select for type), Generate button.
- [ ] Update Report Modal:
  - Conditional rendering per report_type from reportData (totals cards, breakdowns lists/tables, transactions table).
  - Integrate FinancialChart for visuals (e.g., bar for income/expenses, pie for categories).
  - Loading spinner, error display (use Toast for errors).
  - Download button (print or PDF API).
- [ ] In renderReports: Wire buttons to handlers; show loading on Generate.
- [ ] Optimizations: useCallback for handlers, memo for computations, accessibility (aria-labels, keyboard nav).
- [ ] Error handling: Catch API errors, show user-friendly messages.

### 4. Testing and Verification

- [ ] Run backend: cd server && python manage.py runserver.
- [ ] Run frontend: cd client && npm run dev.
- [ ] Seed sample data if needed (via admin or shell).
- [ ] Test UI: Navigate to Financial > Reports, click Generate – verify modal data/charts from backend.
- [ ] Test Custom: Set filters, generate – check filtered results.
- [ ] Test edge cases: No data, invalid dates, network errors.
- [ ] Use browser_action: Launch localhost:5173, click buttons, verify screenshots.
- [ ] Update TODO: Mark completed steps.

### 5. Polish and Enhancements

- [ ] Add animations (e.g., framer-motion for modals/charts).
- [ ] Export to CSV (client-side from reportData).
- [ ] Analytics: Track report generations (optional backend log).
- [ ] Performance: Paginate transactions if large; cache reports.

Progress: Completed Step 1. Starting Step 2.
