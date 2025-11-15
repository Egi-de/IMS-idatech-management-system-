import json
from django.conf import settings
from django.utils import timezone

try:
    import google.generativeai as genai
except Exception:
    genai = None


class StudentAIEvaluator:
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

    def _build_prompt(self, student):
        # Build a comprehensive prompt including achievements, attendance, performance, grades, and manual feedback
        feedback = getattr(student, 'feedback', [])
        feedback_text = ""
        if feedback:
            feedback_text = "\nManual Feedback:\n"
            for f in feedback:
                feedback_type = f.get('type', 'unknown')
                if feedback_type == 'instructor':
                    name = f.get('instructor', 'Unknown Instructor')
                elif feedback_type == 'peer':
                    name = f.get('peer', 'Unknown Peer')
                elif feedback_type == 'self':
                    name = 'Self'
                else:
                    name = 'Unknown'

                feedback_text += f"- {feedback_type.title()} ({name}): Rating {f.get('rating', 'N/A')}/5\n"
                feedback_text += f"  Comments: {f.get('comments', 'No comments')}\n"
                if f.get('recommendations'):
                    feedback_text += f"  Recommendations: {f.get('recommendations')}\n"
                feedback_text += "\n"

        prompt = f"""
Analyze this student's performance and provide unbiased feedback in JSON format based on all available data: achievements, attendance, performance, grades, and manual feedback.

Student Data:
- Achievements: {getattr(student, 'achievements', [])}
- Attendance: {getattr(student, 'overallAttendance', None)}%
- Performance: {getattr(student, 'performance', None)}
- GPA: {getattr(student, 'gpa', None)}
- Cumulative GPA: {getattr(student, 'cumulative_gpa', None)}
- Grades: {getattr(student, 'grades', {})}
{feedback_text}

Provide the response as JSON with these keys:
 - overall_rating (0-5)
 - performance_rating (0-5)
 - participation_rating (0-5)
 - attitude_rating (0-5)
 - skills_rating (0-5)
 - strengths: list of 3-5 items
 - areas_for_improvement: list of 3-5 items
 - recommendations: list of actionable recommendations

Consider all manual feedback (instructor, peer, self) in your analysis and ratings. Return only valid JSON.
"""
        return prompt

    def generate_evaluation(self, student, max_retries=1):
        prompt = self._build_prompt(student)
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
            except Exception:
                # If the model returned extra text, attempt to extract the first JSON block
                start = text.find('{')
                end = text.rfind('}')
                if start != -1 and end != -1 and end > start:
                    try:
                        parsed = json.loads(text[start:end+1])
                    except Exception:
                        parsed = {'raw': text}
                else:
                    parsed = {'raw': text}

            return {
                'generated_at': timezone.now().isoformat(),
                'model': self.model_name,
                'result': parsed,
                'raw_text': text,
            }
        except Exception as exc:
            return {
                'generated_at': timezone.now().isoformat(),
                'error': str(exc),
            }
