# Copyright (c) 2025, efeone and Contributors
# See license.txt


import unittest

import frappe

from e_mart.e_mart.doctype.customer_loyalty_program.customer_loyalty_program import (
	get_applicable_loyalty_program,
	get_default_loyalty_program,
)


class TestCustomerLoyaltyProgram(unittest.TestCase):
	def setUp(self):
		# Clean up any existing test data
		frappe.db.sql("DELETE FROM `tabCustomer Loyalty Program` WHERE program_name LIKE 'Test%'")
		frappe.db.commit()

	def tearDown(self):
		# Clean up test data
		frappe.db.sql("DELETE FROM `tabCustomer Loyalty Program` WHERE program_name LIKE 'Test%'")
		frappe.db.commit()

	def test_single_tier_program_creation(self):
		"""Test creation of single tier loyalty program"""
		program = frappe.new_doc("Customer Loyalty Program")
		program.program_name = "Test Single Tier Program"
		program.loyalty_program_type = "Single Tier Program"
		program.conversion_factor = 1.0
		program.minimum_spent_amount = 100
		program.is_default = 1

		# Should save without errors
		program.save()
		self.assertEqual(program.program_name, "Test Single Tier Program")
		self.assertEqual(program.get_tier_factor(1000), 1.0)

	def test_multiple_tier_program_creation(self):
		"""Test creation of multiple tier loyalty program"""
		program = frappe.new_doc("Customer Loyalty Program")
		program.program_name = "Test Multiple Tier Program"
		program.loyalty_program_type = "Multiple Tier Program"
		program.conversion_factor = 1.0
		program.tier_1_collection_threshold = 1000
		program.tier_1_collection_multiplier = 1.0
		program.tier_2_collection_threshold = 5000
		program.tier_2_collection_multiplier = 1.5
		program.tier_3_collection_threshold = 10000
		program.tier_3_collection_multiplier = 2.0

		program.save()

		# Test tier calculations
		self.assertEqual(program.get_tier_factor(500), 1.0)   # Below tier 1
		self.assertEqual(program.get_tier_factor(1500), 1.0)  # Tier 1
		self.assertEqual(program.get_tier_factor(6000), 1.5)  # Tier 2
		self.assertEqual(program.get_tier_factor(12000), 2.0) # Tier 3

	def test_tier_validation(self):
		"""Test validation of tier thresholds"""
		program = frappe.new_doc("Customer Loyalty Program")
		program.program_name = "Test Invalid Tier Program"
		program.loyalty_program_type = "Multiple Tier Program"
		program.tier_1_collection_threshold = 1000
		program.tier_2_collection_threshold = 500  # Invalid: less than tier 1

		with self.assertRaises(frappe.ValidationError):
			program.save()

	def test_default_program_validation(self):
		"""Test that only one default program can exist"""
		# Create first default program
		program1 = frappe.new_doc("Customer Loyalty Program")
		program1.program_name = "Test Default Program 1"
		program1.is_default = 1
		program1.save()

		# Try to create second default program
		program2 = frappe.new_doc("Customer Loyalty Program")
		program2.program_name = "Test Default Program 2"
		program2.is_default = 1

		with self.assertRaises(frappe.ValidationError):
			program2.save()

	def test_tier_name_calculation(self):
		"""Test tier name calculation"""
		program = frappe.new_doc("Customer Loyalty Program")
		program.program_name = "Test Tier Names"
		program.loyalty_program_type = "Multiple Tier Program"
		program.tier_1_collection_threshold = 1000
		program.tier_2_collection_threshold = 5000
		program.tier_3_collection_threshold = 10000
		program.save()

		self.assertEqual(program.get_tier_name(500), "Standard")
		self.assertEqual(program.get_tier_name(1500), "Tier 1 (Silver)")
		self.assertEqual(program.get_tier_name(6000), "Tier 2 (Gold)")
		self.assertEqual(program.get_tier_name(12000), "Tier 3 (Premium)")

	def test_get_default_loyalty_program(self):
		"""Test getting default loyalty program"""
		# Create default program
		program = frappe.new_doc("Customer Loyalty Program")
		program.program_name = "Test Default Program"
		program.is_default = 1
		program.conversion_factor = 1.5
		program.minimum_spent_amount = 200
		program.save()

		default_program = get_default_loyalty_program()
		self.assertIsNotNone(default_program)
		self.assertEqual(default_program.program_name, "Test Default Program")
		self.assertEqual(default_program.conversion_factor, 1.5)

	def test_points_calculation_basis(self):
		"""Test loyalty program with different calculation basis"""
		# Test Total Amount basis (default)
		program1 = frappe.new_doc("Customer Loyalty Program")
		program1.program_name = "Test Total Amount Program"
		program1.loyalty_program_type = "Single Tier Program"
		program1.points_calculation_basis = "Total Amount"
		program1.conversion_factor = 1.0
		program1.save()

		self.assertEqual(getattr(program1, 'points_calculation_basis', 'Total Amount'), "Total Amount")

		# Test Profit basis
		program2 = frappe.new_doc("Customer Loyalty Program")
		program2.program_name = "Test Profit Program"
		program2.loyalty_program_type = "Single Tier Program"
		program2.points_calculation_basis = "Profit"
		program2.conversion_factor = 2.0
		program2.save()

		self.assertEqual(program2.points_calculation_basis, "Profit")


if __name__ == "__main__":
	unittest.main()
