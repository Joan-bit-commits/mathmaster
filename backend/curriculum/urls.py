from django.urls import path

from .views import CurriculumLookupView, LevelDetailView, LevelsView, ObjectiveView, StrandView

urlpatterns = [
    path('levels/', LevelsView.as_view(), name='curriculum-levels'),
    path('levels/<str:level>/', LevelDetailView.as_view()),
    path('objectives/<str:code>/', ObjectiveView.as_view()),
    path('strands/<str:level>/<str:code>/', StrandView.as_view()),
    path('<str:kind>/', CurriculumLookupView.as_view()),
]
