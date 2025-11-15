from django.core.management.base import BaseCommand
from django.utils import timezone

from student.models import Student
from student.ai_service import StudentAIEvaluator


class Command(BaseCommand):
    help = 'Generate AI evaluations for students using configured Gemini API'

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, help='Limit number of students to process')

    def handle(self, *args, **options):
        limit = options.get('limit')
        students_qs = Student.objects.filter(is_deleted=False)
        if limit:
            students_qs = students_qs[:limit]

        try:
            evaluator = StudentAIEvaluator()
        except Exception as exc:
            self.stderr.write(self.style.ERROR(f'Failed to initialize AI evaluator: {exc}'))
            return

        processed = 0
        for student in students_qs:
            try:
                result = evaluator.generate_evaluation(student)
                now = timezone.now()

                # Append to history
                history = student.ai_evaluation_history or []
                history_entry = {
                    'ts': now.isoformat(),
                    'data': result,
                }
                history.append(history_entry)

                student.ai_evaluation_history = history
                student.ai_evaluation_data = result
                student.ai_evaluation_last_updated = now
                student.save()
                processed += 1
                self.stdout.write(self.style.SUCCESS(f'Processed student {student.id} - {student.name}'))
            except Exception as exc:
                self.stderr.write(self.style.ERROR(f'Error processing student {student.id}: {exc}'))
                continue

        self.stdout.write(self.style.SUCCESS(f'Done. Processed {processed} students.'))
