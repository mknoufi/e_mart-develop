# Copyright (c) 2025, efeone and contributors
# For license information, please see license.txt


import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import flt, get_link_to_form


class CustomerLoyaltyProgram(Document):
	def validate(self):
		self.validate_dates()
		self.validate_tiers()
		self.validate_default_program()

	def validate_dates(self):
		"""Validate that to_date is after from_date"""
		if self.from_date and self.to_date:
			if self.from_date > self.to_date:
				frappe.throw(_("Valid To date cannot be before Valid From date"))

	def validate_tiers(self):
		"""Validate tier configurations for multiple tier programs"""
		if self.loyalty_program_type == "Multiple Tier Program":
			if not self.tier_1_collection_threshold:
				frappe.throw(_("Tier 1 Collection Threshold is required for Multiple Tier Program"))

			if self.tier_2_collection_threshold and self.tier_2_collection_threshold <= self.tier_1_collection_threshold:
				frappe.throw(_("Tier 2 Collection Threshold must be greater than Tier 1"))

			if self.tier_3_collection_threshold and self.tier_3_collection_threshold <= self.tier_2_collection_threshold:
				frappe.throw(_("Tier 3 Collection Threshold must be greater than Tier 2"))

	def validate_default_program(self):
		"""Ensure only one default program exists"""
		if self.is_default:
			existing_default = frappe.db.get_value(
				"Customer Loyalty Program",
				{"is_default": 1, "name": ("!=", self.name)},
				"name"
			)
			if existing_default:
				frappe.throw(
					_("Another Loyalty Program {0} is set as default. Please disable it first.")
					.format(get_link_to_form("Customer Loyalty Program", existing_default))
				)

	def get_tier_factor(self, total_spent_amount):
		"""Get the conversion factor based on customer's total spent amount"""
		if self.loyalty_program_type == "Single Tier Program":
			return self.conversion_factor

		# Multiple tier program logic
		total_spent = flt(total_spent_amount)

		if self.tier_3_collection_threshold and total_spent >= flt(self.tier_3_collection_threshold):
			return flt(self.tier_3_collection_multiplier)
		elif self.tier_2_collection_threshold and total_spent >= flt(self.tier_2_collection_threshold):
			return flt(self.tier_2_collection_multiplier)
		elif total_spent >= flt(self.tier_1_collection_threshold):
			return flt(self.tier_1_collection_multiplier)
		else:
			return self.conversion_factor

	def get_tier_name(self, total_spent_amount):
		"""Get the tier name based on customer's total spent amount"""
		if self.loyalty_program_type == "Single Tier Program":
			return "Standard"

		total_spent = flt(total_spent_amount)

		if self.tier_3_collection_threshold and total_spent >= flt(self.tier_3_collection_threshold):
			return "Tier 3 (Premium)"
		elif self.tier_2_collection_threshold and total_spent >= flt(self.tier_2_collection_threshold):
			return "Tier 2 (Gold)"
		elif total_spent >= flt(self.tier_1_collection_threshold):
			return "Tier 1 (Silver)"
		else:
			return "Standard"


@frappe.whitelist()
def get_default_loyalty_program():
	"""Get the default loyalty program"""
	return frappe.db.get_value(
		"Customer Loyalty Program",
		{"is_default": 1},
		["name", "program_name", "conversion_factor", "minimum_spent_amount"],
		as_dict=True
	)


@frappe.whitelist()
def get_applicable_loyalty_program(customer):
	"""Get applicable loyalty program for a customer"""
	customer_doc = frappe.get_doc("Customer", customer)
	customer_group = customer_doc.customer_group

	# Check for customer group specific program first
	loyalty_program = frappe.db.get_value(
		"Customer Loyalty Program",
		{"customer_group": customer_group},
		["name", "program_name", "conversion_factor", "minimum_spent_amount"],
		as_dict=True
	)

	if not loyalty_program:
		# Fall back to default program
		loyalty_program = get_default_loyalty_program()

	return loyalty_program
