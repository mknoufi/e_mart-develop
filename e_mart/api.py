"""E Mart API endpoints for mobile app integration"""

import json
from datetime import datetime, timedelta

import frappe
from frappe import _
from frappe.utils import flt, getdate, nowdate

from e_mart.series_manager import SeriesManager


@frappe.whitelist()
def get_sales_summary():
	"""Get sales summary for API"""
	try:
		from .analytics import SalesAnalytics

		return {"status": "success", "data": SalesAnalytics.get_sales_summary()}
	except Exception as e:
		return {"status": "error", "message": str(e)}


@frappe.whitelist()
def get_emi_schedule(sales_invoice):
	"""Get EMI schedule for a sales invoice"""
	try:
		emi_schedule = frappe.get_all(
			"EMI Schedule", filters={"sales_invoice": sales_invoice}, fields=["*"], order_by="due_date"
		)

		return {"status": "success", "data": emi_schedule}
	except Exception as e:
		return {"status": "error", "message": str(e)}


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
			si.append(
				"items",
				{"item_code": item.get("item_code"), "qty": item.get("qty", 1), "rate": item.get("rate", 0)},
			)

		si.insert()

		return {"status": "success", "data": {"sales_invoice": si.name, "grand_total": si.grand_total}}
	except Exception as e:
		return {"status": "error", "message": str(e)}


@frappe.whitelist()
def get_commission_data(employee=None, month=None, year=None):
	"""Get commission data for API"""
	try:
		from .analytics import CommissionAnalytics

		if employee:
			commission_data = frappe.get_all(
				"Monthly Commission Log",
				filters={"employee": employee, "docstatus": 1},
				fields=["*"],
				order_by="log_month desc",
			)
		else:
			commission_data = CommissionAnalytics.get_commission_summary(month, year)

		return {"status": "success", "data": commission_data}
	except Exception as e:
		return {"status": "error", "message": str(e)}


@frappe.whitelist()
def get_stock_status(item_code=None):
	"""Get stock status for items"""
	try:
		if item_code:
			stock_data = frappe.get_all(
				"Bin",
				filters={"item_code": item_code},
				fields=["item_code", "warehouse", "actual_qty", "reserved_qty"],
			)
		else:
			from .analytics import InventoryAnalytics

			stock_data = InventoryAnalytics.get_stock_summary()

		return {"status": "success", "data": stock_data}
	except Exception as e:
		return {"status": "error", "message": str(e)}


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
		pe.reference_no = f"API-{nowdate().strftime('%Y%m%d%H%M%S')}"

		pe.append(
			"references",
			{
				"reference_doctype": "Sales Invoice",
				"reference_name": sales_invoice,
				"allocated_amount": payment_amount,
			},
		)

		pe.insert()
		pe.submit()

		return {
			"status": "success",
			"data": {"payment_entry": pe.name, "outstanding_amount": si.outstanding_amount},
		}
	except Exception as e:
		return {"status": "error", "message": str(e)}


@frappe.whitelist()
def get_dashboard_data():
	"""Get dashboard data for mobile app"""
	try:
		# Get current user
		frappe.get_doc("User", frappe.session.user)

		# Calculate date ranges
		today = getdate()
		today.replace(day=1)
		today.replace(month=1, day=1)

		# Get statistics
		stats = {
			"totalSales": get_total_sales(),
			"totalPurchases": get_total_purchases(),
			"totalInvoices": get_total_invoices(),
			"totalItems": get_total_items(),
		}

		# Get recent activity
		recent_activity = get_recent_activity()

		# Get chart data
		charts = {
			"salesData": get_sales_chart_data(),
			"purchaseData": get_purchase_chart_data(),
		}

		return {
			"success": True,
			"data": {
				"stats": stats,
				"recentActivity": recent_activity,
				"charts": charts,
			},
		}
	except Exception as e:
		frappe.log_error(f"Dashboard data error: {e!s}")
		return {"success": False, "message": str(e)}


@frappe.whitelist()
def get_series_data():
	"""Get series management data"""
	try:
		# Get series mapping
		series_mapping = frappe.get_doc("Purchase Series Mapping")

		# Get current series numbers
		normal_series = get_current_series("normal")
		special_series = get_current_series("special")

		return {
			"success": True,
			"data": {
				"normal": {
					"current": normal_series["current"],
					"next": normal_series["next"],
					"format": series_mapping.normal_series_format or "YYYYMMDD-####",
					"prefix": series_mapping.normal_series_prefix or "NORM",
					"count": get_series_count("normal"),
				},
				"special": {
					"current": special_series["current"],
					"next": special_series["next"],
					"format": series_mapping.special_series_format or "YYYYMMDD-####",
					"prefix": series_mapping.special_series_prefix or "SPEC",
					"count": get_series_count("special"),
				},
			},
		}
	except Exception as e:
		frappe.log_error(f"Series data error: {e!s}")
		return {"success": False, "message": str(e)}


@frappe.whitelist()
def generate_series(series_type):
	"""Generate new series number"""
	try:
		from e_mart.series_manager import SeriesManager

		series_number = SeriesManager.generate_series(series_type)

		return {"success": True, "series": series_number}
	except Exception as e:
		frappe.log_error(f"Generate series error: {e!s}")
		return {"success": False, "message": str(e)}


@frappe.whitelist()
def reset_series(series_type, start_number):
	"""Reset series number"""
	try:
		from e_mart.series_manager import SeriesManager

		SeriesManager.reset_series(series_type, int(start_number))

		return {"success": True, "message": f"{series_type.title()} series reset successfully"}
	except Exception as e:
		frappe.log_error(f"Reset series error: {e!s}")
		return {"success": False, "message": str(e)}


@frappe.whitelist()
def get_purchase_invoices(filters=None):
	"""Get purchase invoices with filters"""
	try:
		if filters:
			filters = json.loads(filters)
		else:
			filters = {}

		# Build query with parameterized conditions
		conditions = []
		params = []

		if filters.get("supplier"):
			conditions.append("supplier = %s")
			params.append(filters["supplier"])
		if filters.get("from_date"):
			conditions.append("posting_date >= %s")
			params.append(filters["from_date"])
		if filters.get("to_date"):
			conditions.append("posting_date <= %s")
			params.append(filters["to_date"])
		if filters.get("status"):
			conditions.append("status = %s")
			params.append(filters["status"])

		where_clause = " AND ".join(conditions) if conditions else "1=1"

		# Get invoices
		invoices = frappe.db.sql(
			f"""
            SELECT
                name, supplier, posting_date, grand_total, status,
                series_number, purchase_category, special_purchase_scheme
            FROM `tabPurchase Invoice`
            WHERE {where_clause}
            ORDER BY posting_date DESC
            LIMIT 50
        """,
			params,
			as_dict=True,
		)

		return {"success": True, "data": invoices}
	except Exception as e:
		frappe.log_error(f"Get purchase invoices error: {e!s}")
		return {"success": False, "data": []}


@frappe.whitelist()
def create_purchase_invoice(data):
	"""Create new purchase invoice"""
	try:
		data = json.loads(data) if isinstance(data, str) else data

		# Create purchase invoice
		doc = frappe.new_doc("Purchase Invoice")
		doc.supplier = data.get("supplier")
		doc.posting_date = data.get("posting_date", nowdate())
		doc.purchase_category = data.get("purchase_category", "Normal")
		doc.special_purchase_scheme = data.get("special_purchase_scheme")

		# Add items
		for item in data.get("items", []):
			doc.append(
				"items",
				{
					"item_code": item.get("item_code"),
					"qty": item.get("qty"),
					"rate": item.get("rate"),
					"amount": flt(item.get("qty", 0)) * flt(item.get("rate", 0)),
				},
			)

		doc.insert()
		doc.submit()

		return {"success": True, "data": {"name": doc.name, "series_number": doc.series_number}}
	except Exception as e:
		frappe.log_error(f"Create purchase invoice error: {e!s}")
		return {"success": False, "message": str(e)}


@frappe.whitelist()
def get_sales_invoices(filters=None):
	"""Get sales invoices with filters"""
	try:
		if filters:
			filters = json.loads(filters)
		else:
			filters = {}

		# Build query with parameterized conditions
		conditions = []
		params = []

		if filters.get("customer"):
			conditions.append("customer = %s")
			params.append(filters["customer"])
		if filters.get("from_date"):
			conditions.append("posting_date >= %s")
			params.append(filters["from_date"])
		if filters.get("to_date"):
			conditions.append("posting_date <= %s")
			params.append(filters["to_date"])
		if filters.get("status"):
			conditions.append("status = %s")
			params.append(filters["status"])

		where_clause = " AND ".join(conditions) if conditions else "1=1"

		# Get invoices
		invoices = frappe.db.sql(
			f"""
            SELECT
                name, customer, posting_date, grand_total, status
            FROM `tabSales Invoice`
            WHERE {where_clause}
            ORDER BY posting_date DESC
            LIMIT 50
        """,
			params,
			as_dict=True,
		)

		return {"success": True, "data": invoices}
	except Exception as e:
		frappe.log_error(f"Get sales invoices error: {e!s}")
		return {"success": False, "data": []}


@frappe.whitelist()
def create_sales_invoice(data):
	"""Create new sales invoice"""
	try:
		data = json.loads(data) if isinstance(data, str) else data

		# Create sales invoice
		doc = frappe.new_doc("Sales Invoice")
		doc.customer = data.get("customer")
		doc.posting_date = data.get("posting_date", nowdate())

		# Add items
		for item in data.get("items", []):
			doc.append(
				"items",
				{
					"item_code": item.get("item_code"),
					"qty": item.get("qty"),
					"rate": item.get("rate"),
					"amount": flt(item.get("qty", 0)) * flt(item.get("rate", 0)),
				},
			)

		doc.insert()
		doc.submit()

		return {"success": True, "data": {"name": doc.name}}
	except Exception as e:
		frappe.log_error(f"Create sales invoice error: {e!s}")
		return {"success": False, "message": str(e)}


@frappe.whitelist()
def get_inventory_items(filters=None):
	"""Get inventory items with filters"""
	try:
		if filters:
			filters = json.loads(filters)
		else:
			filters = {}

		# Build query with parameterized conditions
		conditions = ["is_stock_item = 1"]
		params = []

		if filters.get("item_group"):
			conditions.append("item_group = %s")
			params.append(filters["item_group"])
		if filters.get("brand"):
			conditions.append("brand = %s")
			params.append(filters["brand"])
		if filters.get("search"):
			search_term = f"%{filters['search']}%"
			conditions.append("(item_name LIKE %s OR item_code LIKE %s)")
			params.extend([search_term, search_term])

		where_clause = " AND ".join(conditions)

		# Get items
		items = frappe.db.sql(
			f"""
            SELECT
                item_code, item_name, item_group, brand,
                stock_uom, actual_qty, reserved_qty,
                (actual_qty - reserved_qty) as available_qty
            FROM `tabItem`
            WHERE {where_clause}
            ORDER BY item_name
            LIMIT 100
        """,
			params,
			as_dict=True,
		)

		return {"success": True, "data": items}
	except Exception as e:
		frappe.log_error(f"Get inventory items error: {e!s}")
		return {"success": False, "data": []}


@frappe.whitelist()
def update_inventory_item(item_code, data):
	"""Update inventory item"""
	try:
		data = json.loads(data) if isinstance(data, str) else data

		doc = frappe.get_doc("Item", item_code)

		# Update fields
		for field, value in data.items():
			if hasattr(doc, field):
				setattr(doc, field, value)

		doc.save()

		return {"success": True, "data": {"name": doc.name, "item_name": doc.item_name}}
	except Exception as e:
		frappe.log_error(f"Update inventory item error: {e!s}")
		return {"success": False, "message": str(e)}


@frappe.whitelist()
def get_special_schemes():
	"""Get special purchase schemes"""
	try:
		schemes = frappe.db.sql(
			"""
            SELECT
                name, scheme_name, discount_type, discount_percentage,
                valid_from, valid_to, status
            FROM `tabSpecial Purchase Scheme`
            WHERE status = 'Active'
            ORDER BY valid_from DESC
        """,
			as_dict=True,
		)

		return {"success": True, "data": schemes}
	except Exception as e:
		frappe.log_error(f"Get special schemes error: {e!s}")
		return {"success": False, "data": []}


@frappe.whitelist()
def create_special_scheme(data):
	"""Create new special purchase scheme"""
	try:
		data = json.loads(data) if isinstance(data, str) else data

		doc = frappe.new_doc("Special Purchase Scheme")
		doc.scheme_name = data.get("scheme_name")
		doc.discount_type = data.get("discount_type", "Percentage")
		doc.discount_percentage = data.get("discount_percentage", 0)
		doc.valid_from = data.get("valid_from")
		doc.valid_to = data.get("valid_to")
		doc.description = data.get("description")

		doc.insert()

		return {"success": True, "data": {"name": doc.name, "scheme_name": doc.scheme_name}}
	except Exception as e:
		frappe.log_error(f"Create special scheme error: {e!s}")
		return {"success": False, "message": str(e)}


@frappe.whitelist()
def get_report(report_type, filters=None):
	"""Get reports data"""
	try:
		if filters:
			filters = json.loads(filters)
		else:
			filters = {}

		if report_type == "sales_summary":
			return get_sales_summary_report(filters)
		elif report_type == "purchase_summary":
			return get_purchase_summary_report(filters)
		elif report_type == "inventory_summary":
			return get_inventory_summary_report(filters)
		else:
			return {"success": False, "message": "Invalid report type"}
	except Exception as e:
		frappe.log_error(f"Get report error: {e!s}")
		return {"success": False, "data": []}


@frappe.whitelist()
def get_notifications():
	"""Get user notifications"""
	try:
		notifications = frappe.db.sql(
			"""
            SELECT
                name, subject, type, read, creation
            FROM `tabNotification Log`
            WHERE for_user = %s
            ORDER BY creation DESC
            LIMIT 20
        """,
			frappe.session.user,
			as_dict=True,
		)

		return {"success": True, "data": notifications}
	except Exception as e:
		frappe.log_error(f"Get notifications error: {e!s}")
		return {"success": False, "data": []}


@frappe.whitelist()
def mark_notification_read(notification_id):
	"""Mark notification as read"""
	try:
		notification = frappe.get_doc("Notification Log", notification_id)
		notification.read = 1
		notification.save()

		return {"success": True, "message": "Notification marked as read"}
	except Exception as e:
		frappe.log_error(f"Mark notification read error: {e!s}")
		return {"success": False, "message": str(e)}


@frappe.whitelist()
def scan_qr_code(qr_data):
	"""Process QR code data"""
	try:
		# Parse QR data (assuming it contains item information)
		# This is a basic implementation - customize based on your QR format
		if qr_data.startswith("ITEM:"):
			item_code = qr_data.split(":")[1]
			item = frappe.get_doc("Item", item_code)

			return {
				"success": True,
				"data": {
					"type": "item",
					"item_code": item.item_code,
					"item_name": item.item_name,
					"rate": item.standard_rate,
					"stock_uom": item.stock_uom,
				},
			}
		else:
			return {"success": False, "message": "Invalid QR code format"}
	except Exception as e:
		frappe.log_error(f"QR scan error: {e!s}")
		return {"success": False, "message": str(e)}


@frappe.whitelist()
def get_app_settings():
	"""Get app settings"""
	try:
		settings = frappe.get_doc("E Mart Settings")

		return {
			"success": True,
			"data": {
				"company_name": settings.company_name,
				"default_warehouse": settings.default_warehouse,
				"default_supplier": settings.default_supplier,
				"default_customer": settings.default_customer,
				"currency": settings.currency,
				"timezone": settings.timezone,
			},
		}
	except Exception as e:
		frappe.log_error(f"Get app settings error: {e!s}")
		return {"success": False, "data": {}}


@frappe.whitelist()
def update_app_settings(settings):
	"""Update app settings"""
	try:
		settings = json.loads(settings) if isinstance(settings, str) else settings

		doc = frappe.get_doc("E Mart Settings")

		for field, value in settings.items():
			if hasattr(doc, field):
				setattr(doc, field, value)

		doc.save()

		return {"success": True, "message": "Settings updated successfully"}
	except Exception as e:
		frappe.log_error(f"Update app settings error: {e!s}")
		return {"success": False, "message": str(e)}


@frappe.whitelist()
def sync_offline_data(offline_data):
	"""Sync offline data"""
	try:
		offline_data = json.loads(offline_data) if isinstance(offline_data, str) else offline_data

		synced_count = 0

		for data_item in offline_data:
			try:
				if data_item.get("type") == "purchase_invoice":
					# Create purchase invoice from offline data
					create_purchase_invoice(data_item.get("data"))
					synced_count += 1
				elif data_item.get("type") == "sales_invoice":
					# Create sales invoice from offline data
					create_sales_invoice(data_item.get("data"))
					synced_count += 1
			except Exception as e:
				frappe.log_error(f"Sync item error: {e!s}")
				continue

		return {"success": True, "message": f"Synced {synced_count} items successfully"}
	except Exception as e:
		frappe.log_error(f"Sync offline data error: {e!s}")
		return {"success": False, "message": str(e)}


# Helper functions
def get_total_sales():
	"""Get total sales amount"""
	result = frappe.db.sql("""
        SELECT COALESCE(SUM(grand_total), 0)
        FROM `tabSales Invoice`
        WHERE docstatus = 1
    """)
	return flt(result[0][0]) if result else 0


def get_total_purchases():
	"""Get total purchases amount"""
	result = frappe.db.sql("""
        SELECT COALESCE(SUM(grand_total), 0)
        FROM `tabPurchase Invoice`
        WHERE docstatus = 1
    """)
	return flt(result[0][0]) if result else 0


def get_total_invoices():
	"""Get total invoice count"""
	sales_count = frappe.db.count("Sales Invoice", filters={"docstatus": 1})
	purchase_count = frappe.db.count("Purchase Invoice", filters={"docstatus": 1})
	return sales_count + purchase_count


def get_total_items():
	"""Get total items count"""
	return frappe.db.count("Item", filters={"is_stock_item": 1})


def get_recent_activity():
	"""Get recent activity"""
	activities = []

	# Recent sales invoices
	sales_invoices = frappe.db.sql(
		"""
        SELECT
            name, customer, grand_total, posting_date,
            'sales_invoice' as type, 'currency-usd' as icon, '#10b981' as color
        FROM `tabSales Invoice`
        WHERE docstatus = 1
        ORDER BY posting_date DESC
        LIMIT 5
    """,
		as_dict=True,
	)

	# Recent purchase invoices
	purchase_invoices = frappe.db.sql(
		"""
        SELECT
            name, supplier, grand_total, posting_date,
            'purchase_invoice' as type, 'shopping' as icon, '#2563eb' as color
        FROM `tabPurchase Invoice`
        WHERE docstatus = 1
        ORDER BY posting_date DESC
        LIMIT 5
    """,
		as_dict=True,
	)

	# Combine and sort by date
	all_activities = sales_invoices + purchase_invoices
	all_activities.sort(key=lambda x: x.posting_date, reverse=True)

	for activity in all_activities[:10]:
		activities.append(
			{
				"title": f"{activity.type.replace('_', ' ').title()}: {activity.name}",
				"subtitle": f"{activity.customer or activity.supplier} - ${activity.grand_total}",
				"time": activity.posting_date.strftime("%Y-%m-%d %H:%M"),
				"icon": activity.icon,
				"color": activity.color,
			}
		)

	return activities


def get_sales_chart_data():
	"""Get sales chart data for last 6 months"""
	data = []
	for i in range(6):
		date = datetime.now() - timedelta(days=30 * i)
		month_start = date.replace(day=1)
		month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)

		result = frappe.db.sql(
			"""
            SELECT COALESCE(SUM(grand_total), 0)
            FROM `tabSales Invoice`
            WHERE docstatus = 1
            AND posting_date BETWEEN %s AND %s
        """,
			(month_start.date(), month_end.date()),
		)

		data.append(flt(result[0][0]) if result else 0)

	return data[::-1]  # Reverse to show oldest first


def get_purchase_chart_data():
	"""Get purchase chart data for last 6 months"""
	data = []
	for i in range(6):
		date = datetime.now() - timedelta(days=30 * i)
		month_start = date.replace(day=1)
		month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)

		result = frappe.db.sql(
			"""
            SELECT COALESCE(SUM(grand_total), 0)
            FROM `tabPurchase Invoice`
            WHERE docstatus = 1
            AND posting_date BETWEEN %s AND %s
        """,
			(month_start.date(), month_end.date()),
		)

		data.append(flt(result[0][0]) if result else 0)

	return data[::-1]  # Reverse to show oldest first


def get_current_series(series_type):
	"""Get current and next series numbers"""
	try:
		current = SeriesManager.get_current_series(series_type)
		next_series = SeriesManager.get_next_series(series_type)

		return {"current": current, "next": next_series}
	except Exception:
		return {
			"current": f"{series_type.upper()}-20250630-0001",
			"next": f"{series_type.upper()}-20250630-0002",
		}


def get_series_count(series_type):
	"""Get total series count"""
	try:
		if series_type == "normal":
			return frappe.db.count(
				"Purchase Invoice", filters={"purchase_category": "Normal", "docstatus": 1}
			)
		else:
			return frappe.db.count(
				"Purchase Invoice", filters={"purchase_category": "Special", "docstatus": 1}
			)
	except Exception:
		return 0


def get_sales_summary_report(filters):
	"""Get sales summary report"""
	conditions = ["docstatus = 1"]
	params = []

	if filters.get("from_date"):
		conditions.append("posting_date >= %s")
		params.append(filters["from_date"])
	if filters.get("to_date"):
		conditions.append("posting_date <= %s")
		params.append(filters["to_date"])

	where_clause = " AND ".join(conditions)

	data = frappe.db.sql(
		f"""
        SELECT
            customer, COUNT(*) as invoice_count,
            SUM(grand_total) as total_amount
        FROM `tabSales Invoice`
        WHERE {where_clause}
        GROUP BY customer
        ORDER BY total_amount DESC
    """,
		params,
		as_dict=True,
	)

	return {"success": True, "data": data}


def get_purchase_summary_report(filters):
	"""Get purchase summary report"""
	conditions = ["docstatus = 1"]
	params = []

	if filters.get("from_date"):
		conditions.append("posting_date >= %s")
		params.append(filters["from_date"])
	if filters.get("to_date"):
		conditions.append("posting_date <= %s")
		params.append(filters["to_date"])

	where_clause = " AND ".join(conditions)

	data = frappe.db.sql(
		f"""
        SELECT
            supplier, COUNT(*) as invoice_count,
            SUM(grand_total) as total_amount
        FROM `tabPurchase Invoice`
        WHERE {where_clause}
        GROUP BY supplier
        ORDER BY total_amount DESC
    """,
		params,
		as_dict=True,
	)

	return {"success": True, "data": data}


def get_inventory_summary_report(filters):
	"""Get inventory summary report"""
	conditions = ["is_stock_item = 1"]
	params = []

	if filters.get("item_group"):
		conditions.append("item_group = %s")
		params.append(filters["item_group"])

	where_clause = " AND ".join(conditions)

	data = frappe.db.sql(
		f"""
        SELECT
            item_code, item_name, item_group,
            actual_qty, reserved_qty,
            (actual_qty - reserved_qty) as available_qty
        FROM `tabItem`
        WHERE {where_clause}
        ORDER BY available_qty ASC
    """,
		params,
		as_dict=True,
	)

	return {"success": True, "data": data}
