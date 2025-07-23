# Copyright (c) 2025, efeone and Contributors
# See license.txt

"""
API module for E Mart app
"""

import frappe
from frappe import _
from frappe.utils import now_datetime, getdate
import json


@frappe.whitelist()
def get_sales_summary():
	"""Get sales summary for API"""
	try:
		from .analytics import SalesAnalytics
		return {
			"status": "success",
			"data": SalesAnalytics.get_sales_summary()
		}
	except Exception as e:
		return {
			"status": "error",
			"message": str(e)
		}


@frappe.whitelist()
def get_emi_schedule(sales_invoice):
	"""Get EMI schedule for a sales invoice"""
	try:
		emi_schedule = frappe.get_all(
			"EMI Schedule",
			filters={"sales_invoice": sales_invoice},
			fields=["*"],
			order_by="due_date"
		)
		
		return {
			"status": "success",
			"data": emi_schedule
		}
	except Exception as e:
		return {
			"status": "error",
			"message": str(e)
		}


@frappe.whitelist()
def create_sales_invoice_api(customer, items, emi_schedule=False, emi_duration=None):
	"""Create sales invoice via API"""
	try:
		# Validate inputs
		if not customer:
			frappe.throw(_("Customer is required"))
		
		if not items:
			frappe.throw(_("Items are required"))
		
		# Create sales invoice
		si = frappe.new_doc("Sales Invoice")
		si.customer = customer
		si.emi_schedule = emi_schedule
		
		if emi_schedule and emi_duration:
			si.emi_duration = emi_duration
		
		# Add items
		for item in items:
			si.append("items", {
				"item_code": item.get("item_code"),
				"qty": item.get("qty", 1),
				"rate": item.get("rate", 0)
			})
		
		si.insert()
		
		return {
			"status": "success",
			"data": {
				"sales_invoice": si.name,
				"grand_total": si.grand_total
			}
		}
	except Exception as e:
		return {
			"status": "error",
			"message": str(e)
		}


@frappe.whitelist()
def get_commission_data(employee=None, month=None, year=None):
	"""Get commission data for API"""
	try:
		from .analytics import CommissionAnalytics
		
		if employee:
			commission_data = frappe.get_all(
				"Monthly Commission Log",
				filters={
					"employee": employee,
					"docstatus": 1
				},
				fields=["*"],
				order_by="log_month desc"
			)
		else:
			commission_data = CommissionAnalytics.get_commission_summary(month, year)
		
		return {
			"status": "success",
			"data": commission_data
		}
	except Exception as e:
		return {
			"status": "error",
			"message": str(e)
		}


@frappe.whitelist()
def get_stock_status(item_code=None):
	"""Get stock status for items"""
	try:
		if item_code:
			stock_data = frappe.get_all(
				"Bin",
				filters={"item_code": item_code},
				fields=["item_code", "warehouse", "actual_qty", "reserved_qty"]
			)
		else:
			from .analytics import InventoryAnalytics
			stock_data = InventoryAnalytics.get_stock_summary()
		
		return {
			"status": "success",
			"data": stock_data
		}
	except Exception as e:
		return {
			"status": "error",
			"message": str(e)
		}


@frappe.whitelist()
def update_payment_status(sales_invoice, payment_amount, payment_method="Cash"):
	"""Update payment status via API"""
	try:
		si = frappe.get_doc("Sales Invoice", sales_invoice)
		
		# Create payment entry
		pe = frappe.new_doc("Payment Entry")
		pe.payment_type = "Receive"
		pe.party_type = "Customer"
		pe.party = si.customer
		pe.paid_amount = payment_amount
		pe.received_amount = payment_amount
		pe.payment_method = payment_method
		pe.reference_no = f"API-{now_datetime().strftime('%Y%m%d%H%M%S')}"
		
		pe.append("references", {
			"reference_doctype": "Sales Invoice",
			"reference_name": sales_invoice,
			"allocated_amount": payment_amount
		})
		
		pe.insert()
		pe.submit()
		
		return {
			"status": "success",
			"data": {
				"payment_entry": pe.name,
				"outstanding_amount": si.outstanding_amount
			}
		}
	except Exception as e:
		return {
			"status": "error",
			"message": str(e)
		}


@frappe.whitelist()
def get_dashboard_data():
	"""Get dashboard data for API"""
	try:
		from .analytics import DashboardData
		return {
			"status": "success",
			"data": DashboardData.get_dashboard_data()
		}
	except Exception as e:
		return {
			"status": "error",
			"message": str(e)
		}


@frappe.whitelist()
def sync_inventory_data():
	"""Sync inventory data with external systems"""
	try:
		# Get all items with stock
		items = frappe.get_all(
			"Bin",
			fields=["item_code", "warehouse", "actual_qty", "reserved_qty"]
		)
		
		# Process each item
		for item in items:
			# Add your external system sync logic here
			pass
		
		return {
			"status": "success",
			"message": f"Synced {len(items)} items"
		}
	except Exception as e:
		return {
			"status": "error",
			"message": str(e)
		}


@frappe.whitelist()
def get_customer_ledger(customer, from_date=None, to_date=None):
	"""Get customer ledger for API"""
	try:
		if not from_date:
			from_date = getdate()
		if not to_date:
			to_date = getdate()
		
		# Get sales invoices
		sales_invoices = frappe.get_all(
			"Sales Invoice",
			filters={
				"customer": customer,
				"posting_date": ["between", [from_date, to_date]],
				"docstatus": 1
			},
			fields=["name", "posting_date", "grand_total", "outstanding_amount"]
		)
		
		# Get payments
		payments = frappe.get_all(
			"Payment Entry",
			filters={
				"party": customer,
				"posting_date": ["between", [from_date, to_date]],
				"docstatus": 1
			},
			fields=["name", "posting_date", "paid_amount"]
		)
		
		return {
			"status": "success",
			"data": {
				"sales_invoices": sales_invoices,
				"payments": payments
			}
		}
	except Exception as e:
		return {
			"status": "error",
			"message": str(e)
		} 