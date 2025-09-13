# Copyright (c) 2025, efeone and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import validate_email_address, now, get_datetime
import json
import hashlib
import re


class EmartSettings(Document):
	"""
	Enhanced E Mart Settings controller with comprehensive configuration management.
	Handles UI/UX settings, security, features, mobile app settings, and integrations.
	"""

	def validate(self):
		"""Validate all settings before saving"""
		self.validate_ui_settings()
		self.validate_security_settings()
		self.validate_mobile_settings()
		self.validate_integration_settings()

	def on_update(self):
		"""Actions to perform after settings are updated"""
		self.update_css_variables()
		self.clear_cache()
		self.log_settings_change()

	def validate_ui_settings(self):
		"""Validate UI/UX related settings"""
		# Validate color codes
		if self.primary_color and not self.is_valid_color(self.primary_color):
			frappe.throw("Invalid primary color format. Use hex format (#ffffff)")
		
		if self.secondary_color and not self.is_valid_color(self.secondary_color):
			frappe.throw("Invalid secondary color format. Use hex format (#ffffff)")

	def validate_security_settings(self):
		"""Validate security-related settings"""
		# Validate session timeout
		if self.session_timeout_minutes and (self.session_timeout_minutes < 5 or self.session_timeout_minutes > 1440):
			frappe.throw("Session timeout must be between 5 and 1440 minutes")
		
		# Validate max login attempts
		if self.max_login_attempts and (self.max_login_attempts < 3 or self.max_login_attempts > 10):
			frappe.throw("Max login attempts must be between 3 and 10")
		
		# Validate password settings
		if self.min_password_length and (self.min_password_length < 6 or self.min_password_length > 32):
			frappe.throw("Minimum password length must be between 6 and 32 characters")
		
		if self.password_expiry_days and (self.password_expiry_days < 30 or self.password_expiry_days > 365):
			frappe.throw("Password expiry must be between 30 and 365 days")

	def validate_mobile_settings(self):
		"""Validate mobile app settings"""
		if self.sync_frequency_minutes and (self.sync_frequency_minutes < 5 or self.sync_frequency_minutes > 60):
			frappe.throw("Sync frequency must be between 5 and 60 minutes")

	def validate_integration_settings(self):
		"""Validate integration settings"""
		if self.api_rate_limit and (self.api_rate_limit < 10 or self.api_rate_limit > 1000):
			frappe.throw("API rate limit must be between 10 and 1000 requests per minute")

	def is_valid_color(self, color):
		"""Validate hex color format"""
		return bool(re.match(r'^#[0-9A-Fa-f]{6}$', color))

	def update_css_variables(self):
		"""Update CSS custom properties based on settings"""
		if not (self.primary_color or self.secondary_color):
			return

		css_vars = {}
		if self.primary_color:
			css_vars['--e-mart-primary'] = self.primary_color
			css_vars['--e-mart-primary-dark'] = self.darken_color(self.primary_color)
		
		if self.secondary_color:
			css_vars['--e-mart-secondary'] = self.secondary_color

		# Store CSS variables for frontend use
		frappe.cache().set_value("e_mart_css_vars", css_vars)

	def darken_color(self, hex_color, factor=0.2):
		"""Darken a hex color by a factor"""
		hex_color = hex_color.lstrip('#')
		rgb = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
		darkened = tuple(max(0, int(c * (1 - factor))) for c in rgb)
		return f"#{darkened[0]:02x}{darkened[1]:02x}{darkened[2]:02x}"

	def clear_cache(self):
		"""Clear relevant caches when settings change"""
		frappe.clear_cache()
		# Clear specific caches
		cache_keys = [
			"e_mart_settings",
			"e_mart_css_vars",
			"e_mart_ui_config"
		]
		for key in cache_keys:
			frappe.cache().delete_value(key)

	def log_settings_change(self):
		"""Log settings changes for audit trail"""
		if not self.enable_audit_log:
			return

		frappe.get_doc({
			"doctype": "Activity Log",
			"subject": f"E Mart Settings updated by {frappe.session.user}",
			"content": f"Settings modified at {now()}",
			"communication_date": now(),
			"reference_doctype": "E-mart Settings",
			"reference_name": self.name,
			"timeline_doctype": "E-mart Settings",
			"timeline_name": self.name
		}).insert(ignore_permissions=True)

	@staticmethod
	def get_settings():
		"""Get E Mart settings with caching"""
		settings = frappe.cache().get_value("e_mart_settings")
		if not settings:
			try:
				doc = frappe.get_single("E-mart Settings")
				settings = doc.as_dict()
				frappe.cache().set_value("e_mart_settings", settings, expires_in_sec=300)
			except Exception:
				# Return default settings if doc doesn't exist
				settings = EmartSettings.get_default_settings()
		return settings

	@staticmethod
	def get_default_settings():
		"""Return default settings"""
		return {
			"enable_modern_ui": 1,
			"ui_theme": "Auto",
			"primary_color": "#2563eb",
			"secondary_color": "#64748b",
			"enable_animations": 1,
			"dashboard_layout": "Cards",
			"sidebar_position": "Left",
			"enable_breadcrumbs": 1,
			"enable_notifications": 1,
			"enable_email_alerts": 1,
			"enable_audit_log": 1,
			"enable_data_export": 1,
			"enable_backup_reminders": 1,
			"enable_advanced_reporting": 1,
			"enable_analytics_dashboard": 1,
			"session_timeout_minutes": 60,
			"max_login_attempts": 5,
			"enable_login_logging": 1,
			"enable_api_rate_limiting": 1,
			"password_expiry_days": 90,
			"min_password_length": 8,
			"require_special_characters": 1,
			"enable_pwa": 1,
			"enable_offline_mode": 1,
			"enable_push_notifications": 1,
			"mobile_theme": "Auto",
			"sync_frequency_minutes": 15,
			"enable_api_access": 1,
			"api_rate_limit": 100,
			"backup_provider": "Local"
		}

	def get_ui_config(self):
		"""Get UI configuration for frontend"""
		return {
			"theme": self.ui_theme or "Auto",
			"primaryColor": self.primary_color or "#2563eb",
			"secondaryColor": self.secondary_color or "#64748b",
			"enableAnimations": bool(self.enable_animations),
			"dashboardLayout": self.dashboard_layout or "Cards",
			"sidebarPosition": self.sidebar_position or "Left",
			"enableBreadcrumbs": bool(self.enable_breadcrumbs),
			"enableModernUI": bool(self.enable_modern_ui),
			"enableDarkMode": bool(self.enable_dark_mode),
			"enableSoundEffects": bool(self.enable_sound_effects)
		}

	def get_feature_config(self):
		"""Get feature configuration"""
		return {
			"notifications": bool(self.enable_notifications),
			"emailAlerts": bool(self.enable_email_alerts),
			"smsAlerts": bool(self.enable_sms_alerts),
			"auditLog": bool(self.enable_audit_log),
			"dataExport": bool(self.enable_data_export),
			"backupReminders": bool(self.enable_backup_reminders),
			"advancedReporting": bool(self.enable_advanced_reporting),
			"analyticsDashboard": bool(self.enable_analytics_dashboard),
			"performanceMonitoring": bool(self.enable_performance_monitoring)
		}

	def get_security_config(self):
		"""Get security configuration"""
		return {
			"sessionTimeout": self.session_timeout_minutes or 60,
			"maxLoginAttempts": self.max_login_attempts or 5,
			"requirePasswordChange": bool(self.require_password_change),
			"twoFactorAuth": bool(self.enable_two_factor_auth),
			"loginLogging": bool(self.enable_login_logging),
			"apiRateLimiting": bool(self.enable_api_rate_limiting),
			"passwordExpiry": self.password_expiry_days or 90,
			"minPasswordLength": self.min_password_length or 8,
			"requireSpecialChars": bool(self.require_special_characters)
		}

	def get_mobile_config(self):
		"""Get mobile app configuration"""
		return {
			"pwa": bool(self.enable_pwa),
			"offlineMode": bool(self.enable_offline_mode),
			"pushNotifications": bool(self.enable_push_notifications),
			"theme": self.mobile_theme or "Auto",
			"biometricLogin": bool(self.enable_biometric_login),
			"syncFrequency": self.sync_frequency_minutes or 15
		}


# API methods for frontend access
@frappe.whitelist()
def get_e_mart_settings():
	"""Public API to get E Mart settings"""
	settings = EmartSettings.get_settings()
	return {
		"ui": EmartSettings().get_ui_config() if hasattr(EmartSettings(), 'get_ui_config') else {},
		"features": EmartSettings().get_feature_config() if hasattr(EmartSettings(), 'get_feature_config') else {},
		"mobile": EmartSettings().get_mobile_config() if hasattr(EmartSettings(), 'get_mobile_config') else {}
	}


@frappe.whitelist()
def get_ui_config():
	"""Get UI configuration for theme customization"""
	try:
		doc = frappe.get_single("E-mart Settings")
		return doc.get_ui_config()
	except Exception:
		return EmartSettings().get_ui_config()


@frappe.whitelist()
def update_user_preferences(preferences):
	"""Update user-specific UI preferences"""
	if isinstance(preferences, str):
		preferences = json.loads(preferences)
	
	user_preferences = frappe.get_doc("User", frappe.session.user)
	
	# Store preferences in user defaults
	for key, value in preferences.items():
		frappe.db.set_default(f"e_mart_{key}", value, frappe.session.user)
	
	frappe.db.commit()
	return {"status": "success", "message": "Preferences updated successfully"}


@frappe.whitelist()
def reset_to_defaults():
	"""Reset settings to default values"""
	if not frappe.has_permission("E-mart Settings", "write"):
		frappe.throw("Not permitted to reset settings")
	
	doc = frappe.get_single("E-mart Settings")
	defaults = EmartSettings.get_default_settings()
	
	for key, value in defaults.items():
		if hasattr(doc, key):
			setattr(doc, key, value)
	
	doc.save()
	frappe.db.commit()
	
	return {"status": "success", "message": "Settings reset to defaults"}
