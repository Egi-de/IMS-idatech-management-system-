import json
from django.conf import settings
from django.utils import timezone
from datetime import datetime

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
Generate a comprehensive and detailed report on this student's overall performance, progress, and potential. Analyze all available data including achievements, attendance records, academic performance, grades, program participation, and manual feedback from instructors, peers, and self-assessments.

Student Profile:
- Name: {getattr(student, 'name', 'Unknown')}
- Program: {getattr(student, 'program', 'Unknown')}
- GPA: {getattr(student, 'gpa', None)}
- Cumulative GPA: {getattr(student, 'cumulative_gpa', None)}
- Overall Attendance: {getattr(student, 'overallAttendance', None)}%
- Performance Rating: {getattr(student, 'performance', None)}
- Academic Standing: {getattr(student, 'academic_standing', None)}
- Current Semester: {getattr(student, 'current_semester', 'Unknown')}
- Total Achievement Points: {getattr(student, 'totalPoints', 0)}
- Total Projects: {getattr(student, 'totalProjects', 0)}
- Certifications: {getattr(student, 'certifications', 0)}

Academic Performance:
- Grades: {getattr(student, 'grades', {})}
- Completed Credits: {getattr(student, 'completed_credits', 0)}
- Assignments: {getattr(student, 'assignments', {})}

Activities and Achievements:
- Achievements: {getattr(student, 'achievements', [])}
- Projects: {getattr(student, 'projects', [])}
- Extracurricular: {getattr(student, 'extracurricular', [])}

Attendance Details:
- Present Days: {getattr(student, 'presentDays', 0)}
- Absent Days: {getattr(student, 'absentDays', 0)}
- Late Days: {getattr(student, 'lateDays', 0)}
- Excused Absences: {getattr(student, 'excusedAbsences', 0)}
- Current Streak: {getattr(student, 'currentStreak', 0)}
- Monthly Attendance Data: {getattr(student, 'monthlyData', {})}

{feedback_text}

Provide a detailed narrative report that includes:
1. Overall assessment of the student's academic and personal development
2. Analysis of attendance patterns and their impact on performance
3. Evaluation of academic achievements and grade trends
4. Assessment of participation in projects, extracurricular activities, and achievements
5. Summary and analysis of all manual feedback from instructors, peers, and self
6. Identification of key strengths and areas for improvement
7. Specific recommendations for future growth and development
8. Predictions or insights on the student's potential career trajectory

Make the report comprehensive, professional, and actionable. Structure it with clear sections and headings. End with a summary of what teachers and the student have said in their feedback.
"""
        return prompt

    def _build_comprehensive_prompt(self, students):
        # Build a comprehensive prompt for all students
        all_students_data = ""
        for i, student in enumerate(students, 1):
            feedback = getattr(student, 'feedback', [])
            feedback_text = ""
            if feedback:
                feedback_text = "\n    Manual Feedback:\n"
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

                    feedback_text += f"    - {feedback_type.title()} ({name}): Rating {f.get('rating', 'N/A')}/5\n"
                    feedback_text += f"      Comments: {f.get('comments', 'No comments')}\n"
                    if f.get('recommendations'):
                        feedback_text += f"      Recommendations: {f.get('recommendations')}\n"
                    feedback_text += "\n"

            all_students_data += f"""
Student {i}: {getattr(student, 'name', 'Unknown')}
- Program: {getattr(student, 'program', 'Unknown')}
- GPA: {getattr(student, 'gpa', None)}
- Cumulative GPA: {getattr(student, 'cumulative_gpa', None)}
- Overall Attendance: {getattr(student, 'overallAttendance', None)}%
- Performance Rating: {getattr(student, 'performance', None)}
- Academic Standing: {getattr(student, 'academic_standing', None)}
- Current Semester: {getattr(student, 'current_semester', 'Unknown')}
- Total Achievement Points: {getattr(student, 'totalPoints', 0)}
- Total Projects: {getattr(student, 'totalProjects', 0)}
- Certifications: {getattr(student, 'certifications', 0)}
- Grades: {getattr(student, 'grades', {})}
- Completed Credits: {getattr(student, 'completed_credits', 0)}
- Assignments: {getattr(student, 'assignments', {})}
- Achievements: {getattr(student, 'achievements', [])}
- Projects: {getattr(student, 'projects', [])}
- Extracurricular: {getattr(student, 'extracurricular', [])}
- Attendance Details: Present {getattr(student, 'presentDays', 0)}, Absent {getattr(student, 'absentDays', 0)}, Late {getattr(student, 'lateDays', 0)}, Excused {getattr(student, 'excusedAbsences', 0)}
- Monthly Attendance Data: {getattr(student, 'monthlyData', {})}
{feedback_text}
"""

        current_date = datetime.now().strftime("%B %d, %Y")

        prompt = f"""
Generate a comprehensive and detailed overall student report (approximately 500-700 words) that demonstrates the academic life of all students in the institution. Analyze all available data including achievements, attendance records, academic performance, grades, program participation, and manual feedback from instructors, peers, and self-assessments.

Current Date: {current_date}

All Students Data:
{all_students_data}

Provide a detailed narrative report that includes:

1. **Overall Institutional Assessment**: A comprehensive overview of the academic and personal development across all students.

2. **Attendance Patterns Analysis**: Detailed analysis of attendance patterns and their impact on overall performance, including trends and correlations.

3. **Academic Achievements Evaluation**: Evaluation of academic achievements, grade trends, and performance distributions across programs.

4. **Participation and Activities Assessment**: Assessment of participation in projects, extracurricular activities, and achievements, highlighting engagement levels.

5. **Manual Feedback Summary and Analysis**: Comprehensive summary and analysis of all manual feedback from instructors, peers, and self-assessments, identifying common themes and insights.

6. **Student Performance Classification**:
   - **Strong Performers** (highlight in green): Identify students who are excelling academically, have excellent attendance, and show consistent improvement. List their key strengths and achievements.
   - **Students Needing Improvement** (highlight in red): Identify students who are struggling with low GPA, poor attendance, or other issues that need immediate attention. List specific areas of concern and reasons behind their challenges.

7. **Progress and Regression Analysis**: Showcase specific examples of students who were doing well and later failed (with reasons), and students who were struggling and later improved (with reasons). Analyze the factors contributing to these changes.

8. **Key Strengths and Areas for Improvement**: Identification of institutional-wide strengths and areas that need improvement.

9. **Specific Recommendations**: Actionable recommendations for future growth and development at both individual and institutional levels.

10. **Career Trajectory Predictions**: Insights on potential career trajectories based on current performance and trends.

Make the report comprehensive (around 500-700 words), professional, and actionable. Structure it with clear sections using **bold headings** and <u>underlined subheadings</u> where appropriate. For highlighting, use HTML-style spans: <span style="color: green;"> for strong performers and <span style="color: red;"> for those needing improvement. End with a summary of what teachers and students have said in their feedback.

Ensure the report covers the academic life of each student individually while providing collective insights.
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

    def generate_comprehensive_report(self, students, max_retries=1):
        prompt = self._build_comprehensive_prompt(students)
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
