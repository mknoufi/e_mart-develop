# Automatic Series Management - E Mart App

## 🎯 Overview

The E Mart app includes a comprehensive automatic series management system that generates different series numbers for normal and special purchase schemes. This system ensures proper tracking, organization, and identification of different types of purchases.

## 🏗️ System Architecture

### **Core Components**

1. **Series Manager** (`series_manager.py`)
   - Handles series generation logic
   - Manages different formats and prefixes
   - Provides API endpoints

2. **Purchase Series Mapping** (DocType)
   - Configures series for different purchase categories
   - Stores series prefixes, formats, and current numbers

3. **Special Purchase Scheme** (DocType)
   - Manages special purchase schemes
   - Defines discounts and terms

4. **Custom Fields**
   - Added to Purchase Invoice and Purchase Order
   - Enables series tracking and category identification

## 📋 Features

### **1. Dual Series System**
- **Normal Purchases**: Standard series for regular purchases
- **Special Purchases**: Separate series for special schemes and promotions

### **2. Flexible Series Formats**
- `YYYYMMDD-####`: Date-based with sequential number
- `YYYY-####`: Year-based with sequential number
- `MM-####`: Month-based with sequential number
- `####`: Simple sequential number
- `Custom`: Extended format for special requirements

### **3. Automatic Series Generation**
- Generates series numbers on document submission
- Updates current series numbers automatically
- Prevents duplicate series numbers

### **4. Special Purchase Schemes**
- Define special schemes with discounts
- Apply item-specific and supplier-specific discounts
- Track scheme validity periods

## 🔧 Setup Instructions

### **Step 1: Configure Series Mapping**

1. Go to **E Mart > Purchase Series Mapping**
2. Create entries for both categories:

#### **Normal Purchase Series**
```
Purchase Category: Normal
Series Prefix: NORM
Series Start Number: 1
Series Format: YYYYMMDD-####
Description: Normal purchase series
```

#### **Special Purchase Series**
```
Purchase Category: Special
Series Prefix: SPEC
Series Start Number: 1
Series Format: YYYYMMDD-####
Description: Special purchase scheme series
```

### **Step 2: Create Special Purchase Schemes**

1. Go to **E Mart > Special Purchase Scheme**
2. Create schemes with details:

```
Scheme Name: Summer Electronics Sale
Scheme Code: SUMMER2025
Valid From: 2025-06-01
Valid To: 2025-08-31
Discount Type: Percentage
Discount Percentage: 15
Minimum Purchase Amount: 1000
```

### **Step 3: Configure Purchase Documents**

The system automatically adds custom fields to:
- Purchase Invoice
- Purchase Order
- Purchase Receipt

## 🚀 Usage Guide

### **Creating Normal Purchase**

1. **Create Purchase Invoice**
2. **Purchase Category**: Automatically set to "Normal"
3. **Generate Series**: Click "Generate Series" button
4. **Series Number**: Auto-generated (e.g., `NORM-20250630-0001`)

### **Creating Special Purchase**

1. **Create Purchase Invoice**
2. **Is Special Purchase**: Check this box
3. **Purchase Category**: Automatically set to "Special"
4. **Special Scheme**: Select applicable scheme
5. **Generate Series**: Click "Generate Series" button
6. **Series Number**: Auto-generated (e.g., `SPEC-20250630-0001`)

### **Series Management Buttons**

#### **Generate Series**
- Generates next series number for current category
- Updates current series number automatically
- Shows success message with generated number

#### **Reset Series**
- Resets series number for selected category
- Prompts for new start number
- Useful for new financial years or periods

#### **Series Info**
- Shows current series information
- Displays prefix, current number, format
- Shows next series number preview

## 📊 Series Examples

### **Normal Purchase Series**
```
Format: YYYYMMDD-####
Prefix: NORM
Examples:
- NORM-20250630-0001
- NORM-20250630-0002
- NORM-20250701-0001
```

### **Special Purchase Series**
```
Format: YYYYMMDD-####
Prefix: SPEC
Examples:
- SPEC-20250630-0001
- SPEC-20250630-0002
- SPEC-20250701-0001
```

### **Different Formats**
```
YYYY-####: NORM-2025-0001
MM-####: NORM-06-0001
####: NORM-0001
Custom: NORM-000001
```

## 🔌 API Endpoints

### **Get Next Series**
```python
GET /api/method/e_mart.series_manager.get_next_series
Parameters:
- purchase_category: "Normal" or "Special"
- doctype: Document type (default: "Purchase Invoice")

Response:
{
    "status": "success",
    "series_number": "NORM-20250630-0001",
    "purchase_category": "Normal"
}
```

### **Reset Series**
```python
GET /api/method/e_mart.series_manager.reset_series
Parameters:
- purchase_category: "Normal" or "Special"
- new_start_number: New starting number

Response:
{
    "status": "success",
    "message": "Series reset for Normal"
}
```

### **Get Series Info**
```python
GET /api/method/e_mart.series_manager.get_series_info
Parameters:
- purchase_category: "Normal" or "Special"

Response:
{
    "status": "success",
    "data": {
        "prefix": "NORM",
        "current_number": 5,
        "format": "YYYYMMDD-####",
        "next_series": "NORM-20250630-0006"
    }
}
```

## 🎨 JavaScript Integration

### **Form Events**
```javascript
// Generate series number
generate_series_number(frm);

// Reset series number
reset_series_number(frm);

// Get series information
get_series_info(frm);
```

### **Custom Buttons**
- **Generate Series**: Creates next series number
- **Reset Series**: Resets series for category
- **Series Info**: Shows current series details

## 🔒 Security Features

### **Validation**
- Ensures series numbers are generated before submission
- Prevents duplicate series numbers
- Validates purchase category selection

### **Permissions**
- Series management restricted to authorized users
- Purchase Manager and System Manager roles
- Audit trail for series changes

## 📈 Business Benefits

### **1. Better Organization**
- Clear separation between normal and special purchases
- Easy identification of purchase types
- Improved tracking and reporting

### **2. Automated Workflow**
- No manual series number entry
- Automatic category detection
- Reduced human errors

### **3. Special Scheme Management**
- Centralized scheme configuration
- Automatic discount application
- Scheme validity tracking

### **4. Reporting and Analytics**
- Separate reporting for normal vs special purchases
- Scheme performance tracking
- Series number analytics

## 🛠️ Troubleshooting

### **Common Issues**

#### **1. Series Not Generated**
- Check if Purchase Series Mapping exists
- Verify purchase category is set
- Ensure user has proper permissions

#### **2. Duplicate Series Numbers**
- Check current series number in mapping
- Reset series if needed
- Verify no concurrent access issues

#### **3. Special Scheme Not Applied**
- Check scheme validity dates
- Verify supplier is in applicable suppliers list
- Ensure minimum purchase amount is met

### **Debug Commands**
```python
# Check series mapping
frappe.get_all("Purchase Series Mapping", filters={"purchase_category": "Normal"})

# Get series info
from e_mart.series_manager import SeriesManager
SeriesManager.get_series_info("Normal")

# Reset series
SeriesManager.reset_series("Normal", 1)
```

## 🔄 Maintenance

### **Regular Tasks**
1. **Monitor Series Numbers**: Check for gaps or duplicates
2. **Reset Series**: Reset at financial year end
3. **Update Schemes**: Maintain special purchase schemes
4. **Backup Data**: Regular backup of series mappings

### **Performance Optimization**
- Series numbers cached for better performance
- Batch processing for bulk operations
- Database indexing on series fields

## 📚 Related Documentation

- [Installation Guide](INSTALLATION.md)
- [API Documentation](api.md)
- [Security Guide](security.py)
- [Performance Guide](performance.py)

---

**E Mart Series Management** - Streamlining Purchase Tracking and Organization 