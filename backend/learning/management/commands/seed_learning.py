from django.core.management.base import BaseCommand
from learning.models import Topic, Lesson, Quiz, Question

class Command(BaseCommand):
    help = 'Seed the learning database with one topic, one lesson, one quiz, and questions.'

    def handle(self, *args, **options):
        topic, _ = Topic.objects.get_or_create(
            name='Algebra Basics',
            defaults={'description': 'Learn the fundamentals of algebra.'}
        )

        lesson, _ = Lesson.objects.get_or_create(
            topic=topic,
            title='Introduction to Variables',
            defaults={'content': 'Variables represent unknown values.'}
        )

        quiz, _ = Quiz.objects.get_or_create(
            lesson=lesson,
            title='Variables Quiz',
            defaults={'description': 'Test your understanding of variables.'}
        )

        Question.objects.get_or_create(
            quiz=quiz,
            question_text='What does x represent in algebra?',
            defaults={'correct_answer': 'An unknown value'}
        )
        Question.objects.get_or_create(
            quiz=quiz,
            question_text='If x + 2 = 5, what is x?',
            defaults={'correct_answer': '3'}
        )

        self.stdout.write(self.style.SUCCESS('Learning data seeded.'))
