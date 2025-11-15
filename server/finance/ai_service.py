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
