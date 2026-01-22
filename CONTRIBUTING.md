# Contributing to Voice Farming Assistant

Welcome! We're excited that you want to contribute to bringing agricultural intelligence to Indian farmers. This guide will help you get started.

## Code of Conduct

Be respectful, inclusive, and helpful to all contributors. We're building a tool for farmers - let's maintain that spirit in our community.

## Getting Started

### 1. Fork and Clone
```bash
git clone https://github.com/YOUR_USERNAME/voice-farming-assistant.git
cd voice-farming-assistant
git remote add upstream https://github.com/IkigaiAndra/voice-farming-assistant.git
```

### 2. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### 3. Setup Development Environment
```bash
npm install
cp .env.example .env
# Update .env with your values
```

### 4. Make Your Changes
- Write clean, readable code
- Add comments for complex logic
- Follow existing code style
- Add tests for new features

### 5. Test Your Changes
```bash
npm run test
npm run test:lex
npm run test:integration
npm run lint
```

### 6. Commit and Push
```bash
git add .
git commit -m "feat: description of your change"
git push origin feature/your-feature-name
```

### 7. Create Pull Request
- Use clear title and description
- Link related issues
- Provide before/after examples if applicable

## Development Guidelines

### Code Style

- Use ES6+ syntax
- Prefer async/await over callbacks
- Use descriptive variable names
- Add JSDoc comments for functions

```javascript
/**
 * Get crop recommendations
 * @param {string} farmerId - Farmer identifier
 * @param {string} cropType - Type of crop
 * @returns {Promise<Object>} Crop recommendations
 */
async function getCropRecommendations(farmerId, cropType) {
  // Implementation
}
```

### File Organization

```
backend/
├── lambda/
│   └── function-name/
│       ├── index.js          (handler)
│       ├── package.json      (if needed)
│       └── tests/            (unit tests)
├── services/
│   └── service-name.js       (utilities)
└── tests/
    └── integration.test.js   (end-to-end tests)
```

### Error Handling

Always include proper error handling and logging:

```javascript
try {
  const result = await performAction();
  return result;
} catch (error) {
  console.error('Context of error:', error);
  throw new Error(`Failed to perform action: ${error.message}`);
}
```

### Testing

- Write tests for new features
- Update tests when modifying existing code
- Aim for >80% code coverage

```javascript
describe('Feature Name', () => {
  it('should do something', async () => {
    const result = await functionUnderTest(input);
    expect(result).toBe(expected);
  });

  it('should handle errors', async () => {
    expect(() => functionUnderTest(invalidInput)).toThrow();
  });
});
```

## Areas for Contribution

### Bug Fixes
Found a bug? Check issues first, then open a PR with:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Proposed fix

### Features
Want to add a feature? Ideas welcome:
- New crop types
- Additional languages
- Integration with external APIs
- Mobile app components
- ML model improvements
- UI enhancements

### Documentation
Help improve our docs:
- API documentation
- Deployment guides
- Architecture diagrams
- Code examples
- Troubleshooting guides

### Translations
Help us support more languages:
- Translate prompts to new languages
- Add new Lex intents
- Test Polly voice outputs

## Pull Request Process

1. **Update from main**
```bash
git fetch upstream
git rebase upstream/main
```

2. **Push to your fork**
```bash
git push origin feature/your-feature-name
```

3. **Create PR on GitHub**
   - Add descriptive title
   - Reference issues with `#123`
   - Explain what and why
   - Attach screenshots if UI changes

4. **Respond to Review**
   - Address feedback promptly
   - Push additional commits
   - Don't force push after review starts

5. **Merge**
   - Ensure all checks pass
   - Squash commits if requested
   - Delete branch after merge

## Commit Message Convention

```
type(scope): subject

body (optional)

footer (optional)
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

Examples:
```
feat(lex): add soil health intent
fix(bedrock): handle empty response
docs(deployment): update AWS setup steps
```

## Issue Labels

- `bug` - Something isn't working
- `enhancement` - Feature request
- `documentation` - Needs docs
- `good first issue` - Good for beginners
- `help wanted` - Need assistance
- `hacktoberfest` - Hacktoberfest eligible

## Development Workflow Example

### Adding a New Crop Intent

1. **Create intent definition**
```bash
# Edit voice/lex-intents/new-crop.json
```

2. **Add fulfillment logic**
```bash
# Update backend/lambda/lex-fulfillment/index.js
```

3. **Add Bedrock prompts**
```bash
# Add to backend/services/bedrock-prompts.js
```

4. **Write tests**
```bash
# Add tests to backend/tests/lex.test.js
```

5. **Update documentation**
```bash
# Update docs/api.md with new intent
```

6. **Test locally**
```bash
sam local start-api
npm run test
```

7. **Commit and PR**
```bash
git commit -m "feat(lex): add new-crop intent with bedrock integration"
```

## Reporting Security Issues

Do NOT open public issues for security vulnerabilities. Instead:
1. Email security@example.com with details
2. Include steps to reproduce
3. Allow time for patch before disclosure

## Getting Help

- **Discussions**: Use GitHub Discussions for questions
- **Issues**: Open issue for bugs
- **Email**: contact@example.com for other matters
- **Slack**: Join our community Slack

## Resources

- [AWS Documentation](https://docs.aws.amazon.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [AWS SAM Guide](https://docs.aws.amazon.com/serverless-application-model/)
- [Jest Testing](https://jestjs.io/)

## Recognition

Contributors will be recognized in:
- README.md
- Release notes
- GitHub contributors page
- Annual reports

## FAQ

**Q: How long does review take?**
A: Usually 1-2 days. We respond to all PRs within 48 hours.

**Q: Can I work on multiple features?**
A: Yes! But keep PRs focused on single features.

**Q: What if my PR conflicts with main?**
A: Rebase your branch: `git rebase upstream/main`

**Q: How do I test AWS services locally?**
A: Use SAM local: `sam local start-api`

**Q: Can I add external dependencies?**
A: Ask in an issue first. We prefer keeping dependencies minimal.

---

Thank you for contributing! You're helping bring agricultural intelligence to millions of farmers. 🌾
