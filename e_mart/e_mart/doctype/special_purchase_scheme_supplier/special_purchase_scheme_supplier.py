# -*- coding: utf-8 -*-
"""Special Purchase Scheme Supplier DocType"""

import frappe
from frappe.model.document import Document

class SpecialPurchaseSchemeSupplier(Document):
    """Special Purchase Scheme Supplier Document"""
    
    def validate(self):
        """Validate the document before saving"""
        if not self.supplier:
            frappe.throw("Supplier is required")
        
        if not self.special_purchase_scheme:
            frappe.throw("Special Purchase Scheme is required") 