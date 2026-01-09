# Contributing to Habit Pulse

## 🧪 Testing Before Committing

**IMPORTANT: Always test your changes before committing to prevent deployment failures.**

### Quick Test (Required Before Every Commit)

Before committing any changes, run these checks:

```bash
# 1. Test frontend build (catches TypeScript errors, unused imports, etc.)
cd frontend
npm run build

# 2. Test backend build (catches C# compilation errors)
cd ../src/HabitPulse.Api
dotnet build
```

### What These Tests Catch

- ✅ TypeScript errors (unused imports, type errors, syntax issues)
- ✅ Build failures
- ✅ Missing dependencies
- ✅ Compilation errors

### Full Docker Test (Optional, but Recommended Before Pushing to Main)

To test exactly what production does:

```bash
# From project root
docker compose build --no-cache
```

This will catch Docker-specific issues that might not appear in local builds.

## 📝 Development Workflow

1. **Make your changes**
2. **Test locally** (run the quick test above)
3. **If tests pass** → commit and push
4. **If tests fail** → fix issues and test again

## 🚀 CI/CD Pipeline

- **CI checks run automatically** on every push to `main`
- **Deployment happens automatically** if CI passes
- **Never push broken code** - it will fail in production

## 🐛 Common Issues

### TypeScript: "Unused import" error
- Remove unused imports before committing
- Example: `import { motion, AnimatePresence }` → remove `AnimatePresence` if not used

### Build fails in Docker but works locally
- Check for environment-specific issues
- Ensure all dependencies are in `package.json` or `.csproj`
- Test with `docker compose build` locally

## 💡 Tips for AI Assistants

When making code changes:
1. Always run `npm run build` in `frontend/` before committing
2. Check for unused imports/variables
3. Ensure TypeScript compiles without errors
4. Test Docker builds if making infrastructure changes
