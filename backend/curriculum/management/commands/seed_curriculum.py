from django.core.management.base import BaseCommand

from curriculum.structure import UGANDA_LEVELS, UGANDA_SYLLABUS


class Command(BaseCommand):
    help = 'Validate and report the static Uganda curriculum structure.'

    def handle(self, *args, **options):
        objective_count = sum(
            len(strand['objectives'])
            for subjects in UGANDA_SYLLABUS.values()
            for subject in subjects.values()
            for strand in subject['strands'].values()
        )
        self.stdout.write(
            self.style.SUCCESS(
                f'Curriculum ready: {len(UGANDA_LEVELS)} levels, {objective_count} objectives.'
            )
        )
