# Customer Loyalty Program - Feature Documentation

## Overview

The Customer Loyalty Program is a comprehensive feature added to the E Mart app that allows electronics stores to implement and manage customer loyalty programs. This feature helps businesses increase customer retention, encourage repeat purchases, and reward loyal customers with a points-based system.

## Features

### 🎯 Core Features

1. **Flexible Program Types**
   - Single Tier Program: Fixed conversion rate for all customers
   - Multiple Tier Program: Progressive rewards based on spending thresholds

2. **Automatic Points Calculation**
   - Points awarded automatically on Sales Invoice submission
   - Configurable minimum spending thresholds
   - Tier-based multipliers for enhanced rewards

3. **Points Management**
   - Real-time points tracking
   - Points expiration system (1 year default)
   - Redemption tracking with transaction history

4. **Mobile App Integration**
   - Customer loyalty dashboard
   - Points redemption interface
   - Transaction history viewing
   - Tier progress tracking

5. **API Endpoints**
   - RESTful APIs for mobile app integration
   - Customer loyalty summary
   - Points redemption functionality
   - Transaction history retrieval

## Technical Implementation

### Database Schema

#### Customer Loyalty Program Doctype
- **Fields**: Program name, type, conversion factors, tier thresholds, customer group targeting
- **Validation**: Tier hierarchy, default program constraints
- **Permissions**: Sales Manager (full), Sales User (read)

#### Loyalty Points Transaction Doctype
- **Fields**: Customer, points, transaction type, dates, references
- **Validation**: Points amount, expiry dates, customer verification
- **Workflow**: Submittable document with proper state management

### Integration Points

#### Sales Invoice Integration
- Automatic points calculation on invoice submission
- Tier-based point multipliers
- Error handling without disrupting invoice workflow
- Customer notification of points earned

#### API Integration
- 6 new API endpoints for mobile app
- Customer loyalty summary with tier information
- Points redemption with validation
- Transaction history with pagination

### Code Structure

```
e_mart/e_mart/doctype/
├── customer_loyalty_program/
│   ├── customer_loyalty_program.py      # Core business logic
│   ├── customer_loyalty_program.json    # Doctype definition
│   └── test_customer_loyalty_program.py # Unit tests
└── loyalty_points_transaction/
    ├── loyalty_points_transaction.py     # Transaction handling
    ├── loyalty_points_transaction.json   # Doctype definition
    └── test_loyalty_points_transaction.py # Unit tests

e_mart/
├── api.py                               # Updated with loyalty APIs
└── e_mart/custom_scripts/sales_invoice/
    └── sales_invoice.py                 # Updated with loyalty integration

mobile-app/src/screens/loyalty/
├── LoyaltyPointsScreen.js              # Main loyalty dashboard
└── RedeemPointsScreen.js               # Points redemption interface
```

## Configuration Guide

### Step 1: Create Loyalty Program

1. Navigate to **E Mart > Customer Loyalty Program**
2. Click **New** to create a new program
3. Configure the following:
   - **Program Name**: Descriptive name for the program
   - **Program Type**: Choose Single Tier or Multiple Tier
   - **Conversion Factor**: Points earned per rupee spent
   - **Minimum Spent Amount**: Minimum invoice amount to earn points
   - **Customer Group**: Target specific customer groups (optional)
   - **Validity Dates**: Program duration (optional)

### Step 2: Configure Tier Settings (Multiple Tier Only)

For Multiple Tier Programs, set up tier thresholds:
- **Tier 1 (Silver)**: Threshold amount and multiplier
- **Tier 2 (Gold)**: Higher threshold and better multiplier
- **Tier 3 (Premium)**: Highest threshold and best multiplier

### Step 3: Set Default Program

- Mark one program as **Is Default** to apply to all customers
- Override for specific customer groups using targeted programs

### Step 4: Account Configuration

Configure accounting settings in E-mart Settings:
- **Expense Account**: For loyalty program costs
- **Cost Center**: For proper cost allocation

## User Guide

### For Store Staff

#### Viewing Customer Loyalty Points
1. Open Sales Invoice for a customer
2. Loyalty points are automatically calculated and displayed
3. Points are awarded upon invoice submission

#### Managing Loyalty Programs
1. Access **Customer Loyalty Program** list
2. Create, edit, or deactivate programs as needed
3. Monitor program performance through reports

### For Customers (Mobile App)

#### Viewing Points Balance
1. Open the E Mart mobile app
2. Navigate to **Loyalty Points** section
3. View current points balance and tier status

#### Redeeming Points
1. From loyalty dashboard, tap **Redeem**
2. Enter desired points amount
3. Add optional remarks
4. Confirm redemption

#### Tracking History
1. View recent transactions on dashboard
2. Tap **View All** for complete history
3. Filter by transaction type or date

## API Reference

### Customer Loyalty Summary
```http
GET /api/method/e_mart.api.get_customer_loyalty_summary
Parameters: customer (string)
Response: Current points, tier info, recent transactions
```

### Redeem Points
```http
POST /api/method/e_mart.api.redeem_loyalty_points
Parameters: customer, points_to_redeem, remarks (optional)
Response: Transaction confirmation and remaining points
```

### Points Preview
```http
GET /api/method/e_mart.api.calculate_loyalty_points_preview
Parameters: customer, invoice_amount
Response: Projected points and tier information
```

## Business Benefits

### For Store Owners

1. **Increased Customer Retention**
   - Reward loyal customers with points
   - Encourage repeat purchases
   - Build long-term customer relationships

2. **Enhanced Customer Data**
   - Track customer spending patterns
   - Identify high-value customers
   - Segment customers by tier status

3. **Flexible Reward Structure**
   - Configure multiple program types
   - Adjust rewards based on business needs
   - Target specific customer groups

### For Customers

1. **Tangible Rewards**
   - Earn points on every purchase
   - Progress through loyalty tiers
   - Redeem points for benefits

2. **Transparent System**
   - Real-time points tracking
   - Clear tier progression
   - Transaction history visibility

3. **Mobile Convenience**
   - Check points anytime
   - Easy redemption process
   - Progress notifications

## Testing Guide

### Unit Tests

Run the comprehensive test suite:
```bash
cd e_mart-develop
python e_mart/run_tests.py
```

Tests cover:
- Program creation and validation
- Points calculation logic
- Tier progression
- Transaction recording
- API endpoints

### Manual Testing Scenarios

1. **Program Configuration**
   - Create single and multiple tier programs
   - Test validation rules
   - Verify default program behavior

2. **Points Earning**
   - Submit sales invoices for different amounts
   - Verify correct points calculation
   - Test tier progression

3. **Points Redemption**
   - Redeem various point amounts
   - Test insufficient points scenario
   - Verify transaction recording

4. **Mobile App Flow**
   - View loyalty dashboard
   - Navigate through screens
   - Test redemption process

## Troubleshooting

### Common Issues

#### Points Not Awarded
- Check if customer has applicable loyalty program
- Verify invoice amount meets minimum threshold
- Ensure loyalty program is active and within validity dates

#### Mobile App Connection Issues
- Verify API endpoints are accessible
- Check authentication credentials
- Confirm network connectivity

#### Tier Calculation Problems
- Review tier threshold configuration
- Check customer's total spent amount
- Verify program type settings

### Support Contacts

For technical issues:
- Check application logs for error details
- Review loyalty program configuration
- Contact system administrator

## Future Enhancements

### Planned Features

1. **Point Transfer**
   - Allow points transfer between customers
   - Family account linking
   - Corporate account management

2. **Reward Catalog**
   - Predefined redemption options
   - Product-specific rewards
   - Discount voucher generation

3. **Advanced Analytics**
   - Loyalty program ROI analysis
   - Customer behavior insights
   - Predictive analytics

4. **Integration Enhancements**
   - Email notifications
   - SMS alerts
   - Social media integration

### Customization Options

The loyalty program is designed to be extensible:
- Custom tier names and benefits
- Integration with third-party services
- Additional redemption channels
- Enhanced reporting capabilities

## Conclusion

The Customer Loyalty Program feature significantly enhances the E Mart app's value proposition for electronics stores. It provides a complete solution for customer retention and engagement while maintaining the system's ease of use and reliability.

This feature demonstrates the E Mart app's capability to grow and adapt to modern retail needs, providing both immediate business value and a foundation for future enhancements.