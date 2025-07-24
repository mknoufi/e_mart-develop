# Copyright (c) 2025, efeone and Contributors
# See license.txt


import unittest

import frappe
from frappe.utils import add_days, nowdate

from e_mart.e_mart.doctype.loyalty_points_transaction.loyalty_points_transaction import (
	create_loyalty_points_entry,
	get_customer_loyalty_points,
)


class TestLoyaltyPointsTransaction(unittest.TestCase):
	def setUp(self):
		# Clean up test data
		frappe.db.sql("DELETE FROM `tabLoyalty Points Transaction` WHERE customer LIKE 'Test Customer%'")
		frappe.db.sql("DELETE FROM `tabCustomer Loyalty Program` WHERE program_name LIKE 'Test%'")
		frappe.db.commit()

		# Create test loyalty program
		self.loyalty_program = frappe.new_doc("Customer Loyalty Program")
		self.loyalty_program.program_name = "Test Loyalty Program"
		self.loyalty_program.conversion_factor = 1.0
		self.loyalty_program.minimum_spent_amount = 100
		self.loyalty_program.is_default = 1
		self.loyalty_program.save()

	def tearDown(self):
		# Clean up test data
		frappe.db.sql("DELETE FROM `tabLoyalty Points Transaction` WHERE customer LIKE 'Test Customer%'")
		frappe.db.sql("DELETE FROM `tabCustomer Loyalty Program` WHERE program_name LIKE 'Test%'")
		frappe.db.commit()

	def test_loyalty_points_transaction_creation(self):
		"""Test creating a loyalty points transaction"""
		transaction = frappe.new_doc("Loyalty Points Transaction")
		transaction.customer = "Test Customer 1"
		transaction.loyalty_program = self.loyalty_program.name
		transaction.loyalty_points = 100
		transaction.transaction_type = "Earned"
		transaction.transaction_date = nowdate()

		transaction.save()
		self.assertEqual(transaction.loyalty_points, 100)
		self.assertEqual(transaction.transaction_type, "Earned")

		# Test expiry date is set
		self.assertIsNotNone(transaction.expiry_date)

	def test_redemption_points_validation(self):
		"""Test that redemption points are stored as negative"""
		transaction = frappe.new_doc("Loyalty Points Transaction")
		transaction.customer = "Test Customer 2"
		transaction.loyalty_program = self.loyalty_program.name
		transaction.loyalty_points = 50
		transaction.transaction_type = "Redeemed"
		transaction.transaction_date = nowdate()

		transaction.save()
		# Points should be negative for redemption
		self.assertEqual(transaction.loyalty_points, -50)

	def test_customer_loyalty_points_calculation(self):
		"""Test customer loyalty points balance calculation"""
		customer = "Test Customer 3"

		# Create earned points transaction
		earned_transaction = frappe.new_doc("Loyalty Points Transaction")
		earned_transaction.customer = customer
		earned_transaction.loyalty_program = self.loyalty_program.name
		earned_transaction.loyalty_points = 200
		earned_transaction.transaction_type = "Earned"
		earned_transaction.save()
		earned_transaction.submit()

		# Create redeemed points transaction
		redeemed_transaction = frappe.new_doc("Loyalty Points Transaction")
		redeemed_transaction.customer = customer
		redeemed_transaction.loyalty_program = self.loyalty_program.name
		redeemed_transaction.loyalty_points = 50
		redeemed_transaction.transaction_type = "Redeemed"
		redeemed_transaction.save()
		redeemed_transaction.submit()

		# Check balance
		balance = get_customer_loyalty_points(customer)
		expected_balance = 200 - 50  # 150 points
		self.assertEqual(balance["current_points"], expected_balance)

	def test_expired_points_exclusion(self):
		"""Test that expired points are excluded from balance"""
		customer = "Test Customer 4"

		# Create transaction with past expiry date
		expired_transaction = frappe.new_doc("Loyalty Points Transaction")
		expired_transaction.customer = customer
		expired_transaction.loyalty_program = self.loyalty_program.name
		expired_transaction.loyalty_points = 100
		expired_transaction.transaction_type = "Earned"
		expired_transaction.expiry_date = add_days(nowdate(), -1)  # Expired yesterday
		expired_transaction.save()
		expired_transaction.submit()

		# Create active transaction
		active_transaction = frappe.new_doc("Loyalty Points Transaction")
		active_transaction.customer = customer
		active_transaction.loyalty_program = self.loyalty_program.name
		active_transaction.loyalty_points = 75
		active_transaction.transaction_type = "Earned"
		active_transaction.save()
		active_transaction.submit()

		# Check balance - should only include active points
		balance = get_customer_loyalty_points(customer)
		self.assertEqual(balance["current_points"], 75)

	def test_create_loyalty_points_entry_api(self):
		"""Test the API function for creating loyalty points entries"""
		customer = "Test Customer 5"

		entry = create_loyalty_points_entry(
			customer=customer,
			loyalty_program=self.loyalty_program.name,
			points=150,
			transaction_type="Earned",
			remarks="API test transaction"
		)

		self.assertEqual(entry.customer, customer)
		self.assertEqual(entry.loyalty_points, 150)
		self.assertEqual(entry.docstatus, 1)  # Should be submitted
		self.assertEqual(entry.remarks, "API test transaction")

	def test_points_validation(self):
		"""Test validation of points values"""
		# Test negative points for earned transaction
		transaction = frappe.new_doc("Loyalty Points Transaction")
		transaction.customer = "Test Customer 6"
		transaction.loyalty_program = self.loyalty_program.name
		transaction.loyalty_points = -50
		transaction.transaction_type = "Earned"

		with self.assertRaises(frappe.ValidationError):
			transaction.save()


if __name__ == "__main__":
	unittest.main()
