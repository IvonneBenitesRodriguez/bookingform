# Casa Yllika Hotel Booking Form

[![CI/CD Security](https://github.com/ivonnebenitesrodriguez/bookingform/actions/workflows/ci-security.yml/badge.svg)](https://github.com/ivonnebenitesrodriguez/bookingform/actions/workflows/ci-security.yml)
[![CodeQL](https://github.com/ivonnebenitesrodriguez/bookingform/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/ivonnebenitesrodriguez/bookingform/actions/workflows/codeql-analysis.yml)

A secure and modern hotel booking form application with comprehensive security testing and CI/CD integration.

## 🔒 Security Features

- **ESLint Security Analysis** - Static code analysis with security-focused rules
- **CodeQL Scanning** - Advanced security vulnerability detection
- **Dependency Auditing** - Automated vulnerability scanning for npm packages
- **CI/CD Pipeline** - Automated security checks on every commit
- **Brakeman Scanner** - Rails security analysis (backend)

## 🚀 Tech Stack

### Frontend
- React 18
- React Bootstrap
- ESLint with security plugins

### Backend
- Ruby on Rails
- PostgreSQL

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## 🛡️ Security Commands

### Frontend Security Checks

```bash
cd frontend

# Run ESLint security analysis
npm run lint

# Auto-fix security issues
npm run lint:fix

# Security-focused linting
npm run lint:security

# Audit dependencies for vulnerabilities
npm audit

# Fix vulnerable dependencies
npm audit fix
```

### Run All Security Checks

```bash
# Frontend
cd frontend && npm run lint && npm audit

# Backend
cd backend && bundle audit check
```

## 📋 CI/CD Pipeline

This project uses GitHub Actions for automated security testing. Every push and pull request triggers:

1. **ESLint Security Analysis** - Detects code vulnerabilities
2. **npm audit** - Scans for vulnerable dependencies
3. **Build Tests** - Ensures application builds successfully
4. **Unit Tests** - Runs test suite with coverage
5. **CodeQL Analysis** - Deep security scanning
6. **Backend Security** - Brakeman and bundle-audit

See [.github/workflows/README.md](.github/workflows/README.md) for detailed documentation.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

