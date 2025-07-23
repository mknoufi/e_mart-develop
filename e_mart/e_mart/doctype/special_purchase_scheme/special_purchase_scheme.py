# -*- coding: utf-8 -*-
"""Special Purchase Scheme DocType"""

import frappe
from frappe.model.document import Document

class SpecialPurchaseScheme(Document):
    """Special Purchase Scheme Document"""
    
    def validate(self):
        """Validate the document before saving"""
        self.validate_dates()
        self.validate_discount()
        self.validate_suppliers()
        self.validate_items()
    
    def validate_dates(self):
        """Validate start and end dates"""
        if self.start_date and self.end_date:
            if self.start_date >= self.end_date:
                frappe.throw("End date must be after start date")
    
    def validate_discount(self):
        """Validate discount percentage"""
        if self.discount_percentage:
            if self.discount_percentage < 0 or self.discount_percentage > 100:
                frappe.throw("Discount percentage must be between 0 and 100")
    
    def validate_suppliers(self):
        """Validate suppliers"""
        if not self.suppliers:
            frappe.throw("At least one supplier must be selected")
    
    def validate_items(self):
        """Validate items"""
        if not self.items:
            frappe.throw("At least one item must be selected")
    
    def on_submit(self):
        """Actions to perform when document is submitted"""
        self.update_status("Active")
        self.create_notification()
    
    def on_cancel(self):
        """Actions to perform when document is cancelled"""
        self.update_status("Cancelled")
    
    def update_status(self, status):
        """Update the status of the scheme"""
        self.status = status
        self.save()
    
    def create_notification(self):
        """Create notification for relevant users"""
        try:
            # Create notification for suppliers
            for supplier in self.suppliers:
                frappe.get_doc({
                    "doctype": "Notification Log",
                    "subject": f"New Special Purchase Scheme: {self.scheme_name}",
                    "for_user": supplier.supplier,
                    "type": "Alert",
                    "document_type": self.doctype,
                    "document_name": self.name
                }).insert(ignore_permissions=True)
        except Exception as e:
            frappe.log_error(f"Error creating notification for scheme {self.name}: {str(e)}")
    
    @frappe.whitelist()
    def get_scheme_details(self):
        """Get scheme details for API"""
        return {
            "name": self.name,
            "scheme_name": self.scheme_name,
            "scheme_code": self.scheme_code,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "discount_percentage": self.discount_percentage,
            "status": self.status,
            "description": self.description,
            "suppliers": [s.supplier for s in self.suppliers],
            "items": [i.item_code for i in self.items]
        }
    
    @frappe.whitelist()
    def is_active(self):
        """Check if scheme is currently active"""
        if self.status != "Active":
            return False
        
        if not self.start_date or not self.end_date:
            return False
        
        today = frappe.utils.today()
        return self.start_date <= today <= self.end_date 