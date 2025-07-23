# E Mart App - Installation & Setup Guide

## 🏪 Overview

E Mart is a comprehensive retail management app built on Frappe Framework and ERPNext, designed for electronics and appliance retail businesses. It provides EMI management, commission tracking, buyback functionality, and advanced inventory management.

## 📋 Prerequisites

### System Requirements
- **Python**: 3.10 or higher
- **Frappe Framework**: v15.0 or higher
- **ERPNext**: v15.0 or higher
- **Node.js**: 18.0 or higher
- **MariaDB**: 10.6 or higher
- **Redis**: 6.0 or higher

### Frappe Bench Setup
```bash
# Install Frappe Bench
pip install frappe-bench

# Initialize new bench
bench init e-mart-bench
cd e-mart-bench

# Create new site
bench new-site e-mart.localhost
bench use e-mart.localhost

# Install ERPNext
bench get-app erpnext
bench install-app erpnext
```

## 🚀 Installation Steps

### 1. Install E Mart App
```bash
# Get the E Mart app
bench get-app e_mart https://github.com/your-repo/e_mart-develop

# Install the app
bench install-app e_mart
```

### 2. Setup Custom Fields
The app automatically adds custom fields to ERPNext DocTypes during installation:
- Sales Invoice: EMI fields, buyback fields
- Purchase Invoice: Debit note fields
- Item: Buyback fields
- Customer: EMI eligibility fields
- Employee: Commission fields

### 3. Configure E Mart Settings
1. Go to **E Mart > E Mart Settings**
2. Configure the following:
   - **Scrap Warehouse**: For buyback items
   - **Buyback Posting Account**: For buyback transactions
   - **Default EMI Duration**: Default EMI period
   - **Commission Settings**: Employee commission rates

### 4. Setup Commission Structure
1. Create **EMI Duration** records
2. Configure **Purchase Series Mapping**
3. Set up **Sales Expenses** categories

## 🔧 Configuration

### EMI Configuration
```python
# Example EMI Duration setup
{
    "duration_name": "12 Months",
    "duration_in_months": 12,
    "interest_rate": 0.15  # 15% annual interest
}
```

### Commission Setup
1. **Monthly Commission Log**: Track employee commissions
2. **Commission Percentage**: Set per employee or role
3. **Sales Targets**: Define monthly targets

### Buyback Configuration
1. **Buyback Items**: Define eligible items
2. **Buyback Rates**: Set depreciation rates
3. **Scrap Warehouse**: Configure disposal location

## 📊 Features Setup

### 1. EMI Sales
- Enable EMI schedule on Sales Invoice
- Configure EMI duration and interest rates
- Set up payment schedules

### 2. Commission Tracking
- Create Monthly Commission Logs
- Configure commission percentages
- Set up sales targets

### 3. Buyback Management
- Define buyback eligible items
- Set buyback rates and conditions
- Configure scrap disposal

### 4. Debit Note Management
- Track supplier debit notes
- Automate journal entries
- Monitor payment status

## 🔒 Security Configuration

### User Permissions
```python
# Example permission setup
{
    "Sales User": [
        "Sales Invoice",
        "Customer",
        "Item"
    ],
    "Finance User": [
        "Payment Entry",
        "Journal Entry",
        "Finance Invoice"
    ],
    "Manager": [
        "E Mart Settings",
        "Monthly Commission Log",
        "All DocTypes"
    ]
}
```

### API Security
- Enable rate limiting
- Configure API keys
- Set up authentication

## 📱 Mobile App Setup

### API Endpoints
The app provides REST API endpoints for mobile integration:
- `/api/method/e_mart.api.get_sales_summary`
- `/api/method/e_mart.api.get_emi_schedule`
- `/api/method/e_mart.mobile.get_mobile_dashboard`

### Mobile Configuration
1. Configure API authentication
2. Set up push notifications
3. Enable offline sync

## 🧪 Testing

### Run Tests
```bash
# Run all tests
bench --site your-site.com run-tests --app e_mart

# Run specific test
bench --site your-site.com run-tests --app e_mart --doctype "E-mart Settings"
```

### Test Data Setup
```python
# Create test data
bench --site your-site.com console

# In console:
from e_mart.setup import create_test_data
create_test_data()
```

## 🔄 Migration

### From Previous Version
```bash
# Backup current data
bench --site your-site.com backup

# Update app
bench update --app e_mart

# Run migrations
bench --site your-site.com migrate
```

### Data Migration Scripts
```python
# Custom migration scripts available in:
e_mart/migrations/
```

## 📈 Performance Optimization

### Database Optimization
```bash
# Optimize tables
bench --site your-site.com optimize-tables

# Clean old logs
bench --site your-site.com cleanup-logs
```

### Cache Configuration
```python
# Configure Redis cache
{
    "cache_timeout": 3600,
    "session_timeout": 86400
}
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Installation Errors
```bash
# Clear cache
bench clear-cache

# Reinstall app
bench uninstall-app e_mart
bench install-app e_mart
```

#### 2. Permission Errors
```bash
# Reset permissions
bench --site your-site.com reset-permissions
```

#### 3. Database Issues
```bash
# Check database
bench --site your-site.com doctor

# Repair database
bench --site your-site.com repair
```

### Log Files
- **Application Logs**: `logs/frappe.log`
- **Error Logs**: `logs/error.log`
- **Bench Logs**: `logs/bench.log`

## 📞 Support

### Documentation
- **User Guide**: `/docs/user-guide.md`
- **Developer Guide**: `/docs/developer-guide.md`
- **API Documentation**: `/docs/api.md`

### Community Support
- **GitHub Issues**: [Report Issues](https://github.com/your-repo/e_mart/issues)
- **Forum**: [Community Forum](https://discuss.frappe.io)
- **Email**: support@emart.com

### Professional Support
- **Enterprise Support**: Available for enterprise customers
- **Custom Development**: Custom features and integrations
- **Training**: On-site and online training available

## 🔄 Updates

### Regular Updates
```bash
# Check for updates
bench update --app e_mart

# Update dependencies
bench update --requirements
```

### Version Compatibility
- **ERPNext v15**: Fully compatible
- **Frappe v15**: Fully compatible
- **Python 3.10+**: Required

## 📄 License

This app is licensed under the MIT License. See `license.txt` for details.

---

**E Mart App** - Empowering Retail Excellence 