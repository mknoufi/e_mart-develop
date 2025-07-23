# GitHub Setup Guide - E Mart App

## 🚨 **GitHub Branch Fetching Error Resolution**

### **Error Analysis**
```
Error fetching branch list from GitHub: {
  "message":"Not Found",
  "documentation_url":"https://docs.github.com/rest/branches/branches#list-branches",
  "status":"404"
}
```

**Root Causes:**
1. Repository doesn't exist on GitHub
2. Incorrect repository URL
3. Authentication issues
4. Repository is private without proper access
5. Repository name mismatch

## 🔧 **Solution Steps**

### **Step 1: Create GitHub Repository**

#### **Option A: Using GitHub CLI**
```bash
# Install GitHub CLI if not installed
brew install gh

# Login to GitHub
gh auth login

# Create new repository
gh repo create e_mart-develop --public --description "E Mart - Retail Management App for ERPNext" --source=. --remote=origin --push
```

#### **Option B: Manual GitHub Creation**
1. Go to [GitHub.com](https://github.com)
2. Click **"New repository"**
3. Repository name: `e_mart-develop`
4. Description: `E Mart - Retail Management App for ERPNext`
5. Make it **Public** or **Private**
6. **Don't** initialize with README (we already have one)
7. Click **"Create repository"**

### **Step 2: Add Remote Origin**
```bash
# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/e_mart-develop.git

# Verify remote
git remote -v
```

### **Step 3: Push to GitHub**
```bash
# Push to main branch
git branch -M main
git push -u origin main

# Create development branch
git checkout -b develop
git push -u origin develop
```

### **Step 4: Verify Repository**
```bash
# Check repository status
gh repo view

# List branches
git branch -a
```

## 🔐 **Authentication Setup**

### **Personal Access Token (Recommended)**
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select scopes: `repo`, `workflow`
4. Copy token and use it as password

### **SSH Key Setup**
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add to SSH agent
ssh-add ~/.ssh/id_ed25519

# Copy public key to GitHub
cat ~/.ssh/id_ed25519.pub
# Add this to GitHub Settings → SSH and GPG keys
```

## 📋 **Repository Structure**

### **Current Structure**
```
e_mart-develop/
├── e_mart/                    # Main app directory
│   ├── __init__.py
│   ├── hooks.py              # App configuration
│   ├── setup.py              # Installation script
│   ├── security.py           # Security module
│   ├── performance.py        # Performance optimization
│   ├── analytics.py          # Business intelligence
│   ├── api.py                # REST API endpoints
│   ├── mobile.py             # Mobile app support
│   ├── conftest.py           # Test configuration
│   ├── run_tests.py          # Test runner
│   ├── INSTALLATION.md       # Setup guide
│   └── doctype/              # Custom DocTypes
├── .editorconfig             # Editor configuration
├── .eslintrc                 # JavaScript linting
├── .gitignore                # Git ignore rules
├── .pre-commit-config.yaml   # Pre-commit hooks
├── README.md                 # Project documentation
├── license.txt               # License file
├── pyproject.toml            # Python project config
└── GITHUB_SETUP.md           # This file
```

### **Branch Strategy**
```
main/          # Production-ready code
├── develop/   # Development branch
├── feature/   # Feature branches
└── hotfix/    # Emergency fixes
```

## 🚀 **GitHub Actions Setup**

### **Create Workflow File**
```bash
mkdir -p .github/workflows
```

Create `.github/workflows/ci.yml`:
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.10'
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install frappe-bench
    
    - name: Run tests
      run: |
        python e_mart/run_tests.py
```

## 🔍 **Troubleshooting**

### **Common Issues & Solutions**

#### **1. Repository Not Found (404)**
```bash
# Check if repository exists
gh repo view YOUR_USERNAME/e_mart-develop

# Verify remote URL
git remote -v

# Re-add remote if needed
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/e_mart-develop.git
```

#### **2. Authentication Failed**
```bash
# Check authentication
gh auth status

# Re-authenticate if needed
gh auth login
```

#### **3. Permission Denied**
```bash
# Check repository permissions
gh repo view --json permissions

# Ensure you have write access
# Contact repository owner if needed
```

#### **4. Branch Not Found**
```bash
# List all branches
git branch -a

# Create branch if missing
git checkout -b develop
git push -u origin develop
```

### **Debug Commands**
```bash
# Check Git status
git status

# Check remote configuration
git remote -v

# Check authentication
gh auth status

# Test GitHub API
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user

# Check repository access
gh repo view YOUR_USERNAME/e_mart-develop
```

## 📊 **Repository Metrics**

### **Setup Repository Insights**
1. Go to repository Settings → Insights
2. Enable:
   - **Issues**
   - **Pull requests**
   - **Discussions**
   - **Wiki** (optional)

### **Add Repository Topics**
```
erpnext, frappe, retail, ecommerce, inventory, sales, commission, emi, buyback
```

## 🔄 **Continuous Integration**

### **Pre-commit Hooks**
```bash
# Install pre-commit hooks
pip install pre-commit
pre-commit install

# Run manually
pre-commit run --all-files
```

### **Code Quality Checks**
```bash
# Run linting
python -m ruff check e_mart/

# Run tests
python e_mart/run_tests.py

# Check security
bandit -r e_mart/
```

## 📈 **Repository Management**

### **Issue Templates**
Create `.github/ISSUE_TEMPLATE/bug_report.md`:
```markdown
---
name: Bug report
about: Create a report to help us improve
title: ''
labels: bug
assignees: ''

---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. macOS]
 - Python: [e.g. 3.10]
 - ERPNext: [e.g. v15]
 - E Mart App: [e.g. v0.0.1]
```

### **Pull Request Template**
Create `.github/pull_request_template.md`:
```markdown
## Description
Brief description of changes

## Type of change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
```

## 🎯 **Next Steps**

### **After Repository Setup**
1. **Create Issues**: Document known issues and feature requests
2. **Setup Branch Protection**: Protect main branch
3. **Add Collaborators**: Invite team members
4. **Setup Notifications**: Configure alerts
5. **Documentation**: Update README with setup instructions

### **Repository Maintenance**
1. **Regular Updates**: Keep dependencies updated
2. **Security Scanning**: Enable Dependabot alerts
3. **Code Reviews**: Require PR reviews
4. **Automated Testing**: Ensure CI/CD pipeline works
5. **Backup Strategy**: Regular repository backups

---

## 📞 **Support**

If you continue to experience issues:

1. **Check GitHub Status**: [status.github.com](https://status.github.com)
2. **GitHub Support**: [support.github.com](https://support.github.com)
3. **Community Help**: [GitHub Community](https://github.community/)

**Repository URL**: `https://github.com/YOUR_USERNAME/e_mart-develop`

---

**E Mart App** - Ready for GitHub! 🚀 