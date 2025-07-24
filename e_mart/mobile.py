# Copyright (c) 2025, efeone and Contributors
# See license.txt

"""
Mobile app support module for E Mart app
"""

import json

import frappe
from frappe import _
from frappe.utils import getdate, now_datetime


@frappe.whitelist()
def mobile_login(username, password):
	"""Mobile app login"""
	try:
		# Validate credentials
		user = frappe.get_doc("User", username)
		if not user.enabled:
			return {"status": "error", "message": "User is disabled"}

		# Check password (implement proper authentication)
		# This is a simplified version

		return {
			"status": "success",
			"data": {"user": username, "full_name": user.full_name, "session_id": frappe.session.sid},
		}
	except Exception as e:
		return {"status": "error", "message": str(e)}


@frappe.whitelist()
def get_mobile_dashboard():
	"""Get mobile dashboard data"""
	try:
		from .analytics import DashboardData

		dashboard_data = DashboardData.get_dashboard_data()

		# Format for mobile
		mobile_data = {
			"sales_today": dashboard_data.get("sales_summary", {}).get("total_sales", 0),
			"pending_invoices": dashboard_data.get("outstanding", {}).get("outstanding_invoices", 0),
			"low_stock_count": len(dashboard_data.get("low_stock_items", [])),
			"commission_pending": dashboard_data.get("commission_summary", {}).get("total_commission", 0),
		}

		return {"status": "success", "data": mobile_data}
	except Exception as e:
		return {"status": "error", "message": str(e)}


@frappe.whitelist()
def get_mobile_sales_invoices(customer=None, status=None, limit=20):
	"""Get sales invoices for mobile app"""
	try:
		filters = {"docstatus": 1}

		if customer:
			filters["customer"] = customer

		if status:
			filters["status"] = status

		invoices = frappe.get_all(
			"Sales Invoice",
			filters=filters,
			fields=[
				"name",
				"customer",
				"customer_name",
				"posting_date",
				"grand_total",
				"outstanding_amount",
				"status",
				"emi_schedule",
			],
			limit=limit,
			order_by="posting_date desc",
		)

		return {"status": "success", "data": invoices}
	except Exception as e:
		return {"status": "error", "message": str(e)}


@frappe.whitelist()
def create_mobile_sales_invoice(customer, items, emi_schedule=False):
	"""Create sales invoice from mobile app"""
	try:
		# Validate customer
		if not frappe.db.exists("Customer", customer):
			return {"status": "error", "message": "Customer not found"}

		# Create sales invoice
		si = frappe.new_doc("Sales Invoice")
		si.customer = customer
		si.emi_schedule = emi_schedule

		# Add items
		for item_data in items:
			item_code = item_data.get("item_code")
			qty = item_data.get("qty", 1)
			rate = item_data.get("rate", 0)

			# Validate item
			if not frappe.db.exists("Item", item_code):
				continue

			si.append("items", {"item_code": item_code, "qty": qty, "rate": rate})

		si.insert()

		return {"status": "success", "data": {"sales_invoice": si.name, "grand_total": si.grand_total}}
	except Exception as e:
		return {"status": "error", "message": str(e)}


@frappe.whitelist()
def get_mobile_stock_status():
	"""Get stock status for mobile app"""
	try:
		# Get low stock items
		low_stock_items = frappe.get_all(
			"Bin",
			filters={"actual_qty": ["<=", 10]},
			fields=["item_code", "warehouse", "actual_qty"],
			limit=50,
		)

		# Get total stock value
		total_stock = frappe.db.sql("""
			SELECT SUM(actual_qty * valuation_rate) as total_value
			FROM `tabBin` b
			JOIN `tabItem` i ON b.item_code = i.name
			WHERE b.warehouse IS NOT NULL
		""")

		return {
			"status": "success",
			"data": {
				"low_stock_items": low_stock_items,
				"total_stock_value": total_stock[0][0] if total_stock else 0,
			},
		}
	except Exception as e:
		return {"status": "error", "message": str(e)}


@frappe.whitelist()
def get_mobile_commission_data(employee):
	"""Get commission data for mobile app"""
	try:
		commission_logs = frappe.get_all(
			"Monthly Commission Log",
			filters={"employee": employee, "docstatus": 1},
			fields=[
				"name",
				"log_month",
				"total_commission_amount",
				"total_sales_amount",
				"commission_percentage",
			],
			order_by="log_month desc",
			limit=12,
		)

		return {"status": "success", "data": commission_logs}
	except Exception as e:
		return {"status": "error", "message": str(e)}


@frappe.whitelist()
def mobile_payment_entry(sales_invoice, amount, payment_method="Cash"):
	"""Create payment entry from mobile app"""
	try:
		si = frappe.get_doc("Sales Invoice", sales_invoice)

		# Create payment entry
		pe = frappe.new_doc("Payment Entry")
		pe.payment_type = "Receive"
		pe.party_type = "Customer"
		pe.party = si.customer
		pe.paid_amount = amount
		pe.received_amount = amount
		pe.payment_method = payment_method
		pe.reference_no = f"MOBILE-{now_datetime().strftime('%Y%m%d%H%M%S')}"

		pe.append(
			"references",
			{
				"reference_doctype": "Sales Invoice",
				"reference_name": sales_invoice,
				"allocated_amount": amount,
			},
		)

		pe.insert()
		pe.submit()

		return {
			"status": "success",
			"data": {"payment_entry": pe.name, "remaining_amount": si.outstanding_amount},
		}
	except Exception as e:
		return {"status": "error", "message": str(e)}


@frappe.whitelist()
def get_mobile_customers(search_term=None, limit=20):
	"""Get customers for mobile app"""
	try:
		filters = {}

		if search_term:
			filters["customer_name"] = ["like", f"%{search_term}%"]

		customers = frappe.get_all(
			"Customer",
			filters=filters,
			fields=["name", "customer_name", "customer_type", "mobile_no"],
			limit=limit,
		)

		return {"status": "success", "data": customers}
	except Exception as e:
		return {"status": "error", "message": str(e)}


@frappe.whitelist()
def get_mobile_items(search_term=None, limit=20):
	"""Get items for mobile app"""
	try:
		filters = {"disabled": 0}

		if search_term:
			filters["item_name"] = ["like", f"%{search_term}%"]

		items = frappe.get_all(
			"Item", filters=filters, fields=["name", "item_name", "item_group", "stock_uom"], limit=limit
		)

		# Add stock information
		for item in items:
			stock_info = frappe.db.sql(
				"""
				SELECT SUM(actual_qty) as total_qty
				FROM `tabBin`
				WHERE item_code = %s
			""",
				(item["name"],),
			)

			item["available_qty"] = stock_info[0][0] if stock_info and stock_info[0][0] else 0

		return {"status": "success", "data": items}
	except Exception as e:
		return {"status": "error", "message": str(e)}


@frappe.whitelist()
def sync_mobile_data():
	"""Sync data for mobile app"""
	try:
		# Get last sync timestamp
		last_sync = frappe.cache().get_value("mobile_last_sync")

		# Get updated records since last sync
		updated_invoices = frappe.get_all(
			"Sales Invoice",
			filters={"modified": [">", last_sync] if last_sync else ["!=", ""]},
			fields=["name", "modified"],
			limit=100,
		)

		# Update sync timestamp
		frappe.cache().set_value("mobile_last_sync", now_datetime())

		return {
			"status": "success",
			"data": {"updated_invoices": len(updated_invoices), "sync_timestamp": now_datetime()},
		}
	except Exception as e:
		return {"status": "error", "message": str(e)}
