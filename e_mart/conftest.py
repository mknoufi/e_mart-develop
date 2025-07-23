# Copyright (c) 2025, efeone and Contributors
# See license.txt

"""
Pytest configuration for E Mart app tests
"""

import pytest
import frappe
from frappe.tests.utils import FrappeTestCase


@pytest.fixture(scope="session")
def app():
	"""Initialize the E Mart app for testing"""
	return "e_mart"


@pytest.fixture(scope="function")
def test_doc():
	"""Create a test document for testing"""
	doc = frappe.new_doc("E-mart Settings")
	return doc


class BaseTestCase(FrappeTestCase):
	"""Base test case for E Mart app tests"""
	
	def setUp(self):
		"""Set up test environment"""
		super().setUp()
		frappe.clear_cache()
	
	def tearDown(self):
		"""Clean up test environment"""
		frappe.clear_cache()
		super().tearDown()
	
	def create_test_data(self):
		"""Create test data for tests"""
		pass
	
	def cleanup_test_data(self):
		"""Clean up test data"""
		pass 