from django.db import models

class Transaction(models.Model):
    TYPE_CHOICES = [
        ('Income', 'Income'),
        ('Expense', 'Expense'),
    ]

    STATUS_CHOICES = [
        ('Completed', 'Completed'),
        ('Pending', 'Pending'),
        ('Failed', 'Failed'),
    ]

    CATEGORY_CHOICES = [
        ('Salary', 'Salary'),
        ('Rent', 'Rent'),
        ('Utilities', 'Utilities'),
        ('Groceries', 'Groceries'),
        ('Transportation', 'Transportation'),
        ('Entertainment', 'Entertainment'),
        ('Healthcare', 'Healthcare'),
        ('Education', 'Education'),
        ('Other', 'Other'),
    ]

    type = models.CharField(max_length=10, choices=TYPE_CHOICES, blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Completed')
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES)
    description = models.TextField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    method = models.CharField(max_length=50)
    screenshot = models.ImageField(upload_to='transaction_screenshots/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.category} - {self.description} - {self.amount}"

    class Meta:
        ordering = ['-date']
