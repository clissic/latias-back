# GitHub Actions Workflows

Este directorio contiene los workflows de CI/CD para el proyecto Latias.

## Workflows Disponibles

### 1. Frontend CI (`frontend-ci.yml`)
- **Trigger**: Push/PR en ramas `master` o `develop` que afecten `latias-front/`
- **Acciones**:
  - Instala dependencias
  - Ejecuta el linter
  - Construye el proyecto
  - Verifica que el build sea exitoso

### 2. Backend CI (`backend-ci.yml`)
- **Trigger**: Push/PR en ramas `master` o `develop` que afecten `latias-back/`
- **Acciones**:
  - Instala dependencias
  - Verifica la sintaxis del código
  - Valida que las dependencias estén instaladas correctamente

### 3. Full CI (`full-ci.yml`)
- **Trigger**: Push/PR en ramas `master` o `develop` (cualquier cambio)
- **Acciones**:
  - Ejecuta ambos workflows (Frontend y Backend) en paralelo
  - Sube artefactos del build del frontend

## Scripts Multiplataforma

### Frontend (`latias-front/package.json`)
- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye el proyecto (solo build)
- `npm run build:copy` - Construye y copia a `latias-back/public` (multiplataforma)
- `npm run lint` - Ejecuta el linter
- `npm run lint:fix` - Ejecuta el linter y corrige errores automáticamente
- `npm run preview` - Previsualiza el build de producción

### Backend (`latias-back/package.json`)
- `npm start` - Inicia el servidor en modo producción
- `npm run dev` - Inicia el servidor en modo desarrollo con nodemon
- `npm test` - Ejecuta tests (placeholder)
- `npm run lint` - Ejecuta el linter (placeholder)

## Notas

- Los workflows usan Node.js 20.x
- El script `copy-dist.js` es multiplataforma y reemplaza el comando `xcopy` de Windows
- Los workflows se ejecutan automáticamente en push/PR a las ramas `master` y `develop`

