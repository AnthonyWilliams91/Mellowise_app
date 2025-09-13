# Coding Standards and Development Practices

## TypeScript and JavaScript Standards
```typescript
// .eslintrc.js - Context7-verified ESLint configuration
module.exports = {
  extends: [
    'next/core-web-vitals',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json'
  },
  plugins: ['@typescript-eslint', 'jsx-a11y', 'import'],
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/prefer-const': 'error',
    
    // Import organization
    'import/order': ['error', {
      'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always',
      'alphabetize': { order: 'asc' }
    }],
    
    // Accessibility rules
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
    'jsx-a11y/role-has-required-aria-props': 'error',
    'jsx-a11y/role-supports-aria-props': 'error',
    
    // Performance and best practices
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-key': 'error',
    'react/no-array-index-key': 'warn',
    'react/self-closing-comp': 'error'
  }
}
```

## Python Code Standards
```python
# pyproject.toml - Context7-verified Python configuration
[tool.ruff]
target-version = "py311"
line-length = 88
select = [
    "E",  # pycodestyle errors
    "W",  # pycodestyle warnings
    "F",  # Pyflakes
    "I",  # isort
    "B",  # flake8-bugbear
    "C4", # flake8-comprehensions
    "UP", # pyupgrade
    "ARG", # flake8-unused-arguments
    "SIM", # flake8-simplify
    "TCH", # flake8-type-checking
]
ignore = [
    "E501",  # Line too long (handled by formatter)
    "B008",  # Do not perform function calls in argument defaults
    "ARG001", # Unused function argument (common in FastAPI)
]

[tool.ruff.per-file-ignores]
"__init__.py" = ["F401"]
"tests/**/*" = ["ARG001", "SIM117"]

[tool.mypy]
python_version = "3.11"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
disallow_incomplete_defs = true
check_untyped_defs = true
disallow_untyped_decorators = true
no_implicit_optional = true
warn_redundant_casts = true
warn_unused_ignores = true
warn_no_return = true
warn_unreachable = true
strict_equality = true

[tool.black]
line-length = 88
target-version = ['py311']
include = '\.pyi?$'
```

## File Naming Conventions
```
Mellowise Naming Conventions:

Frontend (Next.js/React):
- Components: PascalCase (e.g., `GameInterface.tsx`)
- Pages: kebab-case (e.g., `survival-mode.tsx`)
- Hooks: camelCase with use prefix (e.g., `useGameState.ts`)
- Utils: camelCase (e.g., `formatTime.ts`)
- Constants: SCREAMING_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)
- Types: PascalCase with Type suffix (e.g., `UserType.ts`)

Backend (FastAPI/Python):
- Modules: snake_case (e.g., `game_logic.py`)
- Classes: PascalCase (e.g., `GameSession`)
- Functions: snake_case (e.g., `generate_question`)
- Constants: SCREAMING_SNAKE_CASE (e.g., `MAX_LIVES`)
- Database models: PascalCase (e.g., `User`, `Question`)

Directories:
- Frontend: kebab-case (e.g., `game-components/`)
- Backend: snake_case (e.g., `game_logic/`)
- Shared: kebab-case (e.g., `shared-types/`)
```

## Documentation Requirements
```typescript
// Component documentation template
/**
 * GameInterface - Main survival mode game component
 * 
 * Renders the interactive LSAT question game with lives, scoring,
 * and real-time feedback. Integrates with Zustand for state management
 * and provides accessibility features for screen readers.
 * 
 * @param sessionId - Unique identifier for the current game session
 * @param onGameEnd - Callback fired when the game ends (win/lose)
 * @param difficulty - Initial difficulty level (1-10)
 * 
 * @example
 * ```tsx
 * <GameInterface 
 *   sessionId="123e4567-e89b-12d3-a456-426614174000"
 *   onGameEnd={(result) => console.log('Game ended:', result)}
 *   difficulty={5}
 * />
 * ```
 * 
 * @accessibility
 * - Supports keyboard navigation via Tab/Enter/Space
 * - Screen reader announcements for score/lives changes
 * - High contrast mode compatible
 * - Focus management for modal states
 * 
 * @performance
 * - Lazy loads question content
 * - Debounces user input
 * - Uses React.memo for render optimization
 */
```