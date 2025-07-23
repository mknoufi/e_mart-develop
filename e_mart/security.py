# Copyright (c) 2025, efeone and Contributors
# See license.txt

"""
Security module for E Mart app
"""

import frappe
from frappe import _
from frappe.utils import cstr, flt


class SecurityManager:
	"""Security manager for E Mart app"""

	@staticmethod
	def validate_user_permissions(doc, method):
		"""Validate user permissions for sensitive operations"""
		if not frappe.has_permission(doc.doctype, "write"):
			frappe.throw(_("Insufficient permissions to modify {0}").format(doc.doctype))

	@staticmethod
	def sanitize_input(data):
		"""Sanitize user input to prevent injection attacks"""
		if isinstance(data, str):
			# Remove potentially dangerous characters
			dangerous_chars = ["<", ">", '"', "'", "&", ";", "(", ")"]
			for char in dangerous_chars:
				data = data.replace(char, "")
		return data

	@staticmethod
	def validate_amount(amount, field_name="Amount"):
		"""Validate amount fields"""
		try:
			amount = flt(amount)
			if amount < 0:
				frappe.throw(_("{0} cannot be negative").format(field_name))
			return amount
		except (ValueError, TypeError):
			frappe.throw(_("Invalid {0} format").format(field_name))

	@staticmethod
	def log_security_event(event_type, details, user=None):
		"""Log security events for audit trail"""
		if not user:
			user = frappe.session.user

		frappe.logger().info(f"Security Event: {event_type} - {details} - User: {user}")


class DataValidation:
	"""Data validation utilities"""

	@staticmethod
	def validate_phone_number(phone):
		"""Validate phone number format"""
		if phone and not phone.replace("+", "").replace("-", "").replace(" ", "").isdigit():
			frappe.throw(_("Invalid phone number format"))
		return phone

	@staticmethod
	def validate_email(email):
		"""Validate email format"""
		import re

		pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
		if email and not re.match(pattern, email):
			frappe.throw(_("Invalid email format"))
		return email

	@staticmethod
	def validate_pan_number(pan):
		"""Validate PAN number format"""
		import re

		pattern = r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$"
		if pan and not re.match(pattern, pan):
			frappe.throw(_("Invalid PAN number format"))
		return pan


class RateLimiting:
	"""Rate limiting for API endpoints"""

	@staticmethod
	def check_rate_limit(key, max_requests=100, window=3600):
		"""Check rate limit for API calls"""
		cache_key = f"rate_limit:{key}"
		current_count = frappe.cache().get_value(cache_key) or 0

		if current_count >= max_requests:
			frappe.throw(_("Rate limit exceeded. Please try again later."))

		frappe.cache().set_value(cache_key, current_count + 1, expires_in_sec=window)
		return True
