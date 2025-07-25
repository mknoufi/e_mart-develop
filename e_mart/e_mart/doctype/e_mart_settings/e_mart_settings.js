// Copyright (c) 2025, efeone and contributors
// For license information, please see license.txt

frappe.ui.form.on("E-mart Settings", {
	refresh(frm) {
		// Add custom buttons for settings management
		frm.add_custom_button(__("Reset to Defaults"), function() {
			frappe.confirm(
				__("Are you sure you want to reset all settings to default values?"),
				function() {
					frappe.call({
						method: "e_mart.e_mart.doctype.e_mart_settings.e_mart_settings.reset_to_defaults",
						callback: function(r) {
							if (r.message && r.message.status === "success") {
								frappe.show_alert({
									message: r.message.message,
									indicator: "green"
								});
								frm.reload_doc();
							}
						}
					});
				}
			);
		});

		frm.add_custom_button(__("Preview Theme"), function() {
			show_theme_preview(frm);
		});

		frm.add_custom_button(__("Export Settings"), function() {
			export_settings(frm);
		});

		// Add help text for complex fields
		add_help_text(frm);
		
		// Setup color picker change handlers
		setup_color_handlers(frm);
		
		// Setup validation handlers
		setup_validation_handlers(frm);
	},

	// UI/UX Settings handlers
	primary_color(frm) {
		if (frm.doc.primary_color) {
			update_theme_preview(frm);
		}
	},

	secondary_color(frm) {
		if (frm.doc.secondary_color) {
			update_theme_preview(frm);
		}
	},

	ui_theme(frm) {
		update_theme_preview(frm);
	},

	enable_modern_ui(frm) {
		toggle_ui_features(frm);
	},

	// Security Settings handlers
	session_timeout_minutes(frm) {
		validate_numeric_range(frm, "session_timeout_minutes", 5, 1440, "Session timeout must be between 5 and 1440 minutes");
	},

	max_login_attempts(frm) {
		validate_numeric_range(frm, "max_login_attempts", 3, 10, "Max login attempts must be between 3 and 10");
	},

	min_password_length(frm) {
		validate_numeric_range(frm, "min_password_length", 6, 32, "Minimum password length must be between 6 and 32 characters");
	},

	password_expiry_days(frm) {
		validate_numeric_range(frm, "password_expiry_days", 30, 365, "Password expiry must be between 30 and 365 days");
	},

	// Mobile Settings handlers
	sync_frequency_minutes(frm) {
		validate_numeric_range(frm, "sync_frequency_minutes", 5, 60, "Sync frequency must be between 5 and 60 minutes");
	},

	// Integration Settings handlers
	api_rate_limit(frm) {
		validate_numeric_range(frm, "api_rate_limit", 10, 1000, "API rate limit must be between 10 and 1000 requests per minute");
	},

	enable_api_access(frm) {
		if (!frm.doc.enable_api_access) {
			frm.set_value("enable_webhooks", 0);
			frm.set_value("enable_third_party_sync", 0);
		}
	}
});

function add_help_text(frm) {
	// Add helpful descriptions for complex settings
	const help_texts = {
		"primary_color": "This color will be used for buttons, links, and accent elements throughout the app.",
		"session_timeout_minutes": "Users will be automatically logged out after this period of inactivity.",
		"enable_audit_log": "When enabled, all user actions will be logged for security and compliance purposes.",
		"api_rate_limit": "Prevents API abuse by limiting the number of requests per minute per user.",
		"enable_pwa": "Progressive Web App features allow the app to work like a native mobile app.",
		"backup_provider": "Choose where automatic backups should be stored. Local storage requires manual management."
	};

	Object.keys(help_texts).forEach(fieldname => {
		const field = frm.get_field(fieldname);
		if (field && field.$wrapper) {
			field.$wrapper.find('.control-label').attr('title', help_texts[fieldname]);
		}
	});
}

function setup_color_handlers(frm) {
	// Enhanced color picker with live preview
	['primary_color', 'secondary_color'].forEach(fieldname => {
		const field = frm.get_field(fieldname);
		if (field && field.$wrapper) {
			field.$wrapper.find('input[type="color"]').on('change', function() {
				const color = $(this).val();
				frm.set_value(fieldname, color);
				update_theme_preview(frm);
			});
		}
	});
}

function setup_validation_handlers(frm) {
	// Real-time validation for critical fields
	const validation_fields = [
		'session_timeout_minutes',
		'max_login_attempts', 
		'min_password_length',
		'password_expiry_days',
		'sync_frequency_minutes',
		'api_rate_limit'
	];

	validation_fields.forEach(fieldname => {
		const field = frm.get_field(fieldname);
		if (field) {
			field.$input.on('blur', function() {
				const value = parseInt($(this).val());
				if (value) {
					validate_field_value(frm, fieldname, value);
				}
			});
		}
	});
}

function validate_numeric_range(frm, fieldname, min, max, message) {
	const value = frm.doc[fieldname];
	if (value && (value < min || value > max)) {
		frappe.show_alert({
			message: message,
			indicator: "red"
		});
		frm.set_value(fieldname, null);
		return false;
	}
	return true;
}

function validate_field_value(frm, fieldname, value) {
	const validations = {
		"session_timeout_minutes": { min: 5, max: 1440 },
		"max_login_attempts": { min: 3, max: 10 },
		"min_password_length": { min: 6, max: 32 },
		"password_expiry_days": { min: 30, max: 365 },
		"sync_frequency_minutes": { min: 5, max: 60 },
		"api_rate_limit": { min: 10, max: 1000 }
	};

	const validation = validations[fieldname];
	if (validation && (value < validation.min || value > validation.max)) {
		frappe.show_alert({
			message: `${fieldname.replace(/_/g, ' ')} must be between ${validation.min} and ${validation.max}`,
			indicator: "red"
		});
		frm.set_value(fieldname, null);
		return false;
	}
	
	return true;
}

function update_theme_preview(frm) {
	if (!frm.doc.primary_color && !frm.doc.secondary_color) return;

	// Create a small preview of the theme
	const preview_html = `
		<div class="theme-preview" style="
			display: flex; 
			gap: 10px; 
			margin: 10px 0; 
			padding: 15px; 
			border: 1px solid #ddd; 
			border-radius: 8px;
			background: white;
		">
			<div style="
				background: ${frm.doc.primary_color || '#2563eb'}; 
				color: white; 
				padding: 8px 16px; 
				border-radius: 4px; 
				font-size: 12px;
			">Primary</div>
			<div style="
				background: ${frm.doc.secondary_color || '#64748b'}; 
				color: white; 
				padding: 8px 16px; 
				border-radius: 4px; 
				font-size: 12px;
			">Secondary</div>
			<div style="
				border: 2px solid ${frm.doc.primary_color || '#2563eb'}; 
				color: ${frm.doc.primary_color || '#2563eb'}; 
				padding: 6px 14px; 
				border-radius: 4px; 
				font-size: 12px;
			">Outline</div>
		</div>
	`;

	// Find or create preview container
	let preview_container = frm.wrapper.find('.theme-preview-container');
	if (!preview_container.length) {
		preview_container = $('<div class="theme-preview-container"></div>');
		frm.get_field('primary_color').$wrapper.after(preview_container);
	}

	preview_container.html(`
		<div style="margin: 10px 0;">
			<strong>Theme Preview:</strong>
			${preview_html}
		</div>
	`);
}

function show_theme_preview(frm) {
	// Show a modal with full theme preview
	const d = new frappe.ui.Dialog({
		title: __("Theme Preview"),
		fields: [
			{
				fieldtype: "HTML",
				fieldname: "preview_html",
				options: get_full_theme_preview(frm)
			}
		],
		size: "large"
	});

	d.show();
}

function get_full_theme_preview(frm) {
	const primary = frm.doc.primary_color || "#2563eb";
	const secondary = frm.doc.secondary_color || "#64748b";
	const theme = frm.doc.ui_theme || "Auto";

	return `
		<div class="e-mart-theme-preview" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
			<h4>Theme: ${theme}</h4>
			
			<!-- Buttons Preview -->
			<div style="margin: 20px 0;">
				<h5>Buttons</h5>
				<div style="display: flex; gap: 10px; flex-wrap: wrap;">
					<button style="background: ${primary}; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Primary Button</button>
					<button style="background: ${secondary}; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Secondary Button</button>
					<button style="background: transparent; color: ${primary}; border: 2px solid ${primary}; padding: 8px 18px; border-radius: 6px; cursor: pointer;">Outline Button</button>
				</div>
			</div>

			<!-- Cards Preview -->
			<div style="margin: 20px 0;">
				<h5>Cards</h5>
				<div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
					<div style="background: linear-gradient(135deg, ${primary}, ${secondary}); color: white; padding: 15px; margin: -20px -20px 15px -20px; border-radius: 12px 12px 0 0;">
						<h6 style="margin: 0; font-size: 16px;">Sample Card Header</h6>
					</div>
					<p style="margin: 0; color: #64748b;">This is how cards will look with your selected theme colors.</p>
				</div>
			</div>

			<!-- Form Elements Preview -->
			<div style="margin: 20px 0;">
				<h5>Form Elements</h5>
				<div style="display: grid; gap: 15px; max-width: 400px;">
					<input type="text" placeholder="Sample Input" style="padding: 10px; border: 2px solid #e2e8f0; border-radius: 6px; font-size: 14px;">
					<select style="padding: 10px; border: 2px solid #e2e8f0; border-radius: 6px; font-size: 14px;">
						<option>Sample Select Option</option>
					</select>
				</div>
			</div>

			<!-- Badges Preview -->
			<div style="margin: 20px 0;">
				<h5>Badges</h5>
				<div style="display: flex; gap: 10px; flex-wrap: wrap;">
					<span style="background: rgba(37, 99, 235, 0.1); color: ${primary}; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">Primary Badge</span>
					<span style="background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">Success Badge</span>
					<span style="background: rgba(245, 158, 11, 0.1); color: #f59e0b; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">Warning Badge</span>
				</div>
			</div>
		</div>
	`;
}

function toggle_ui_features(frm) {
	// Show/hide UI-related fields based on modern UI setting
	const ui_fields = [
		'ui_theme', 'primary_color', 'secondary_color',
		'enable_dark_mode', 'enable_animations', 'enable_sound_effects',
		'dashboard_layout', 'sidebar_position', 'enable_breadcrumbs'
	];

	ui_fields.forEach(fieldname => {
		frm.toggle_display(fieldname, frm.doc.enable_modern_ui);
	});

	if (!frm.doc.enable_modern_ui) {
		// Clear theme preview when modern UI is disabled
		frm.wrapper.find('.theme-preview-container').remove();
	}
}

function export_settings(frm) {
	// Export current settings as JSON
	frappe.call({
		method: "frappe.desk.form.save.savedocs",
		args: {
			doc: frm.doc,
			action: "Save"
		},
		callback: function(r) {
			if (!r.exc) {
				const settings_data = {
					...frm.doc,
					exported_at: frappe.datetime.now_datetime(),
					exported_by: frappe.session.user
				};

				const data_str = JSON.stringify(settings_data, null, 2);
				const data_blob = new Blob([data_str], {type: 'application/json'});
				const url = URL.createObjectURL(data_blob);
				
				const link = document.createElement('a');
				link.href = url;
				link.download = `e_mart_settings_${frappe.datetime.get_today()}.json`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(url);

				frappe.show_alert({
					message: __("Settings exported successfully"),
					indicator: "green"
				});
			}
		}
	});
}
