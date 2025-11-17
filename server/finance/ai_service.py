import json
from django.conf import settings
from django.utils import timezone

try:
    import google.generativeai as genai
except Exception:
    genai = None


class TransactionAIClassifier:
    def __init__(self):
        api_key = getattr(settings, 'GEMINI_API_KEY', None)
        if not api_key:
            raise RuntimeError('GEMINI_API_KEY is not configured in settings or environment')

        if genai is None:
            raise RuntimeError('google.generativeai package is not installed')

        genai.configure(api_key=api_key)
        model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-2.5-flash')
        # Ensure model name has the 'models/' prefix if not already present
        if not model_name.startswith('models/'):
            model_name = f'models/{model_name}'
        self.model_name = model_name
        # Note: the generative ai package interface may change; callers should handle exceptions

    def _build_prompt(self, transaction_data):
        # Build a prompt to classify transaction as Income or Expense and status as Completed or Pending
        prompt = f"""
Analyze this financial transaction and classify it based on the category and description.

Transaction Data:
- Category: {transaction_data.get('category', '')}
- Description: {transaction_data.get('description', '')}
- Amount: {transaction_data.get('amount', '')}

First, classify the type as "Income" or "Expense":
- Common Income categories: Salary, Other (if positive amount)
- Common Expense categories: Rent, Utilities, Groceries, Transportation, Entertainment, Healthcare, Education, Other (if negative amount)

Second, classify the status as "Completed" or "Pending" based on the description:
- If the description indicates the transaction is done, finalized, or completed, use "Completed"
- If the description suggests it's upcoming, planned, or not yet finalized, use "Pending"
- Default to "Completed" if unclear

Return only a JSON object with keys "type" ("Income" or "Expense") and "status" ("Completed" or "Pending").
"""
        return prompt

    def classify_transaction(self, transaction_data, max_retries=1):
        prompt = self._build_prompt(transaction_data)
        try:
            # Initialize the model
            model = genai.GenerativeModel(self.model_name)

            # Generate content
            response = model.generate_content(prompt)

            # Get the text from response
            text = response.text if hasattr(response, 'text') else str(response)

            # Try to parse JSON from the response text
            try:
                parsed = json.loads(text)
                transaction_type = parsed.get('type', 'Expense')  # Default to Expense if unclear
                transaction_status = parsed.get('status', 'Completed')  # Default to Completed if unclear
            except Exception:
                # If the model returned extra text, attempt to extract the first JSON block
                start = text.find('{')
                end = text.rfind('}')
                if start != -1 and end != -1 and end > start:
                    try:
                        parsed = json.loads(text[start:end+1])
                        transaction_type = parsed.get('type', 'Expense')
                        transaction_status = parsed.get('status', 'Completed')
                    except Exception:
                        transaction_type = 'Expense'  # Default fallback
                        transaction_status = 'Completed'  # Default fallback
                else:
                    transaction_type = 'Expense'  # Default fallback
                    transaction_status = 'Completed'  # Default fallback

            # Validate the type
            if transaction_type not in ['Income', 'Expense']:
                transaction_type = 'Expense'

            # Validate the status
            if transaction_status not in ['Completed', 'Pending']:
                transaction_status = 'Completed'

            return {'type': transaction_type, 'status': transaction_status}

        except Exception as exc:
            # In case of any error, default to Expense and Completed
            return {'type': 'Expense', 'status': 'Completed'}


class FinancialAIReportGenerator:
    def __init__(self):
        self.api_key = getattr(settings, 'GEMINI_API_KEY', None)
        self.genai_available = self.api_key and genai is not None
        if self.genai_available:
            genai.configure(api_key=self.api_key)
            model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-2.5-flash')
            # Ensure model name has the 'models/' prefix if not already present
            if not model_name.startswith('models/'):
                model_name = f'models/{model_name}'
            self.model_name = model_name

    def generate_insights_and_recommendations(self, financial_data):
        """
        Generate comprehensive AI-powered financial report based on financial data.
        """
        if not self.genai_available:
            # Fallback to static HTML report if Gemini not available
            return self._generate_static_report(financial_data)

        screenshots = financial_data.get('screenshots', [])
        prompt = f"""
Based on the following financial data, generate a comprehensive financial report for the organization. Include all the following sections in your response. Structure the response as HTML content that can be rendered directly, using headings, paragraphs, tables, lists, and bold text for clarity. Use <h2> for section headings, <p> for paragraphs, <table> for tables, <ul> for lists, etc. Make it visually appealing and professional.

Financial Summary:
- Total Revenue: ${financial_data.get('total_revenue', 0):.2f}
- Total Expenses: ${financial_data.get('total_expenses', 0):.2f}
- Net Profit: ${financial_data.get('net_profit', 0):.2f}

Revenue Breakdown by Category:
{json.dumps(financial_data.get('revenue_breakdown', {}), indent=2)}

Expense Breakdown by Category:
{json.dumps(financial_data.get('expense_breakdown', {}), indent=2)}

Monthly Revenue Trends (last 6 months):
{json.dumps(financial_data.get('monthly_revenue', {}), indent=2)}

Available Screenshots: {', '.join(screenshots) if screenshots else 'None'}

Include the following sections in the report:

1. **Cash Flow Analysis**
   - Show Cash inflow (total revenue)
   - Cash outflow (total expenses)
   - Ending cash balance (net profit)
   - Explain whether the business has a healthy cash position.

2. **Variance / Comparison Section**
   - Compare Current vs previous period (use monthly trends for comparison)
   - Budget vs actual performance (assume budget is 10% higher than actual for demonstration; note if data unavailable)
   - Planned vs actual expenses (similar assumption)
   - Tell the reader why numbers changed.

3. **KPI (Key Performance Indicators)**
   - Include measurable financial indicators: ROI (assume based on net profit/revenue), Gross margin (revenue - COGS, assume COGS is 60% of expenses), Operating margin (net profit/revenue), Customer acquisition cost (not available, note), Revenue per employee (not available, note)

4. **Financial Ratios**
   - Liquidity ratio (current assets/current liabilities; assume current assets = revenue, liabilities = expenses)
   - Debt-to-equity ratio (not available, note)
   - Current ratio (similar to liquidity)
   - Quick ratio (similar)
   - Profitability ratio (net profit/revenue)

5. **Interpretation & Insights**
   - Strong financial report: explain what the numbers mean, insights, reasons for changes, risks, opportunities.

6. **Forecast & Recommendations**
   - Sales forecast (based on trends)
   - Expense forecast
   - Suggestions for improvement

Additionally, include:
- **Tables**: For clear data, e.g., revenue/expense breakdown tables.
- **Highlights Box**: Key numbers: total revenue, total expenses, total profit.
- **Trend Analysis**: Analyze monthly trends.
- **Scenario Analysis**: Best case (20% increase), worst case (20% decrease).

Ensure the entire response is valid HTML content wrapped in a single string. Do not include JSON structure; just the HTML report.
"""
        try:
            model = genai.GenerativeModel(self.model_name)
            response = model.generate_content(prompt)
            text = response.text if hasattr(response, 'text') else str(response)

            # Since it's HTML, return the text directly
            if text.strip().startswith('<'):
                return {"report": text}
            else:
                # If not HTML, wrap or fallback
                return {"report": f"<p>{text}</p>"}

        except Exception as exc:
            # Fallback to static report
            return self._generate_static_report(financial_data)

    def _generate_static_report(self, financial_data):
        """
        Generate a static HTML report when AI is not available.
        """
        total_revenue = financial_data.get('total_revenue', 0)
        total_expenses = financial_data.get('total_expenses', 0)
        net_profit = financial_data.get('net_profit', 0)
        revenue_breakdown = financial_data.get('revenue_breakdown', {})
        expense_breakdown = financial_data.get('expense_breakdown', {})
        monthly_revenue = financial_data.get('monthly_revenue', {})
        screenshots = financial_data.get('screenshots', [])

        # Calculate some metrics
        roi = (net_profit / total_revenue * 100) if total_revenue > 0 else 0
        gross_margin = ((total_revenue - total_expenses * 0.6) / total_revenue * 100) if total_revenue > 0 else 0
        operating_margin = (net_profit / total_revenue * 100) if total_revenue > 0 else 0
        liquidity_ratio = total_revenue / total_expenses if total_expenses > 0 else 0
        profitability_ratio = net_profit / total_revenue if total_revenue > 0 else 0

        # Build HTML report
        html = f"""
<h2>Highlights Box</h2>
<div style="border: 2px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f9f9f9;">
    <strong>Total Revenue:</strong> ${total_revenue:.2f}<br>
    <strong>Total Expenses:</strong> ${total_expenses:.2f}<br>
    <strong>Net Profit:</strong> ${net_profit:.2f}
</div>

<h2>Cash Flow Analysis</h2>
<p><strong>Cash Inflow:</strong> ${total_revenue:.2f}</p>
<p><strong>Cash Outflow:</strong> ${total_expenses:.2f}</p>
<p><strong>Ending Cash Balance:</strong> ${net_profit:.2f}</p>
<p>The business has a {'healthy' if net_profit > 0 else 'unhealthy'} cash position, with {'positive' if net_profit > 0 else 'negative'} net cash flow.</p>

<h2>Variance / Comparison Section</h2>
<p>Current vs Previous Period: Based on monthly trends, revenue has shown {'increasing' if len(monthly_revenue) > 1 and list(monthly_revenue.values())[-1] > list(monthly_revenue.values())[-2] else 'varying'} trends.</p>
<p>Budget vs Actual: Assuming budget is 10% higher than actual, the organization is {'under' if total_revenue < total_expenses * 1.1 else 'over'} performing against budget.</p>
<p>Numbers may change due to market conditions, operational efficiencies, or external factors.</p>

<h2>KPI (Key Performance Indicators)</h2>
<ul>
    <li><strong>ROI:</strong> {roi:.2f}%</li>
    <li><strong>Gross Margin:</strong> {gross_margin:.2f}%</li>
    <li><strong>Operating Margin:</strong> {operating_margin:.2f}%</li>
    <li><strong>Customer Acquisition Cost:</strong> Not available</li>
    <li><strong>Revenue per Employee:</strong> Not available</li>
</ul>

<h2>Financial Ratios</h2>
<ul>
    <li><strong>Liquidity Ratio:</strong> {liquidity_ratio:.2f}</li>
    <li><strong>Debt-to-Equity Ratio:</strong> Not available</li>
    <li><strong>Current Ratio:</strong> {liquidity_ratio:.2f}</li>
    <li><strong>Quick Ratio:</strong> {liquidity_ratio:.2f}</li>
    <li><strong>Profitability Ratio:</strong> {profitability_ratio:.2f}</li>
</ul>

<h2>Interpretation & Insights</h2>
<p>The financial data indicates {'strong' if net_profit > 0 else 'weak'} performance with {'positive' if net_profit > 0 else 'negative'} profitability. Insights include potential for cost optimization and revenue growth. Risks involve market volatility, while opportunities exist in expanding services.</p>

<h2>Forecast & Recommendations</h2>
<p>Sales Forecast: Based on trends, revenue is expected to {'grow' if len(monthly_revenue) > 1 and list(monthly_revenue.values())[-1] > list(monthly_revenue.values())[0] else 'stabilize'}.</p>
<p>Expense Forecast: Expenses may {'increase' if total_expenses > total_revenue * 0.5 else 'decrease'} based on operational needs.</p>
<p>Recommendations:</p>
<ul>
    <li>Monitor expenses closely</li>
    <li>Explore additional revenue streams</li>
    <li>Implement cost-saving measures</li>
</ul>

<h2>Tables</h2>
<h3>Revenue Breakdown</h3>
<table border="1" style="width: 100%; border-collapse: collapse;">
    <tr><th>Category</th><th>Amount</th></tr>
    {''.join(f'<tr><td>{cat}</td><td>${amt:.2f}</td></tr>' for cat, amt in revenue_breakdown.items())}
</table>

<h3>Expense Breakdown</h3>
<table border="1" style="width: 100%; border-collapse: collapse;">
    <tr><th>Category</th><th>Amount</th></tr>
    {''.join(f'<tr><td>{cat}</td><td>${amt:.2f}</td></tr>' for cat, amt in expense_breakdown.items())}
</table>

<h2>Trend Analysis</h2>
<p>Monthly revenue trends show {'consistent growth' if len(monthly_revenue) > 1 and all(list(monthly_revenue.values())[i] <= list(monthly_revenue.values())[i+1] for i in range(len(monthly_revenue)-1)) else 'fluctuations'} over the past 6 months.</p>

<h2>Scenario Analysis</h2>
<p><strong>Best Case:</strong> 20% revenue increase leads to ${total_revenue * 1.2:.2f} revenue and ${net_profit * 1.2:.2f} profit.</p>
<p><strong>Worst Case:</strong> 20% revenue decrease leads to ${total_revenue * 0.8:.2f} revenue and ${net_profit * 0.8:.2f} profit.</p>
"""
        return {"report": html}
