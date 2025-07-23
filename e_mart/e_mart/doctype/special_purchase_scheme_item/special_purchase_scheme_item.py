"""Special Purchase Scheme Item DocType"""

import frappe
from frappe.model.document import Document


class SpecialPurchaseSchemeItem(Document):
	"""Special Purchase Scheme Item Document"""

	def validate(self):
		"""Validate the document before saving"""
		if not self.item_code:
			frappe.throw("Item Code is required")

		if not self.special_purchase_scheme:
			frappe.throw("Special Purchase Scheme is required")
