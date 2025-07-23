#!/bin/bash

# E Mart App - GitHub Setup Script
echo "🏪 E Mart App - GitHub Setup"
echo "============================"

# Check if remote is configured
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ No remote origin configured"
    echo "Please run: git remote add origin https://github.com/YOUR_USERNAME/e_mart-develop.git"
    echo "Replace YOUR_USERNAME with your actual GitHub username"
    exit 1
fi

# Get current remote URL
REMOTE_URL=$(git remote get-url origin)
echo "✅ Remote origin: $REMOTE_URL"

# Check if we can connect to GitHub
echo "🔍 Testing GitHub connection..."
if curl -s "https://api.github.com" > /dev/null; then
    echo "✅ GitHub API accessible"
else
    echo "❌ Cannot access GitHub API"
    echo "Please check your internet connection"
    exit 1
fi

# Push to main branch
echo "📤 Pushing to main branch..."
if git push -u origin main; then
    echo "✅ Successfully pushed to main branch"
else
    echo "❌ Failed to push to main branch"
    echo "Please check your GitHub credentials"
    exit 1
fi

# Create and push develop branch
echo "🌿 Creating develop branch..."
git checkout -b develop
if git push -u origin develop; then
    echo "✅ Successfully pushed develop branch"
else
    echo "❌ Failed to push develop branch"
fi

# Switch back to main
git checkout main

echo ""
echo "🎉 GitHub Setup Complete!"
echo "========================="
echo "Repository: $REMOTE_URL"
echo "Main branch: ✅ Pushed"
echo "Develop branch: ✅ Pushed"
echo ""
echo "Next steps:"
echo "1. Visit your GitHub repository"
echo "2. Check that GitHub Actions are running"
echo "3. Review the CI/CD pipeline"
echo "4. Set up branch protection rules"
echo ""
echo "Your E Mart app is now live on GitHub! 🚀" 