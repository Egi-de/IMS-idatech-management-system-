from django.urls import path
from . import views

app_name = "employees"

urlpatterns = [
    path('employees/', views.employee_list, name="employee_list"),
    path('employees/<int:pk>/', views.employee_detail, name="employee_detail"),
    path('departments/', views.department_list, name="department_list"),
]
