# CI/CD Security Pipeline Documentation

Este directorio contiene los workflows de GitHub Actions para análisis de seguridad y calidad de código del proyecto Casa Yllika Hotel Booking Form.

## 📋 Workflows Configurados

### 1. CI/CD Security & Quality Checks (`ci-security.yml`)

**Trigger:** Push y Pull Requests a `main` y `development`

**Componentes:**

#### Frontend Security & Quality
- ✅ **ESLint Analysis** - Análisis estático de código con reglas de seguridad
- ✅ **npm audit** - Detección de vulnerabilidades en dependencias
- ✅ **Build Test** - Verifica que la aplicación compile correctamente
- ✅ **Unit Tests** - Ejecuta tests con cobertura de código
- ✅ **Dependency Check** - Verifica dependencias desactualizadas

#### Backend Security
- ✅ **Brakeman** - Scanner de seguridad para Rails
- ✅ **Bundle Audit** - Detección de vulnerabilidades en gems de Ruby

#### Dependency Review
- ✅ **GitHub Dependency Review** - Analiza cambios en dependencias
- ✅ **License Compliance** - Verifica licencias permitidas

### 2. CodeQL Security Analysis (`codeql-analysis.yml`)

**Trigger:**
- Push y Pull Requests a `main` y `development`
- Scheduled: Lunes a las 6:00 AM UTC

**Características:**
- 🔍 Análisis profundo de seguridad con CodeQL
- 📊 Detecta vulnerabilidades en JavaScript y Ruby
- 🛡️ Queries de seguridad extendidas
- 📈 Integración con GitHub Security tab

## 🚀 Cómo Funciona

### Flujo de Trabajo

```
1. Push/PR → GitHub
2. GitHub Actions ejecuta workflows
3. ┌─ Frontend Analysis
   │  ├─ ESLint Security Checks
   │  ├─ npm audit
   │  ├─ Build
   │  └─ Tests
   └─ Backend Analysis
      ├─ Brakeman
      └─ Bundle Audit
4. CodeQL Analysis (paralelo)
5. Resultados → GitHub Security Tab
6. ✅ Pass → Merge permitido
   ❌ Fail → Bloquea merge
```

## 📊 Niveles de Severidad

| Nivel | Acción | Descripción |
|-------|--------|-------------|
| **Critical** | ❌ BLOCK | Bloquea el merge inmediatamente |
| **High** | ⚠️ WARN | Requiere revisión antes de merge |
| **Moderate** | ℹ️ INFO | Se reporta pero no bloquea |
| **Low** | 📝 LOG | Solo se registra |

## 🔧 Configuración Local

### Ejecutar checks antes de push:

```bash
# Frontend
cd frontend
npm run lint              # ESLint analysis
npm audit                 # Security audit
npm test                  # Run tests
npm run build            # Build check

# Backend
cd backend
gem install brakeman
brakeman -q              # Security scan
bundle audit check       # Gem vulnerabilities
```

## 🛡️ Reglas de Seguridad ESLint

El pipeline ejecuta las siguientes verificaciones de seguridad:

- `security/detect-object-injection` - Inyección de objetos
- `security/detect-unsafe-regex` - RegEx peligrosas (ReDoS)
- `security/detect-eval-with-expression` - Uso de eval()
- `security/detect-possible-timing-attacks` - Timing attacks
- `no-eval`, `no-implied-eval` - Código dinámico
- `eqeqeq` - Comparaciones estrictas

## 📈 Monitoreo

### GitHub Security Tab
- Ve a: `Repository → Security → Code scanning alerts`
- Revisa alertas de CodeQL y Dependabot

### GitHub Actions Tab
- Ve a: `Repository → Actions`
- Monitorea ejecuciones del pipeline
- Revisa logs de cada job

## 🔄 Actualización de Dependencias

El pipeline te notificará cuando haya:
- Vulnerabilidades en dependencias
- Dependencias desactualizadas
- Cambios de licencia

Para actualizar:

```bash
# Frontend
cd frontend
npm audit fix              # Fix automático
npm audit fix --force      # Fix con breaking changes
npm update                 # Actualizar a latest

# Backend
cd backend
bundle update              # Actualizar gems
```

## 🚨 Troubleshooting

### Si el pipeline falla:

1. **ESLint Errors:**
   ```bash
   npm run lint:fix  # Auto-fix
   ```

2. **npm audit Issues:**
   ```bash
   npm audit fix
   ```

3. **Build Failures:**
   - Revisa logs en GitHub Actions
   - Prueba build local: `npm run build`

4. **Test Failures:**
   - Ejecuta tests local: `npm test`
   - Revisa cobertura de código

## 🎯 Best Practices

1. ✅ **Siempre ejecuta lint localmente** antes de push
2. ✅ **Revisa npm audit** regularmente
3. ✅ **Mantén dependencias actualizadas**
4. ✅ **No ignores warnings de seguridad**
5. ✅ **Revisa CodeQL alerts** semanalmente

## 📚 Recursos

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [CodeQL Documentation](https://codeql.github.com/docs/)
- [ESLint Security Plugin](https://github.com/eslint-community/eslint-plugin-security)
- [Brakeman Scanner](https://brakemanscanner.org/)
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)

---

**Mantenido por:** Equipo de Desarrollo Casa Yllika
**Última actualización:** 2025-11-11
