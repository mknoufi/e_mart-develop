# Copyright (c) 2025, efeone and contributors
# For license information, please see license.txt


import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import add_days, flt, getdate, nowdate


class LoyaltyPointsTransaction(Document):
	def validate(self):
		self.validate_customer_and_program()
		self.set_expiry_date()
		self.validate_points()

	def on_submit(self):
		self.update_customer_loyalty_points()

	def on_cancel(self):
		self.update_customer_loyalty_points(reverse=True)

	def validate_customer_and_program(self):
		"""Validate customer and loyalty program combination"""
		if not self.customer:
			frappe.throw(_("Customer is required"))
		if not self.loyalty_program:
			frappe.throw(_("Loyalty Program is required"))

	def validate_points(self):
		"""Validate loyalty points"""
		if flt(self.loyalty_points) <= 0 and self.transaction_type == "Earned":
			frappe.throw(_("Loyalty Points must be greater than zero for Earned transactions"))

		if flt(self.loyalty_points) >= 0 and self.transaction_type == "Redeemed":
			# Make redemption points negative
			self.loyalty_points = -abs(flt(self.loyalty_points))

	def set_expiry_date(self):
		"""Set expiry date for earned points (1 year from transaction date)"""
		if self.transaction_type == "Earned" and not self.expiry_date:
			self.expiry_date = add_days(getdate(self.transaction_date), 365)

	def update_customer_loyalty_points(self, reverse=False):
		"""Update customer's total loyalty points"""
		customer_doc = frappe.get_doc("Customer", self.customer)

		# Add custom field for total loyalty points if it doesn't exist
		if not hasattr(customer_doc, "total_loyalty_points"):
			# This would require a custom field to be added to Customer doctype
			# For now, we'll track it separately in our loyalty system
			pass

		# Store or update customer loyalty points in a separate tracking method
		# This could be implemented as a separate doctype or custom field

	def get_customer_current_points(self):
		"""Get customer's current loyalty points balance"""
		result = frappe.db.sql("""
			SELECT SUM(loyalty_points) as total_points
			FROM `tabLoyalty Points Transaction`
			WHERE customer = %s
			AND docstatus = 1
			AND (expiry_date IS NULL OR expiry_date >= %s)
		""", (self.customer, nowdate()), as_dict=True)

		return flt(result[0].total_points) if result and result[0].total_points else 0.0


@frappe.whitelist()
def get_customer_loyalty_points(customer, loyalty_program=None):
	"""Get customer's loyalty points summary"""
	filters = {"customer": customer, "docstatus": 1}
	if loyalty_program:
		filters["loyalty_program"] = loyalty_program

	# Get total points (excluding expired)
	total_points = frappe.db.sql("""
		SELECT SUM(loyalty_points) as total_points
		FROM `tabLoyalty Points Transaction`
		WHERE customer = %(customer)s
		AND docstatus = 1
		AND (expiry_date IS NULL OR expiry_date >= %(today)s)
		{loyalty_program_filter}
	""".format(
		loyalty_program_filter="AND loyalty_program = %(loyalty_program)s" if loyalty_program else ""
	), {
		"customer": customer,
		"today": nowdate(),
		"loyalty_program": loyalty_program
	}, as_dict=True)

	# Get total spent amount
	total_spent = frappe.db.sql("""
		SELECT SUM(grand_total) as total_spent
		FROM `tabSales Invoice`
		WHERE customer = %s AND docstatus = 1
	""", customer, as_dict=True)

	# Get recent transactions
	recent_transactions = frappe.get_all(
		"Loyalty Points Transaction",
		filters=filters,
		fields=["*"],
		order_by="transaction_date desc",
		limit=10
	)

	return {
		"current_points": flt(total_points[0].total_points) if total_points and total_points[0].total_points else 0.0,
		"total_spent": flt(total_spent[0].total_spent) if total_spent and total_spent[0].total_spent else 0.0,
		"recent_transactions": recent_transactions
	}


@frappe.whitelist()
def create_loyalty_points_entry(customer, loyalty_program, points, transaction_type="Earned",
								sales_invoice=None, remarks=None):
	"""Create a loyalty points transaction entry"""
	doc = frappe.new_doc("Loyalty Points Transaction")
	doc.customer = customer
	doc.loyalty_program = loyalty_program
	doc.loyalty_points = flt(points)
	doc.transaction_type = transaction_type
	doc.sales_invoice = sales_invoice
	doc.remarks = remarks

	if sales_invoice:
		si_doc = frappe.get_doc("Sales Invoice", sales_invoice)
		doc.invoice_amount = si_doc.grand_total

	doc.insert()
	doc.submit()

	return doc


@frappe.whitelist()
def get_loyalty_points_history(customer, limit=20):
	"""Get loyalty points transaction history for a customer"""
	return frappe.get_all(
		"Loyalty Points Transaction",
		filters={"customer": customer, "docstatus": 1},
		fields=[
			"name", "transaction_date", "transaction_type", "loyalty_points",
			"sales_invoice", "loyalty_program", "tier_achieved", "remarks"
		],
		order_by="transaction_date desc",
		limit=limit
	)
