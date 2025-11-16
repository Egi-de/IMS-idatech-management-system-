import json
from django.conf import settings
from django.utils import timezone
from datetime import datetime

try:
    import google.generativeai as genai
except Exception:
    genai = None


class EmployeeAIEvaluator:
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

    def _build_comprehensive_prompt(self, employees, user_feedback):
        # Build a comprehensive prompt for all employees
        all_employees_data = ""
        for i, employee in enumerate(employees, 1):
            all_employees_data += f"""
Employee {i}: {getattr(employee, 'name', 'Unknown')}
- Employee ID: {getattr(employee, 'employeeId', 'Unknown')}
- Position: {getattr(employee, 'position', 'Unknown')}
- Department: {employee.department.get_name_display() if hasattr(employee, 'department') and employee.department else 'Unknown'}
- Salary: {getattr(employee, 'salary', 'Unknown')}
- Status: {getattr(employee, 'status', 'Unknown')}
- Date Joined: {getattr(employee, 'date_joined', 'Unknown')}
- Email: {getattr(employee, 'email', 'Unknown')}
- Phone: {getattr(employee, 'phone', 'Unknown')}
- Address: {getattr(employee, 'address', 'Unknown')}
- Gender: {getattr(employee, 'gender', 'Unknown')}
"""

        current_date = datetime.now().strftime("%B %d, %Y")

        prompt = f"""
Generate a comprehensive and detailed overall employee report (approximately 500-700 words) that demonstrates the professional life and departmental dynamics of all employees in the institution. Analyze all available data including employee performance, departmental distribution, status changes, and user feedback.

Current Date: {current_date}

All Employees Data:
{all_employees_data}

User Feedback: {user_feedback}

Provide a detailed narrative report that includes:

1. **Overall Institutional Workforce Assessment**: A comprehensive overview of the employee distribution across departments and their professional status.

2. **Departmental Distribution Analysis**: Detailed analysis of how employees are distributed across different departments (Academic, Catering, Finance, Discipline & Welfare), including strengths and potential imbalances.

3. **Employee Status Overview**: Analysis of employee statuses including:
   - Number of active employees
   - Number of employees on leave
   - Number of resigned employees
   - Number of terminated employees
   - Trends and implications of these status distributions

4. **Departmental Performance Insights**: Assessment of each department's composition, highlighting key roles and potential areas for improvement.

5. **Employee Lifecycle Analysis**: Analysis of employee tenure, new hires, and turnover patterns.

6. **User Feedback Integration**: Incorporate and analyze the user's feedback about employee behavior and performance, providing insights and recommendations based on this input.

7. **Departmental Dynamics**: Discussion of how different departments interact and support the overall institutional goals.

8. **Key Strengths and Areas for Improvement**: Identification of institutional-wide strengths in workforce management and areas that need improvement.

9. **Specific Recommendations**: Actionable recommendations for workforce development, departmental balance, and employee management.

10. **Future Workforce Planning**: Insights on potential hiring needs, departmental expansions, and workforce optimization.

Make the report comprehensive (around 500-700 words), professional, and actionable. Structure it with clear sections using **bold headings** and <u>underlined subheadings</u> where appropriate. End with a summary incorporating the user's feedback about employee behavior.

Ensure the report covers the professional life of each employee individually while providing collective departmental insights.
"""
        return prompt

    def generate_comprehensive_report(self, employees, user_feedback, max_retries=1):
        prompt = self._build_comprehensive_prompt(employees, user_feedback)
        try:
            # Initialize the model
            model = genai.GenerativeModel(self.model_name)

            # Generate content
            response = model.generate_content(prompt)

            # Get the text from response
            text = response.text if hasattr(response, 'text') else str(response)

            return {
                'generated_at': timezone.now().isoformat(),
                'model': self.model_name,
                'report': text,
            }
        except Exception as exc:
            return {
                'generated_at': timezone.now().isoformat(),
                'error': str(exc),
            }
