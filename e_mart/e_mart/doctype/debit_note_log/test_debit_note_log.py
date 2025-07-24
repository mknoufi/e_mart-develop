# Copyright (c) 2025, efeone and Contributors
# See license.txt

import frappe
from frappe.tests.utils import FrappeTestCase


class TestDebitNoteLog(FrappeTestCase):
	"""Test cases for Debit Note Log"""

	def setUp(self):
		"""Set up test data"""
		pass

	def test_debit_note_log_creation(self):
		"""Test Debit Note Log creation"""
		# Test that debit note log can be created
		debit_note_log = frappe.new_doc("Debit Note Log")
		self.assertIsNotNone(debit_note_log)
		self.assertEqual(debit_note_log.doctype, "Debit Note Log")

	def test_required_fields(self):
		"""Test required fields are present"""
		debit_note_log = frappe.new_doc("Debit Note Log")
		self.assertTrue(hasattr(debit_note_log, "supplier"))
		self.assertTrue(hasattr(debit_note_log, "purchase_invoice"))
		self.assertTrue(hasattr(debit_note_log, "status"))

	def tearDown(self):
		"""Clean up test data"""
		pass
