# Copyright (c) 2025, efeone and Contributors
# See license.txt

"""
Analytics and reporting module for E Mart app
"""

import json
from datetime import datetime, timedelta

import frappe
from frappe import _
from frappe.utils import add_days, get_datetime, getdate


class SalesAnalytics:
	"""Sales analytics and reporting"""

	@staticmethod
	def get_sales_summary(from_date=None, to_date=None):
		"""Get sales summary for the period"""
		if not from_date:
			from_date = getdate()
		if not to_date:
			to_date = getdate()

		# Get sales data
		sales_data = frappe.db.sql(
			"""
			SELECT
				COUNT(*) as total_invoices,
				SUM(grand_total) as total_sales,
				SUM(outstanding_amount) as outstanding_amount,
				AVG(grand_total) as avg_invoice_value
			FROM `tabSales Invoice`
			WHERE posting_date BETWEEN %s AND %s
			AND docstatus = 1
		""",
			(from_date, to_date),
			as_dict=True,
		)

		return sales_data[0] if sales_data else {}

	@staticmethod
	def get_emi_analytics():
		"""Get EMI analytics"""
		emi_data = frappe.db.sql(
			"""
			SELECT
				COUNT(*) as total_emi_invoices,
				SUM(grand_total) as total_emi_value,
				AVG(grand_total) as avg_emi_value
			FROM `tabSales Invoice`
			WHERE emi_schedule = 1
			AND docstatus = 1
		""",
			as_dict=True,
		)

		return emi_data[0] if emi_data else {}

	@staticmethod
	def get_top_customers(limit=10):
		"""Get top customers by sales value"""
		top_customers = frappe.db.sql(
			"""
			SELECT
				customer,
				customer_name,
				SUM(grand_total) as total_sales,
				COUNT(*) as invoice_count
			FROM `tabSales Invoice`
			WHERE docstatus = 1
			GROUP BY customer, customer_name
			ORDER BY total_sales DESC
			LIMIT %s
		""",
			(limit,),
			as_dict=True,
		)

		return top_customers


class CommissionAnalytics:
	"""Commission analytics and reporting"""

	@staticmethod
	def get_commission_summary(month=None, year=None):
		"""Get commission summary for the month"""
		if not month:
			month = getdate().month
		if not year:
			year = getdate().year

		commission_data = frappe.db.sql(
			"""
			SELECT
				COUNT(*) as total_commission_logs,
				SUM(total_commission_amount) as total_commission,
				AVG(total_commission_amount) as avg_commission
			FROM `tabMonthly Commission Log`
			WHERE MONTH(log_month) = %s AND YEAR(log_month) = %s
			AND docstatus = 1
		""",
			(month, year),
			as_dict=True,
		)

		return commission_data[0] if commission_data else {}

	@staticmethod
	def get_top_performers(limit=10):
		"""Get top performing employees by commission"""
		top_performers = frappe.db.sql(
			"""
			SELECT
				employee,
				employee_name,
				SUM(total_commission_amount) as total_commission,
				COUNT(*) as commission_count
			FROM `tabMonthly Commission Log`
			WHERE docstatus = 1
			GROUP BY employee, employee_name
			ORDER BY total_commission DESC
			LIMIT %s
		""",
			(limit,),
			as_dict=True,
		)

		return top_performers


class InventoryAnalytics:
	"""Inventory analytics and reporting"""

	@staticmethod
	def get_stock_summary():
		"""Get stock summary"""
		stock_data = frappe.db.sql(
			"""
			SELECT
				SUM(actual_qty) as total_stock,
				SUM(reserved_qty) as reserved_stock,
				SUM(actual_qty - reserved_qty) as available_stock
			FROM `tabBin`
			WHERE warehouse IS NOT NULL
		""",
			as_dict=True,
		)

		return stock_data[0] if stock_data else {}

	@staticmethod
	def get_low_stock_items(threshold=10):
		"""Get items with low stock"""
		low_stock_items = frappe.db.sql(
			"""
			SELECT
				item_code,
				item_name,
				actual_qty,
				warehouse
			FROM `tabBin`
			WHERE actual_qty <= %s
			ORDER BY actual_qty ASC
		""",
			(threshold,),
			as_dict=True,
		)

		return low_stock_items


class FinancialAnalytics:
	"""Financial analytics and reporting"""

	@staticmethod
	def get_cash_flow_summary(from_date=None, to_date=None):
		"""Get cash flow summary"""
		if not from_date:
			from_date = getdate()
		if not to_date:
			to_date = getdate()

		cash_flow = frappe.db.sql(
			"""
			SELECT
				SUM(CASE WHEN payment_type = 'Receive' THEN paid_amount ELSE 0 END) as cash_in,
				SUM(CASE WHEN payment_type = 'Pay' THEN paid_amount ELSE 0 END) as cash_out,
				SUM(CASE WHEN payment_type = 'Receive' THEN paid_amount ELSE -paid_amount END) as net_cash_flow
			FROM `tabPayment Entry`
			WHERE posting_date BETWEEN %s AND %s
			AND docstatus = 1
		""",
			(from_date, to_date),
			as_dict=True,
		)

		return cash_flow[0] if cash_flow else {}

	@staticmethod
	def get_outstanding_summary():
		"""Get outstanding amounts summary"""
		outstanding = frappe.db.sql(
			"""
			SELECT
				SUM(outstanding_amount) as total_outstanding,
				COUNT(*) as outstanding_invoices
			FROM `tabSales Invoice`
			WHERE outstanding_amount > 0
			AND docstatus = 1
		""",
			as_dict=True,
		)

		return outstanding[0] if outstanding else {}


class DashboardData:
	"""Dashboard data provider"""

	@staticmethod
	def get_dashboard_data():
		"""Get comprehensive dashboard data"""
		today = getdate()
		month_start = today.replace(day=1)
		(month_start - timedelta(days=1)).replace(day=1)

		return {
			"sales_summary": SalesAnalytics.get_sales_summary(month_start, today),
			"emi_analytics": SalesAnalytics.get_emi_analytics(),
			"commission_summary": CommissionAnalytics.get_commission_summary(today.month, today.year),
			"stock_summary": InventoryAnalytics.get_stock_summary(),
			"cash_flow": FinancialAnalytics.get_cash_flow_summary(month_start, today),
			"outstanding": FinancialAnalytics.get_outstanding_summary(),
			"top_customers": SalesAnalytics.get_top_customers(5),
			"top_performers": CommissionAnalytics.get_top_performers(5),
			"low_stock_items": InventoryAnalytics.get_low_stock_items(5),
		}

	@staticmethod
	def get_chart_data():
		"""Get chart data for visualizations"""
		# Last 12 months sales data
		months = []
		sales_data = []

		for i in range(12):
			date = getdate() - timedelta(days=30 * i)
			month_start = date.replace(day=1)
			month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)

			sales = frappe.db.sql(
				"""
				SELECT SUM(grand_total) as total
				FROM `tabSales Invoice`
				WHERE posting_date BETWEEN %s AND %s
				AND docstatus = 1
			""",
				(month_start, month_end),
			)

			months.append(date.strftime("%b %Y"))
			sales_data.append(float(sales[0][0] or 0))

		return {"months": months, "sales": sales_data}
