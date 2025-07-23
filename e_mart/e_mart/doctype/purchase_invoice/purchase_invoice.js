// Copyright (c) 2025, efeone and Contributors
// See license.txt

frappe.ui.form.on('Purchase Invoice', {
	refresh: function(frm) {
		// Add custom buttons for series management
		frm.add_custom_button(__('Generate Series'), function() {
			generate_series_number(frm);
		}, __('Series'));
		
		frm.add_custom_button(__('Reset Series'), function() {
			reset_series_number(frm);
		}, __('Series'));
		
		// Add button to get series info
		frm.add_custom_button(__('Series Info'), function() {
			get_series_info(frm);
		}, __('Series'));
	},
	
	is_special_purchase: function(frm) {
		// Handle special purchase checkbox change
		if (frm.doc.is_special_purchase) {
			frm.set_value('purchase_category', 'Special');
			// Show special scheme field
			frm.toggle_display('special_scheme', true);
		} else {
			frm.set_value('purchase_category', 'Normal');
			frm.set_value('special_scheme', '');
			// Hide special scheme field
			frm.toggle_display('special_scheme', false);
		}
	},
	
	special_scheme: function(frm) {
		// Handle special scheme selection
		if (frm.doc.special_scheme) {
			load_scheme_details(frm);
		}
	},
	
	purchase_category: function(frm) {
		// Handle purchase category change
		if (frm.doc.purchase_category === 'Special') {
			frm.set_value('is_special_purchase', 1);
			frm.toggle_display('special_scheme', true);
		} else {
			frm.set_value('is_special_purchase', 0);
			frm.set_value('special_scheme', '');
			frm.toggle_display('special_scheme', false);
		}
	},
	
	onload: function(frm) {
		// Set default values on form load
		if (!frm.doc.purchase_category) {
			frm.set_value('purchase_category', 'Normal');
		}
		
		// Hide special scheme field initially if not special purchase
		if (!frm.doc.is_special_purchase) {
			frm.toggle_display('special_scheme', false);
		}
	}
});

function generate_series_number(frm) {
	// Generate series number for the current purchase category
	const purchase_category = frm.doc.purchase_category || 'Normal';
	
	frappe.call({
		method: 'e_mart.series_manager.get_next_series',
		args: {
			purchase_category: purchase_category,
			doctype: 'Purchase Invoice'
		},
		callback: function(r) {
			if (r.message && r.message.status === 'success') {
				frm.set_value('series_number', r.message.series_number);
				frappe.show_alert(__('Series number generated: {0}', [r.message.series_number]), 3);
			} else {
				frappe.msgprint(__('Failed to generate series number: {0}', [r.message.message || 'Unknown error']));
			}
		}
	});
}

function reset_series_number(frm) {
	// Reset series number for the current purchase category
	const purchase_category = frm.doc.purchase_category || 'Normal';
	
	frappe.prompt([
		{
			fieldname: 'new_start_number',
			label: __('New Start Number'),
			fieldtype: 'Int',
			default: 1,
			reqd: 1
		}
	], function(values) {
		frappe.call({
			method: 'e_mart.series_manager.reset_series',
			args: {
				purchase_category: purchase_category,
				new_start_number: values.new_start_number
			},
			callback: function(r) {
				if (r.message && r.message.status === 'success') {
					frappe.show_alert(__('Series reset successfully'), 3);
				} else {
					frappe.msgprint(__('Failed to reset series: {0}', [r.message.message || 'Unknown error']));
				}
			}
		});
	}, __('Reset Series'), __('Reset'));
}

function get_series_info(frm) {
	// Get series information for the current purchase category
	const purchase_category = frm.doc.purchase_category || 'Normal';
	
	frappe.call({
		method: 'e_mart.series_manager.get_series_info',
		args: {
			purchase_category: purchase_category
		},
		callback: function(r) {
			if (r.message && r.message.status === 'success') {
				const info = r.message.data;
				show_series_info_dialog(info);
			} else {
				frappe.msgprint(__('Failed to get series info: {0}', [r.message.message || 'Unknown error']));
			}
		}
	});
}

function show_series_info_dialog(info) {
	// Show series information in a dialog
	const content = `
		<div style="padding: 20px;">
			<h4>Series Information</h4>
			<table class="table table-bordered">
				<tr>
					<td><strong>Prefix:</strong></td>
					<td>${info.prefix || 'None'}</td>
				</tr>
				<tr>
					<td><strong>Current Number:</strong></td>
					<td>${info.current_number}</td>
				</tr>
				<tr>
					<td><strong>Format:</strong></td>
					<td>${info.format}</td>
				</tr>
				<tr>
					<td><strong>Next Series:</strong></td>
					<td><code>${info.next_series}</code></td>
				</tr>
			</table>
		</div>
	`;
	
	const d = new frappe.ui.Dialog({
		title: __('Series Information'),
		width: 500,
		fields: [{
			fieldtype: 'HTML',
			options: content
		}]
	});
	
	d.show();
}

function load_scheme_details(frm) {
	// Load special scheme details when selected
	if (!frm.doc.special_scheme) return;
	
	frappe.call({
		method: 'frappe.client.get',
		args: {
			doctype: 'Special Purchase Scheme',
			name: frm.doc.special_scheme
		},
		callback: function(r) {
			if (r.message) {
				const scheme = r.message;
				
				// Show scheme details
				frappe.show_alert(__('Scheme loaded: {0}', [scheme.scheme_name]), 3);
				
				// Apply scheme discount if applicable
				if (scheme.discount_type === 'Percentage' && scheme.discount_percentage) {
					apply_scheme_discount(frm, scheme);
				}
			}
		}
	});
}

function apply_scheme_discount(frm, scheme) {
	// Apply scheme discount to purchase invoice
	if (scheme.discount_type === 'Percentage' && scheme.discount_percentage) {
		// Calculate discount amount
		const total_amount = frm.doc.total || 0;
		const discount_amount = (total_amount * scheme.discount_percentage) / 100;
		
		// Apply discount
		frm.set_value('discount_amount', discount_amount);
		frm.set_value('discount_percentage', scheme.discount_percentage);
		
		frappe.show_alert(__('Scheme discount applied: {0}%', [scheme.discount_percentage]), 3);
	}
}

// Add custom field for series number display
frappe.ui.form.on('Purchase Invoice', {
	series_number: function(frm) {
		// Update series number display
		if (frm.doc.series_number) {
			frm.set_df_property('series_number', 'description', 
				__('Auto-generated series number for {0} purchase', [frm.doc.purchase_category]));
		}
	}
});

// Add validation for series number
frappe.ui.form.on('Purchase Invoice', {
	validate: function(frm) {
		// Ensure series number is generated for submitted documents
		if (frm.doc.docstatus === 1 && !frm.doc.series_number) {
			frappe.msgprint(__('Please generate a series number before submitting the document.'));
			frappe.validated = false;
		}
	}
}); 