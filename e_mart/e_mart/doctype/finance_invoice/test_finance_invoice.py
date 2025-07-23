# Copyright (c) 2025, efeone and Contributors
# See license.txt

import frappe
from frappe.tests.utils import FrappeTestCase


class TestFinanceInvoice(FrappeTestCase):
	"""Test cases for Finance Invoice"""
	
	def setUp(self):
		"""Set up test data"""
		pass
	
	def test_finance_invoice_creation(self):
		"""Test Finance Invoice creation"""
		# Test that finance invoice can be created
		finance_invoice = frappe.new_doc("Finance Invoice")
		self.assertIsNotNone(finance_invoice)
		self.assertEqual(finance_invoice.doctype, "Finance Invoice")
	
	def test_required_fields(self):
		"""Test required fields are present"""
		finance_invoice = frappe.new_doc("Finance Invoice")
		self.assertTrue(hasattr(finance_invoice, 'customer'))
		self.assertTrue(hasattr(finance_invoice, 'posting_date'))
	
	def tearDown(self):
		"""Clean up test data"""
		pass
