from django.core.management.base import BaseCommand

from memberships.models import Membership


class Command(BaseCommand):
    help = (
        'Demote owner/admin/teacher memberships held by student accounts to the student role. '
        'Student accounts were previously given "owner" of an auto-created personal school. '
        'Dry run by default; pass --apply to save.'
    )

    def add_arguments(self, parser):
        parser.add_argument('--apply', action='store_true', help='Actually change the memberships.')

    def handle(self, *args, **options):
        qs = Membership.objects.filter(
            user__role='student', user__is_superuser=False, role__in=('owner', 'admin', 'teacher')
        ).select_related('user', 'school')
        count = qs.count()
        for m in qs:
            self.stdout.write(f'{m.user.username}: {m.role} -> student at "{m.school.name}"')
        if not options['apply']:
            self.stdout.write(self.style.WARNING(f'{count} membership(s) would change. Re-run with --apply.'))
            return
        qs.update(role='student')
        self.stdout.write(self.style.SUCCESS(f'Demoted {count} membership(s).'))