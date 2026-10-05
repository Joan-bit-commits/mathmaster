"""Idempotent curriculum seeding for the Ugandan S1–S4 syllabus.

Each topic: >= 2 lessons; each lesson: 1 quiz; each quiz: >= 5 questions
(mix of multiple-choice and short-answer). S5/S6/UNIVERSITY placeholders.
"""

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from learning.models import Lesson, Question, Quiz, Topic
from schools.models import School
from utils.curriculum import (
    LESSONS,
    LEVEL_TOPICS,
    QUESTIONS,
    TOPICS,
)


class Command(BaseCommand):
    help = 'Seed the Ugandan S1-S4 curriculum (topics, lessons, quizzes, questions).'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Delete all existing curriculum data before seeding.',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        User = get_user_model()
        system_user, _ = User.objects.get_or_create(
            username='curriculum-system',
            defaults={'email': 'system@mathmaster.app', 'role': 'admin', 'is_staff': True},
        )
        school, _ = School.objects.get_or_create(
            slug='global-curriculum',
            defaults={
                'name': 'Global Curriculum',
                'contact_email': 'system@mathmaster.app',
                'school_type': 'other',
                'created_by': system_user,
            },
        )
        if options['reset']:
            deleted = (
                Question.objects.count(),
                Quiz.objects.count(),
                Lesson.objects.count(),
                Topic.objects.count(),
            )
            Question.objects.all().delete()
            Quiz.objects.all().delete()
            Lesson.objects.all().delete()
            Topic.objects.all().delete()
            self.stdout.write(
                f'Reset: deleted {deleted[0]} questions, {deleted[1]} quizzes, '
                f'{deleted[2]} lessons, {deleted[3]} topics.'
            )

        stats = {'topics': 0, 'lessons': 0, 'quizzes': 0, 'questions': 0}

        for level in LEVEL_TOPICS:
            for topic_name in LEVEL_TOPICS[level]:
                subject, description = TOPICS[topic_name]
                topic, created = Topic.objects.get_or_create(
                    school=school,
                    name=f'{topic_name} ({level})',
                    defaults={
                        'description': description,
                        'level': level,
                        'subject': subject,
                    },
                )
                if created:
                    stats['topics'] += 1

                for lesson_title, lesson_content in LESSONS[topic_name]:
                    lesson, lesson_created = Lesson.objects.get_or_create(
                        school=school,
                        topic=topic,
                        title=lesson_title,
                        defaults={'content': lesson_content},
                    )
                    if lesson_created:
                        stats['lessons'] += 1

                    quiz, quiz_created = Quiz.objects.get_or_create(
                        school=school,
                        lesson=lesson,
                        title=f'{lesson_title} Quiz',
                        defaults={'description': f'Quiz on {lesson_title}.'},
                    )
                    if quiz_created:
                        stats['quizzes'] += 1

                    for q_text, choices, correct in QUESTIONS[lesson_title]:
                        _, q_created = Question.objects.get_or_create(
                            school=school,
                            quiz=quiz,
                            question_text=q_text,
                            defaults={'choices': choices, 'correct_answer': correct},
                        )
                        if q_created:
                            stats['questions'] += 1

        self.stdout.write(
            self.style.SUCCESS(
                'Seeded: {topics} new topics, {lessons} new lessons, '
                '{quizzes} new quizzes, {questions} new questions.'.format(**stats)
            )
        )
