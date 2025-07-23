# Copyright (c) 2025, efeone and Contributors
# See license.txt

"""
Series Management Module for E Mart App
Handles automatic series generation for different purchase types
"""

import re
from datetime import datetime

import frappe
from frappe import _
from frappe.utils import getdate, now_datetime


class SeriesManager:
	"""Manages automatic series generation for purchases"""

	@staticmethod
	def get_next_series(purchase_category, doctype="Purchase Invoice"):
		"""
		Get the next series number for a purchase category

		Args:
			purchase_category (str): "Normal" or "Special"
			doctype (str): Document type (default: "Purchase Invoice")

		Returns:
			str: Next series number
		"""
		try:
			# Get series mapping for the category
			series_mapping = frappe.get_all(
				"Purchase Series Mapping",
				filters={"purchase_category": purchase_category},
				fields=["*"],
				limit=1,
			)

			if not series_mapping:
				frappe.throw(_("No series mapping found for category: {0}").format(purchase_category))

			mapping = series_mapping[0]

			# Generate next series number
			next_series = SeriesManager._generate_series_number(mapping)

			# Update current series number
			SeriesManager._update_series_number(mapping.name, mapping.series_current + 1)

			return next_series

		except Exception as e:
			frappe.log_error(f"Series generation failed: {e!s}", "Series Manager Error")
			frappe.throw(_("Failed to generate series number: {0}").format(str(e)))

	@staticmethod
	def _generate_series_number(mapping):
		"""
		Generate series number based on mapping configuration

		Args:
			mapping (dict): Series mapping configuration

		Returns:
			str: Generated series number
		"""
		prefix = mapping.get("series_prefix", "")
		current_num = mapping.get("series_current", 1)
		series_format = mapping.get("series_format", "YYYYMMDD-####")

		# Generate number part based on format
		number_part = SeriesManager._format_number(current_num, series_format)

		# Combine prefix and number
		if prefix:
			return f"{prefix}-{number_part}"
		else:
			return number_part

	@staticmethod
	def _format_number(number, format_type):
		"""
		Format number according to specified format

		Args:
			number (int): Number to format
			format_type (str): Format specification

		Returns:
			str: Formatted number
		"""
		today = getdate()

		if format_type == "YYYYMMDD-####":
			date_part = today.strftime("%Y%m%d")
			return f"{date_part}-{number:04d}"

		elif format_type == "YYYY-####":
			year = today.strftime("%Y")
			return f"{year}-{number:04d}"

		elif format_type == "MM-####":
			month = today.strftime("%m")
			return f"{month}-{number:04d}"

		elif format_type == "####":
			return f"{number:04d}"

		elif format_type == "Custom":
			# Custom format - can be extended
			return f"{number:06d}"

		else:
			# Default format
			return f"{number:04d}"

	@staticmethod
	def _update_series_number(mapping_name, new_number):
		"""
		Update the current series number in the mapping

		Args:
			mapping_name (str): Name of the series mapping
			new_number (int): New current number
		"""
		try:
			frappe.db.set_value("Purchase Series Mapping", mapping_name, "series_current", new_number)
			frappe.db.commit()
		except Exception as e:
			frappe.log_error(f"Failed to update series number: {e!s}", "Series Manager Error")

	@staticmethod
	def reset_series(purchase_category, new_start_number=1):
		"""
		Reset series number for a purchase category

		Args:
			purchase_category (str): "Normal" or "Special"
			new_start_number (int): New starting number
		"""
		try:
			series_mapping = frappe.get_all(
				"Purchase Series Mapping",
				filters={"purchase_category": purchase_category},
				fields=["name"],
				limit=1,
			)

			if series_mapping:
				frappe.db.set_value(
					"Purchase Series Mapping", series_mapping[0].name, "series_current", new_start_number
				)
				frappe.db.commit()
				frappe.msgprint(_("Series reset successfully for {0}").format(purchase_category))
			else:
				frappe.throw(_("No series mapping found for category: {0}").format(purchase_category))

		except Exception as e:
			frappe.log_error(f"Series reset failed: {e!s}", "Series Manager Error")
			frappe.throw(_("Failed to reset series: {0}").format(str(e)))

	@staticmethod
	def get_series_info(purchase_category):
		"""
		Get current series information for a purchase category

		Args:
			purchase_category (str): "Normal" or "Special"

		Returns:
			dict: Series information
		"""
		try:
			series_mapping = frappe.get_all(
				"Purchase Series Mapping",
				filters={"purchase_category": purchase_category},
				fields=["*"],
				limit=1,
			)

			if series_mapping:
				mapping = series_mapping[0]
				return {
					"prefix": mapping.get("series_prefix"),
					"current_number": mapping.get("series_current"),
					"format": mapping.get("series_format"),
					"next_series": SeriesManager._generate_series_number(mapping),
				}
			else:
				return None

		except Exception as e:
			frappe.log_error(f"Failed to get series info: {e!s}", "Series Manager Error")
			return None


class PurchaseSeriesHandler:
	"""Handles series generation for purchase documents"""

	@staticmethod
	def on_submit(doc, method):
		"""
		Handle series generation when purchase document is submitted

		Args:
			doc: Purchase document
			method: Document method
		"""
		try:
			# Determine purchase category
			purchase_category = PurchaseSeriesHandler._get_purchase_category(doc)

			if purchase_category:
				# Generate and set series number
				series_number = SeriesManager.get_next_series(purchase_category, doc.doctype)
				doc.series_number = series_number
				doc.save()

				frappe.msgprint(_("Series number generated: {0}").format(series_number))

		except Exception as e:
			frappe.log_error(f"Series generation on submit failed: {e!s}", "Purchase Series Handler Error")

	@staticmethod
	def _get_purchase_category(doc):
		"""
		Determine purchase category based on document

		Args:
			doc: Purchase document

		Returns:
			str: "Normal" or "Special"
		"""
		# Check for special purchase indicators
		if hasattr(doc, "is_special_purchase") and doc.is_special_purchase:
			return "Special"

		# Check for special scheme indicators
		if hasattr(doc, "special_scheme") and doc.special_scheme:
			return "Special"

		# Check for special supplier indicators
		if hasattr(doc, "supplier") and doc.supplier:
			supplier_group = frappe.db.get_value("Supplier", doc.supplier, "supplier_group")
			if supplier_group and "special" in supplier_group.lower():
				return "Special"

		# Default to normal
		return "Normal"


@frappe.whitelist()
def get_next_series(purchase_category, doctype="Purchase Invoice"):
	"""
	API endpoint to get next series number

	Args:
		purchase_category (str): "Normal" or "Special"
		doctype (str): Document type

	Returns:
		dict: Response with series number
	"""
	try:
		series_number = SeriesManager.get_next_series(purchase_category, doctype)
		return {"status": "success", "series_number": series_number, "purchase_category": purchase_category}
	except Exception as e:
		return {"status": "error", "message": str(e)}


@frappe.whitelist()
def reset_series(purchase_category, new_start_number=1):
	"""
	API endpoint to reset series number

	Args:
		purchase_category (str): "Normal" or "Special"
		new_start_number (int): New starting number

	Returns:
		dict: Response
	"""
	try:
		SeriesManager.reset_series(purchase_category, int(new_start_number))
		return {"status": "success", "message": f"Series reset for {purchase_category}"}
	except Exception as e:
		return {"status": "error", "message": str(e)}


@frappe.whitelist()
def get_series_info(purchase_category):
	"""
	API endpoint to get series information

	Args:
		purchase_category (str): "Normal" or "Special"

	Returns:
		dict: Series information
	"""
	try:
		info = SeriesManager.get_series_info(purchase_category)
		if info:
			return {"status": "success", "data": info}
		else:
			return {"status": "error", "message": f"No series mapping found for {purchase_category}"}
	except Exception as e:
		return {"status": "error", "message": str(e)}
