from django.core.management.base import BaseCommand
from learning.models import Topic, Lesson, Quiz, Question

class Command(BaseCommand):
    help = 'Seed the learning database with sample learning topics, lessons, quizzes, and questions.'

    def handle(self, *args, **options):
        algebra_topic, _ = Topic.objects.get_or_create(
            name='Algebra Basics',
            defaults={'description': 'Learn the fundamentals of algebra.'}
        )

        variables_lesson, _ = Lesson.objects.get_or_create(
            topic=algebra_topic,
            title='Introduction to Variables',
            defaults={'content': 'Variables represent unknown values that can change.'}
        )

        variables_quiz, _ = Quiz.objects.get_or_create(
            lesson=variables_lesson,
            title='Variables Quiz',
            defaults={'description': 'Test your understanding of algebraic variables.'}
        )

        Question.objects.get_or_create(
            quiz=variables_quiz,
            question_text='What does x represent in algebra?',
            defaults={
                'choices': ['An unknown value', 'A number that is always 1', 'A shape', 'A constant'],
                'correct_answer': 'An unknown value'
            }
        )
        Question.objects.get_or_create(
            quiz=variables_quiz,
            question_text='If x + 2 = 5, what is x?',
            defaults={
                'choices': ['1', '2', '3', '4'],
                'correct_answer': '3'
            }
        )

        equations_lesson, _ = Lesson.objects.get_or_create(
            topic=algebra_topic,
            title='Solving Linear Equations',
            defaults={'content': 'Learn how to solve basic linear equations.'}
        )

        equations_quiz, _ = Quiz.objects.get_or_create(
            lesson=equations_lesson,
            title='Linear Equations Quiz',
            defaults={'description': 'Practice solving one-step algebraic equations.'}
        )

        Question.objects.get_or_create(
            quiz=equations_quiz,
            question_text='Solve: 5x = 20. What is x?',
            defaults={
                'choices': ['2', '3', '4', '5'],
                'correct_answer': '4'
            }
        )
        Question.objects.get_or_create(
            quiz=equations_quiz,
            question_text='Solve: x - 7 = 1. What is x?',
            defaults={
                'choices': ['5', '6', '7', '8'],
                'correct_answer': '8'
            }
        )

        geometry_topic, _ = Topic.objects.get_or_create(
            name='Geometry Basics',
            defaults={'description': 'Explore shapes, area, and perimeter.'}
        )

        shapes_lesson, _ = Lesson.objects.get_or_create(
            topic=geometry_topic,
            title='Shapes and Area',
            defaults={'content': 'Understand common geometric shapes and how to calculate area.'}
        )

        shapes_quiz, _ = Quiz.objects.get_or_create(
            lesson=shapes_lesson,
            title='Shapes Quiz',
            defaults={'description': 'Identify shapes and compute simple area.'}
        )

        Question.objects.get_or_create(
            quiz=shapes_quiz,
            question_text='Which shape has four equal sides and four right angles?',
            defaults={
                'choices': ['Square', 'Rectangle', 'Triangle', 'Circle'],
                'correct_answer': 'Square'
            }
        )
        Question.objects.get_or_create(
            quiz=shapes_quiz,
            question_text='What is the area of a rectangle with width 4 and height 3?',
            defaults={
                'choices': ['7', '10', '12', '14'],
                'correct_answer': '12'
            }
        )

        self.stdout.write(self.style.SUCCESS('Learning data seeded with sample quizzes and questions.'))
