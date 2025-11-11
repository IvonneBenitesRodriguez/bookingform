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

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
