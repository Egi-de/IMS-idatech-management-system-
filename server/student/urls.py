from django.urls import path
from . import views

urlpatterns = [
    path('api/students/', views.StudentListCreateView.as_view(), name='student-list'),
    path('api/students/<int:pk>/', views.StudentDetailView.as_view(), name='student-detail'),
    path('api/students/summary/', views.StudentSummaryView.as_view(), name='student-summary'),
    path('api/students/activities/', views.StudentActivitiesView.as_view(), name='student-activities'),
    path('api/students/attendance/', views.StudentAttendanceView.as_view(), name='student-attendance'),
    path('api/students/deleted/', views.DeletedStudentsView.as_view(), name='deleted-students'),
    path('api/students/<int:pk>/restore/', views.RestoreStudentView.as_view(), name='restore-student'),
]
