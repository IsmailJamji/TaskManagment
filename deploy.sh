#!/bin/bash

echo "🚀 TaskForge Deployment Script"
echo "================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git not initialized. Please run: git init"
    exit 1
fi

# Check if files are committed
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Committing changes..."
    git add .
    git commit -m "Deploy TaskForge to production"
fi

echo "✅ Ready for deployment!"
echo ""
echo "📋 Next steps:"
echo "1. Push to GitHub: git push origin main"
echo "2. Follow DEPLOYMENT_GUIDE.md for cloud setup"
echo "3. Your app will be available at: https://your-app.vercel.app"
echo ""
echo "🔑 Default login: admin@taskforge.com / admin123"
