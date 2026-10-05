from django.db import models


class SchoolScopedQuerySet(models.QuerySet):
    def for_school(self, school):
        return self.filter(school=school)

    def for_request(self, request):
        school = getattr(request, 'school', None)
        return self.for_school(school) if school else self.none()


class SchoolScopedManager(models.Manager.from_queryset(SchoolScopedQuerySet)):
    def for_school(self, school):
        return self.get_queryset().for_school(school)

    def for_request(self, request):
        return self.get_queryset().for_request(request)
