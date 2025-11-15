from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Q
from django.utils import timezone
from datetime import datetime, timedelta, date
from .models import Transaction
from .serializers import TransactionSerializer
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from django.http import FileResponse
from io import BytesIO
from django.conf import settings
from .ai_service import TransactionAIClassifier

class TransactionListCreateView(generics.ListCreateAPIView):
    queryset = Transaction.objects.all().order_by('-date')
    serializer_class = TransactionSerializer

    def get_serializer(self, *args, **kwargs):
        if self.request.method == 'POST':
            kwargs['data'] = self.request.data.copy()
        return super().get_serializer(*args, **kwargs)

    def perform_create(self, serializer):
        # Classify the transaction type and status using AI before saving
        transaction_data = serializer.validated_data
        classifier = TransactionAIClassifier()
        classification = classifier.classify_transaction({
            'category': transaction_data.get('category'),
            'description': transaction_data.get('description'),
            'amount': str(transaction_data.get('amount')),
        })
        serializer.save(type=classification['type'], status=classification['status'])

class TransactionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

    def get_serializer(self, *args, **kwargs):
        if self.request.method in ['PUT', 'PATCH']:
            kwargs['data'] = self.request.data.copy()
        return super().get_serializer(*args, **kwargs)

class SummaryView(APIView):
    def get(self, request):
        total_income = Transaction.objects.filter(type='Income').aggregate(Sum('amount'))['amount__sum'] or 0
        total_expenses = Transaction.objects.filter(type='Expense').aggregate(Sum('amount'))['amount__sum'] or 0
        net_profit = total_income - total_expenses

        return Response({
            'total_income': total_income,
            'total_expenses': total_expenses,
            'net_profit': net_profit,
        })

class ReportView(APIView):
    def get(self, request):
        report_type = request.query_params.get('report_type', 'basic')
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        type_filter = request.query_params.get('type')

        queryset = Transaction.objects.all()

        if type_filter:
            queryset = queryset.filter(type=type_filter)

        period = 'All Time'
        if start_date_str and end_date_str:
            try:
                start_date = date.fromisoformat(start_date_str)
                end_date = date.fromisoformat(end_date_str)
                queryset = queryset.filter(date__range=[start_date, end_date])
                period = f"{start_date_str} to {end_date_str}"
            except ValueError:
                return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)
        elif report_type == 'monthly':
            now = timezone.now()
            start_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            next_month = start_month + timedelta(days=32)
            end_month = next_month.replace(day=1) - timedelta(seconds=1)
            queryset = queryset.filter(date__range=[start_month.date(), end_month.date()])
            period = start_month.strftime('%Y-%m')

        # Compute aggregates
        total_income = queryset.filter(type='Income').aggregate(Sum('amount'))['amount__sum'] or 0.0
        total_expenses = queryset.filter(type='Expense').aggregate(Sum('amount'))['amount__sum'] or 0.0
        net_profit = total_income - total_expenses

        # Category breakdowns
        income_breakdown = list(
            queryset.filter(type='Income')
            .values('category')
            .annotate(total=Sum('amount'))
            .order_by('-total')
        )
        expenses_breakdown = list(
            queryset.filter(type='Expense')
            .values('category')
            .annotate(total=Sum('amount'))
            .order_by('-total')
        )

        income_by_category = {item['category']: float(item['total']) for item in income_breakdown if item['total']}
        expenses_by_category = {item['category']: float(item['total']) for item in expenses_breakdown if item['total']}

        # Serialize transactions
        transactions = TransactionSerializer(queryset.order_by('-date'), many=True).data

        response_data = {
            'report_type': report_type,
            'period': period,
            'total_income': float(total_income),
            'total_expenses': float(total_expenses),
            'net_profit': float(net_profit),
            'transactions': transactions,
            'income_by_category': income_by_category,
            'expenses_by_category': expenses_by_category,
        }

        return Response(response_data)


class ReportPDFView(APIView):
    def post(self, request):
        report_type = request.data.get('report_type', 'basic')
        start_date_str = request.data.get('start_date')
        end_date_str = request.data.get('end_date')
        type_filter = request.data.get('type')

        queryset = Transaction.objects.all()

        if type_filter:
            queryset = queryset.filter(type=type_filter)

        period = 'All Time'
        if start_date_str and end_date_str:
            try:
                start_date = date.fromisoformat(start_date_str)
                end_date = date.fromisoformat(end_date_str)
                queryset = queryset.filter(date__range=[start_date, end_date])
                period = f"{start_date_str} to {end_date_str}"
            except ValueError:
                return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)
        elif report_type == 'monthly':
            now = timezone.now()
            start_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            next_month = start_month + timedelta(days=32)
            end_month = next_month.replace(day=1) - timedelta(seconds=1)
            queryset = queryset.filter(date__range=[start_month.date(), end_month.date()])
            period = start_month.strftime('%Y-%m')

        # Compute aggregates
        total_income = queryset.filter(type='Income').aggregate(Sum('amount'))['amount__sum'] or 0.0
        total_expenses = queryset.filter(type='Expense').aggregate(Sum('amount'))['amount__sum'] or 0.0
        net_profit = total_income - total_expenses

        # Category breakdowns
        income_breakdown = list(
            queryset.filter(type='Income')
            .values('category')
            .annotate(total=Sum('amount'))
            .order_by('-total')
        )
        expenses_breakdown = list(
            queryset.filter(type='Expense')
            .values('category')
            .annotate(total=Sum('amount'))
            .order_by('-total')
        )

        income_by_category = {item['category']: float(item['total']) for item in income_breakdown if item['total']}
        expenses_by_category = {item['category']: float(item['total']) for item in expenses_breakdown if item['total']}

        # Serialize transactions (limit to 20 for PDF)
        transactions = TransactionSerializer(queryset.order_by('-date')[:20], many=True).data

        # Generate PDF
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []

        # Title
        story.append(Paragraph(f"{report_type.upper().replace('_', ' ')} Report", styles['Title']))
        story.append(Spacer(1, 12))

        # Period
        story.append(Paragraph(f"Period: {period}", styles['Heading2']))
        story.append(Spacer(1, 6))

        # Totals
        totals_data = [
            ['Metric', 'Amount'],
            ['Total Income', f"${total_income:.2f}"],
            ['Total Expenses', f"${total_expenses:.2f}"],
            ['Net Profit', f"${net_profit:.2f}"],
        ]
        totals_table = Table(totals_data)
        totals_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        story.append(totals_table)
        story.append(Spacer(1, 12))

        # Income Breakdown
        if income_by_category:
            story.append(Paragraph("Income by Category", styles['Heading2']))
            income_data = [['Category', 'Amount']] + [[cat, f"${amt:.2f}"] for cat, amt in income_by_category.items()]
            income_table = Table(income_data)
            income_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.green),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ]))
            story.append(income_table)
            story.append(Spacer(1, 12))

        # Expenses Breakdown
        if expenses_by_category:
            story.append(Paragraph("Expenses by Category", styles['Heading2']))
            expenses_data = [['Category', 'Amount']] + [[cat, f"${amt:.2f}"] for cat, amt in expenses_by_category.items()]
            expenses_table = Table(expenses_data)
            expenses_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.red),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ]))
            story.append(expenses_table)
            story.append(Spacer(1, 12))

        # Transactions (limited)
        if transactions:
            story.append(Paragraph("Recent Transactions", styles['Heading2']))
            tx_data = [['Description', 'Amount', 'Date']] + [
                [t.get('description', 'N/A'), f"${float(t.get('amount', 0)):.2f}", t.get('date', 'N/A')]
                for t in transactions
            ]
            tx_table = Table(tx_data, colWidths=[3*inch, inch, inch])
            tx_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.blue),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ]))
            story.append(tx_table)

        doc.build(story)
        buffer.seek(0)

        filename = f"{report_type}_financial_report.pdf"
        return FileResponse(buffer, as_attachment=True, filename=filename, content_type='application/pdf')
