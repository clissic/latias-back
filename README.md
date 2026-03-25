# LATIAS Academia

**Descripción:**  
LATIAS Academia es una plataforma de aprendizaje online enfocada en cursos de náutica y supervivencia, entre otros. La aplicación permite a los cadetes acceder a cursos desarrollados por profesionales del mar, utilizando herramientas de inteligencia artificial para la generación de videos y diálogos, evaluaciones profesionales y académicas en conjunto con exámenes finales para la obtención de certificados oficiales, generados automáticamente al completar los cursos. En cuanto a los aspectos técnicos, la plataforma está desarrollada con el stack MERN y utiliza Bootstrap para la interfaz gráfica para mantener un diseño responsive y prolijo.

---

## Características principales

- Gestión de usuarios con roles: Cadetes, Instructores, Administradores y Gestores.  
- Creación y gestión de cursos (CRUD).  
- Utilización de plataformas externas de IA para generar avatares, diálogos y voces de los instructores.  
- Vídeos alojados en **Gumlet** (`gumletAssetId` por lección): el catálogo público no expone el ID; el embed solo se entrega por API autenticada (`lesson-playback`) a cadetes con el curso comprado.  
- Evaluaciones tipo test (banco por módulo): corrección y puntaje **en el servidor** a partir de las respuestas enviadas; límite de **2 intentos** por prueba parcial y por prueba final aplicado también en API; en fichas y listados **públicos** de curso (`courseId`, categoría, dificultad) **no** se expone `isCorrect` en las opciones del banco de preguntas.  
- Generación automática de diplomas en PDF.  
- Pagos con Mercado Pago (con posibilidad de agregar otras pasarelas más adelante) e integración con **wallet** interna para instructores y gestores (saldos pendientes, disponibles, totales y retiros).  
- Panel de administración para gestión de usuarios, cursos y entregables, con historial unificado de pagos y transacciones.  
- Flota de barcos por usuario, certificados por barco y solicitudes a gestor (renovación, preparación, asesoramiento). **Solicitar trámite** desde Mi gestor: solicitud de flota (barco + certificado + tipos de trámite), con descuento de trámites incluidos o pago de 30 USD por Mercado Pago.  

---

## Roadmap de desarrollo

La siguiente lista detalla los **100 pasos** planeados para el desarrollo completo de la plataforma:

✔️ CUMPLIDO (1% cada uno) - 🟡 EN DESARROLLO (0.5% cada uno) - ❌ INCUMPLIDO (0%)

**Progreso del proyecto: 70,5% completado**
- ✔️ Completados: 70 puntos (70%)
- 🟡 En desarrollo: 1 punto (0,5%)
- ❌ Pendientes: 29 puntos (0%)

### Preparación del proyecto (1-10)
✔️ 1. Crear el repositorio en GitHub.  
✔️ 2. Inicializar proyecto MERN con Vite.  
✔️ 3. Configurar ESLint y Prettier.  
✔️ 4. Configurar GitHub Actions para CI/CD.  
✔️ 5. Crear estructura de carpetas (frontend, backend, assets, utils).  
✔️ 6. Configurar Node.js y Express en backend.  
✔️ 7. Configurar conexión a MongoDB Atlas.  
✔️ 8. Configurar variables de entorno para desarrollo y producción.  
✔️ 9. Instalar Bootstrap en frontend.  
✔️ 10. Configurar rutas básicas de frontend y backend.  

### Autenticación y roles (11-20)
✔️ 11. Crear modelo de usuario en MongoDB.  
✔️ 12. Implementar registro de cadetes.  
✔️ 13. Implementar login con JWT.  
✔️ 14. Crear middleware de autenticación.  
✔️ 15. Crear roles: cadete, instructor, administrador.  
✔️ 16. Crear middleware de autorización según rol.  
✔️ 17. Probar endpoints de autenticación con Postman.  
✔️ 18. Configurar frontend para login y registro.  
✔️ 19. Crear páginas protegidas según rol.  
❌ 20. Testear flujo completo de autenticación y roles.  

### Gestión de cursos (21-35)
✔️ 21. Crear modelo de curso en MongoDB.  
✔️ 22. Definir campos: título, descripción, categoría, videos, recursos.  
✔️ 23. Crear endpoints para CRUD de cursos.  
✔️ 24. Crear interfaz de Administrador para crear cursos.  
✔️ 25. Crear formulario de creación de curso en frontend.  
✔️ 26. Implementar subida de archivos (miniaturas y PDFs).  
✔️ 27. Integrar edición de curso existente.  
✔️ 28. Implementar eliminación de curso.  
✔️ 29. Crear endpoint para listar cursos.  
✔️ 30. Mostrar cursos en dashboard de cadetes.  
✔️ 31. Filtrar cursos por categoría.  
✔️ 32. Crear paginación en listado de cursos.  
✔️ 33. Crear búsqueda por título y descripción.  
✔️ 34. Probar CRUD completo de cursos.  
❌ 35. Testear interfaz y experiencia de usuario.  

### Integración de videos y control (36-50)
✔️ 36. Plataforma de video: **Gumlet** (hosting y reproductor embebido `play.gumlet.io`).  
❌ 37. Definir flujo para que los instructores generen y editen videos externamente.  
✔️ 38. Al crear/editar curso, campo **Gumlet Asset ID** por lección.  
✔️ 39. Solo cadetes con el curso comprado obtienen metadatos de reproducción (`lesson-playback` autenticado).  
✔️ 40. Endpoints: `GET /api/courses/user/:userId/course/:courseId/lesson-playback`, curso completo para edición `GET /api/courses/manage/course/:courseId` (admin o instructor titular).  
✔️ 41. Reproductor en la app: iframe Gumlet (`play.gumlet.io`).  
❌ 42. Implementar control de progreso de visualización por cadete.  
❌ 43. Guardar el progreso de reproducción en la base de datos interna de la app.  
❌ 44. Mostrar avance de los cadetes en el dashboard.  
❌ 45. Probar flujo completo de publicación de curso con videos externos.  
❌ 46. Documentar cómo se integran los videos externos en la plataforma.  
❌ 47. Establecer pautas para que los instructores mantengan sus videos privados.  
❌ 48. Validar que los videos sean compatibles con la app y reproducibles en todos los dispositivos.  
❌ 49. Asegurar consistencia entre videos, módulos y evaluaciones en la app.  
✔️ 50. Catálogo público sin exponer `gumletAssetId` ni marcas de respuesta correcta (`isCorrect`) en APIs de ficha/listados públicos; playback solo con JWT y compra del curso.  

### Evaluaciones y corrección automática (51-65)
✔️ 51. Crear modelo de evaluación (preguntas tipo test).  
✔️ 52. Crear endpoints para CRUD de evaluaciones (embebido en CRUD de curso / solicitud de modificación).  
✔️ 53. Crear interfaz de instructor para crear exámenes.  
✔️ 54. Implementar preguntas de opción múltiple.  
✔️ 55. Guardar respuestas de cadetes (envío por intento al corregir; persistencia del puntaje y mejor puntaje en el usuario; histórico por pregunta no almacenado).  
✔️ 56. Implementar corrección automática de test (cálculo del % en servidor a partir de `answers`).  
✔️ 57. Guardar resultados en base de datos.  
✔️ 58. Mostrar resultados a cadetes.  
❌ 59. Crear ranking o listado de resultados (opcional inicial).  
❌ 60. Probar flujo completo de evaluación.  
✔️ 61. Manejar reintentos y límites de exámenes (máx. 2 intentos en API y UI).  
❌ 62. Testear seguridad de evaluaciones.  
✔️ 63. Documentar flujo de evaluación (README API + frontend).  
✔️ 64. Integrar generación automática de diplomas (PDF).  
✔️ 65. Subir diplomas generados a perfil del cadete.  

### Pagos y monetización (66-75)
✔️ 66. Configurar cuenta de Mercado Pago.  
✔️ 67. Crear modelo de transacción en base de datos.  
✔️ 68. Crear endpoints para pagos y verificación.  
✔️ 69. Implementar frontend para proceso de compra.  
✔️ 70. Integrar webhooks de Mercado Pago para confirmar pagos.  
✔️ 71. Marcar cursos comprados en perfil de cadete.  
✔️ 72. Restringir acceso a cursos no comprados.  
✔️ 73. Probar pagos en modo sandbox.  
✔️ 74. Implementar confirmación visual de compra.  
✔️ 75. Documentar flujo de pagos. (Ver MERCADOPAGO_SETUP.md)  

### Panel de administración y cadetes (76-85)
✔️ 76. Crear dashboard de administrador.  
✔️ 77. Listar todos los cadetes y sus cursos.  
✔️ 78. Listar todos los instructores y cursos asignados.
✔️ 79. Permitir desactivar o eliminar usuarios.  
✔️ 80. Crear filtros por rol y estado.  
✔️ 81. Implementar búsqueda de usuarios.  
✔️ 82. Visualizar historial de pagos y transacciones.  
❌ 83. Revisar entregas de cadetes.  
❌ 84. Probar funcionalidades administrativas.  
🟡 85. Documentar uso del panel de administración.  

### Testing y seguridad (86-95)
❌ 86. Implementar validaciones de formulario en frontend.  
❌ 87. Implementar validaciones de datos en backend.  
❌ 88. Testear endpoints con Postman.  
❌ 89. Testear roles y permisos.  
❌ 90. Testear flujo completo de curso + video + evaluación.  
❌ 91. Testear integración con IA externa.  
❌ 92. Testear pagos y webhooks.  
❌ 93. Revisar seguridad de datos (JWT, encriptación).  
❌ 94. Configurar backups automáticos de base de datos.  
❌ 95. Probar carga inicial de usuarios y cursos.  

### Despliegue y publicación (96-100)
❌ 96. Configurar hosting en Vercel.  
❌ 97. Configurar variables de entorno en producción.  
❌ 98. Desplegar frontend y backend.  
❌ 99. Hacer pruebas finales en entorno en vivo.  
❌ 100. Publicar primer curso y abrir inscripciones a cadetes.  

---

# Documentación de la API - LATIAS Backend

Documentación de los endpoints del backend de LATIAS Academia. El servidor expone la API bajo el prefijo `/api` y utiliza tokens Bearer (JWT) para autenticación en rutas protegidas. Incluye: usuarios y roles (Cadete, Instructor, Administrador, Gestor, checkin), cursos (CRUD, compras, progreso, **pruebas con corrección en servidor** y límites de intento, **vídeo Gumlet** con `lesson-playback` y curso completo para edición vía `manage/course`), eventos, barcos y flota, certificados, **solicitudes a gestor** (ship-requests), instructores, contacto, **códigos de descuento** (solo Administrador), **wallet** y **retiros** (withdrawals), Mercado Pago y subida de archivos.

> **Uso recomendado:** Esta documentación está pensada para equipos de desarrollo e integración autorizados. En producción, evita publicarla en sitios o repositorios públicos; si la expones, no incluyas datos sensibles (URLs internas, cuentas de correo, detalles de implementación interna).

---

## Índice

1. [Información general](#información-general)
2. [Autenticación](#autenticación)
3. [Formato de respuestas](#formato-de-respuestas)
4. [Códigos HTTP](#códigos-http)
5. [Usuarios (`/api/users`)](#usuarios-apiusers)
6. [Tokens / Recuperación (`/api/tokens`)](#tokens--recuperación-apitokens)
7. [Cursos (`/api/courses`)](#cursos-apicourses)
8. [Eventos (`/api/events`)](#eventos-apievents)
9. [Barcos (`/api/boats`)](#barcos-apiboats)
10. [Certificados (`/api/certificates`)](#certificados-apicertificates)
11. [Solicitudes a gestor (`/api/ship-requests`)](#solicitudes-a-gestor-apiship-requests)
12. [Instructores (`/api/professors`)](#instructores-apiprofessors)
13. [Contacto (`/api/contact`)](#contacto-apicontact)
14. [Códigos de descuento (`/api/discount-codes`)](#códigos-de-descuento-apidiscount-codes)
15. [Mercado Pago (`/api/mercadopago`)](#mercado-pago-apimercadopago)
16. [Upload (`/api/upload`)](#upload-apiupload)
17. [Retiros / Withdrawals (`/api/withdrawals`)](#retiros--withdrawals-apiwithdrawals)
18. [Archivos estáticos](#archivos-estáticos)
19. [Modelos de datos](#modelos-de-datos)

Para una revisión de seguridad de los endpoints, ver **SECURITY_AUDIT.md** en la raíz del proyecto.

---

## Información general

- **Base URL:** `http://localhost:5000` (o la URL del servidor desplegado)
- **Prefijo API:** `/api`
- **Content-Type:** `application/json` para request/response en la mayoría de los endpoints. Excepciones: `multipart/form-data` en uploads.
- **Codificación:** UTF-8
- **Documentación del frontend:** ver el README del frontend para rutas/pantallas del cliente, auth en React y flujos UI (checkout, dashboard, wallet y retiros): [Link al README del frontend](https://github.com/clissic/latias-front?tab=readme-ov-file)

---

## Autenticación

Las rutas protegidas requieren el header:

```http
Authorization: Bearer <accessToken>
```

El `accessToken` se obtiene mediante:

- **POST** `/api/users/login` — devuelve `accessToken` y `refreshToken` en el payload.
- **POST** `/api/users/refresh-token` — devuelve un nuevo `accessToken` usando el `refreshToken`.

Si el token falta, es inválido o está expirado, la API responde con `401`.

**Autorización por rol:** Algunas rutas exigen un rol concreto (por ejemplo administrador o personal de check-in). Si el usuario no tiene el rol requerido, se responde `403`.

**Acceso a datos propios:** En rutas que operan sobre un usuario concreto (por ejemplo cursos comprados), la API solo permite acceso a los datos del usuario autenticado, salvo que tenga permisos de administrador.

---

## Formato de respuestas

Las respuestas JSON suelen seguir esta estructura:

```json
{
  "status": "success" | "error" | "failed",
  "msg": "Mensaje descriptivo",
  "payload": { ... }
}
```

- `status`: resultado de la operación.
- `msg`: mensaje legible (en español).
- `payload`: datos devueltos; puede ser un objeto, array o `{}` si no hay datos.

Algunos endpoints antiguos usan `message` en lugar de `msg`. En errores, `payload` suele ser `{}`.

---

## Códigos HTTP

| Código | Uso |
|--------|-----|
| 200 | OK — operación exitosa (GET, PUT, PATCH, DELETE, o POST que devuelve datos). |
| 201 | Created — recurso creado (POST create). |
| 400 | Bad Request — validación fallida o parámetros incorrectos. |
| 401 | Unauthorized — no autenticado o token inválido/expirado. |
| 403 | Forbidden — autenticado pero sin permiso para el recurso. |
| 404 | Not Found — recurso no encontrado. |
| 409 | Conflict — conflicto (ej. email/CI duplicado, barco ya registrado). |
| 500 | Internal Server Error — error interno del servidor. |

---

## Usuarios (`/api/users`)

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|--------------|
| POST | `/login` | No | — | Iniciar sesión. |
| POST | `/refresh-token` | No | — | Renovar access token. |
| POST | `/create` | No | — | Registro de nuevo usuario. |
| GET | `/profile` | Sí | Cualquiera | Perfil del usuario autenticado. |
| GET | `/gestors` | Sí | Cualquiera | Listar gestores (para asignar desde General). |
| GET | `/gestor/clients` | Sí | Gestor | Clientes que tienen al usuario como gestor (Portafolio). |
| POST | `/gestor/unlink-client` | Sí | Gestor | Desvincular cliente (body: clientId, reason). Envía email al cliente. |
| PATCH | `/profile/manager` | Sí | Cualquiera | Asignar o desvincular gestor (body: managerId, jurisdiction?, reason? al desvincular). |
| POST | `/logout` | Sí | Cualquiera | Cerrar sesión (stateless). |
| PUT | `/update-password` | Sí | Cualquiera | Cambiar contraseña. |
| POST | `/statistics/time-connected` | Sí | Cualquiera | Incrementar tiempo conectado (body: minutes). Usado por el frontend mientras el usuario está en la vista del curso. |
| POST | `/fleet/request` | Sí | Cualquiera | Solicitar agregar barco a mi flota. |
| GET | `/fleet` | Sí | Cualquiera | Obtener mi flota (barcos solicitados/aprobados). |
| DELETE | `/fleet/:boatId` | Sí | Cualquiera | Quitar barco de mi flota. |
| PUT | `/fleet/update-status` | Sí | Administrador | Aprobar/rechazar solicitud de flota. |
| GET | `/` | Sí | Administrador | Listar todos los usuarios. |
| GET | `/findByEmail` | Sí | Administrador | Buscar usuario por email (query). |
| GET | `/findByCi` | Sí | Administrador | Buscar usuario por CI (query). |
| GET | `/:id/wallet` | Sí | Propietario/Admin | Wallet del usuario (balance, pendiente, retiros). |
| GET | `/:id/transactions` | Sí | Propietario/Admin | Transacciones del usuario (query: status, type, limit). |
| GET | `/:id` | Sí | Administrador | Usuario por ID. |
| PUT | `/update` | Sí | Administrador | Actualizar usuario. |
| DELETE | `/:id` | Sí | Administrador | Eliminar usuario. |

### Detalle de endpoints

#### POST `/api/users/login`

**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Validación:** `email` y `password` requeridos.

**Respuesta 200:** `payload` incluye `user` (datos del usuario sin contraseña) y `tokens`: `accessToken`, `refreshToken`, `expiresIn`.

**Errores:** 400 (campos faltantes), 401 (credenciales inválidas), 500.

---

#### POST `/api/users/refresh-token`

**Body:**
```json
{
  "refreshToken": "string"
}
```

**Respuesta 200:** `payload`: `accessToken`, `expiresIn`.

**Errores:** 400 (token faltante), 401 (token inválido o no es refresh).

---

#### POST `/api/users/create`

**Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "ci": "string",
  "birth": "Date|string",
  "password": "string"
}
```

Todos los campos son requeridos. `ci` se normaliza (trim) y debe ser único.

**Respuesta 201:** `payload`: usuario creado.

**Errores:** 400 (campos faltantes o CI vacío), 409 (email o CI ya registrado), 500.

---

#### GET `/api/users/profile`

Requiere `Authorization: Bearer <token>`.

**Respuesta 200:** `payload.user` con perfil completo (incluye `fleet`, `purchasedCourses`, etc.).

**Errores:** 401, 404 (usuario no encontrado), 500.

---

#### PUT `/api/users/update-password`

**Headers:** `Authorization: Bearer <token>`.

**Body:**
```json
{
  "newPassword": "string"
}
```

**Respuesta 200:** contraseña actualizada.

**Errores:** 400 (newPassword faltante o no se pudo actualizar), 401, 500.

---

#### POST `/api/users/statistics/time-connected`

Requiere `Authorization: Bearer <token>`. Incrementa el contador de tiempo conectado del usuario autenticado (usado por el frontend mientras el usuario está en la vista del curso).

**Body:**
```json
{
  "minutes": "number"
}
```

**Respuesta 200:** estadísticas actualizadas (o mensaje de éxito).

**Errores:** 400 (minutes inválido), 401, 500.

---

#### GET `/api/users/gestors`

**Respuesta 200:** `payload`: array de usuarios con categoría Gestor (para selector al asignar gestor en General).

**Errores:** 401, 500.

---

#### GET `/api/users/gestor/clients`

Solo categoría Gestor. Lista los clientes que tienen al usuario autenticado como gestor (incluye `fleetCount` por cliente).

**Respuesta 200:** `payload`: array de clientes.

**Errores:** 401, 403, 500.

---

#### POST `/api/users/gestor/unlink-client`

Solo categoría Gestor. Desvincula un cliente (el cliente deja de tener a este gestor asignado). Envía email al cliente con los motivos indicados.

**Body:**
```json
{
  "clientId": "string",
  "reason": "string"
}
```

`reason` es obligatorio, entre 1 y 250 caracteres. El cliente debe tener actualmente al usuario autenticado como gestor.

**Respuesta 200:** cliente desvinculado; email enviado al cliente.

**Errores:** 400 (clientId/reason faltantes o reason inválido), 401, 403 (no es tu cliente), 404 (cliente no encontrado), 500.

---

#### PATCH `/api/users/profile/manager`

Asignar o desvincular el gestor del usuario autenticado. Al asignar, se envía email al gestor. Al desvincular, es obligatorio enviar `reason` (1–250 caracteres) y se envía email al gestor con los motivos.

**Body (asignar):**
```json
{
  "managerId": "string",
  "jurisdiction": "string (opcional)"
}
```

**Body (desvincular):**
```json
{
  "managerId": "",
  "reason": "string (obligatorio, 1–250 caracteres)"
}
```

**Respuesta 200:** gestor asignado o desvinculado; en su caso, email enviado al gestor.

**Errores:** 400 (managerId faltante, reason inválido al desvincular, usuario no es gestor), 401, 404 (gestor no encontrado), 500.

---

#### POST `/api/users/fleet/request`

**Body:**
```json
{
  "boatId": "ObjectId"
}
```

**Respuesta 200:** solicitud agregada a la flota del usuario.

**Errores:** 400 (boatId faltante), 401, 404 (usuario no encontrado), 409 (ya solicitado), 500.

---

#### GET `/api/users/fleet`

**Respuesta 200:** `payload`: array con la flota del usuario (solicitudes con estado pending/approved/rejected).

**Errores:** 401, 500.

---

#### DELETE `/api/users/fleet/:boatId`

**Params:** `boatId` — ID del barco a quitar de la flota.

**Errores:** 400, 401, 404, 500.

---

#### PUT `/api/users/fleet/update-status`

Solo Administrador.

**Body:**
```json
{
  "userId": "string",
  "boatId": "string",
  "status": "pending" | "approved" | "rejected"
}
```

**Errores:** 400 (campos faltantes o status inválido), 401, 403, 404, 500.

---

#### GET `/api/users/` (listar)

Solo Administrador. Sin query obligatorios.

**Respuesta 200:** `payload`: array de usuarios.

**Errores:** 401, 403, 500.

---

#### GET `/api/users/findByEmail?email=...`

Solo Administrador. Query: `email`.

**Respuesta 200:** `payload`: usuario. **404:** usuario no encontrado.

---

#### GET `/api/users/findByCi?ci=...`

Solo Administrador. Query: `ci`.

**Respuesta 200:** `payload`: usuario. **404:** usuario no encontrado.

---

#### GET `/api/users/:id`

Solo Administrador. Parámetro: `id` (identificador del usuario).

**Respuesta 200:** `payload`: usuario. **404:** no existe.

---

#### PUT `/api/users/update`

Solo Administrador. Puede enviar `_id` en body o params.

**Body (todos opcionales salvo los indicados):** `_id`, `firstName`, `lastName`, `email`, `password`, `avatar`, `status`, `ci`, `phone`, `birth`, `address`, `statistics`, `settings`, `preferences`, `rank`, `category`, `purchasedCourses`, `finishedCourses`, `manager`. Requeridos para actualización: `firstName`, `lastName`, `email`, `_id`. `category` debe incluir uno o más de: `Cadete`, `Instructor`, `Administrador`, `Gestor`, `checkin`.

**Respuesta 201:** actualización aplicada. **404:** usuario no encontrado.

**Errores:** 400 (validación), 401, 403, 500.

---

#### DELETE `/api/users/:id`

Solo Administrador.

**Respuesta 200:** usuario eliminado. **404:** no encontrado.

**Errores:** 401, 403, 500.

---

#### GET `/api/users/:id/wallet`

El usuario autenticado solo puede consultar su propia wallet; un Administrador puede consultar la de cualquier usuario (`validateUserOwnership`).

**Params:** `id` — ID del usuario.

**Respuesta 200:** `payload`: objeto wallet con `balance`, `pendingBalance`, `totalEarnings`, `totalWithdrawn`, `currency`, `lastPayoutDate`.

**Errores:** 401, 403, 404 (usuario no encontrado o sin wallet), 500.

---

#### GET `/api/users/:id/transactions`

Lista las transacciones de la wallet del usuario. Misma restricción de acceso que `/:id/wallet`.

**Params:** `id` — ID del usuario.

**Query opcionales:** `status` (pending, available, paid), `type` (course_sale, service_payment, refund, withdrawal, adjustment), `limit` (número, máx. 500; default 100).

**Respuesta 200:** `payload`: array de transacciones (orden descendente por fecha).

**Errores:** 401, 403, 500.

---

## Wallet (instructores y gestores)

La **wallet** permite a instructores y gestores acumular ingresos por venta de cursos y por trámites de gestoría pagados, con un período de retención (hold) antes de que el dinero pase a balance disponible. Solo se registran movimientos en **modo live** de Mercado Pago (no en sandbox/dev).

### Modelo de datos

- **Usuario (wallet embebida):** cada usuario tiene un objeto `wallet` con `balance` (disponible para retiro), `pendingBalance` (en hold), `lockedBalance` (reservado por retiros pendientes/en proceso), `totalEarnings`, `totalWithdrawn`, `currency` (default USD), `lastPayoutDate`.
- **Colección transactions:** cada movimiento se guarda como documento con `userId`, `type` (course_sale, service_payment, refund, withdrawal, adjustment), `sourceType` (course, service), `sourceId`, `paymentId` (opcional), `grossAmount`, `fee`, `netAmount`, `status` (pending → available → paid), `availableAt`, `currency`. Los reembolsos y retiros tienen `netAmount` negativo y `status: paid`.

### Reglas de negocio

- **Fee:** se aplica un porcentaje por defecto (ej. 20%) al monto bruto; el neto es lo que recibe el usuario.
- **Hold:** los ingresos entran como `pending` y pasan a `available` tras un número de días configurable (por defecto 14). Un script periódico (`release-wallet-funds`) actualiza las transacciones y mueve fondos de `pendingBalance` a `balance` en el usuario.

### Integración con Mercado Pago

- **Venta de curso aprobada (live_mode):** se llama a `registerCourseSaleForInstructor`: se obtiene el instructor del curso y se registra un ingreso tipo `course_sale` a su wallet (pendiente hasta el hold).
- **Pago de trámite de flota aprobado (live_mode):** se registra el ingreso para el gestor de la solicitud (`registerServicePaymentForGestor`) tipo `service_payment`.
- **Reembolso de pago de curso (live_mode):** al ejecutar el reembolso desde la API, se registra una transacción tipo `refund` para el instructor y se resta el monto del `balance` de su wallet. Se evitan duplicados usando `paymentId: refund-<paymentId>`.

### Servicio de wallet (backend)

El módulo `wallet.service` expone: `registerIncome` (genérico), `releasePendingFunds` (script), `registerCourseSaleForInstructor`, `registerServicePaymentForGestor`, `registerRefund`, `registerWithdrawal`. Los retiros (`registerWithdrawal`) restan del balance e incrementan `totalWithdrawn` y actualizan `lastPayoutDate`.

### Script de liberación de fondos

Ejecución manual o por cron para pasar transacciones pendientes cuyo `availableAt` ya venció a estado `available` y actualizar las wallets:

```bash
node src/scripts/release-wallet-funds.js
```

Requiere `MONGO_URL` (o `MONGO_URI` / `MONGODB_URL`) en el entorno.

### Uso desde el frontend

El frontend puede consumir `GET /api/users/:id/wallet` y `GET /api/users/:id/transactions` (con query `status`, `type`, `limit`) para mostrar balance, pendiente e historial al usuario (instructor o gestor) correspondiente.

---

## Tokens / Recuperación (`/api/tokens`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/recoverForm` | No | Validar token + email en BD y actualizar contraseña (uso único del token). |
| POST | `/recoverPassword` | No | Enviar email con token de recuperación. |
| GET | `/recoverPassword` | No | Validar token y email (query) para mostrar formulario de nueva contraseña. |

### Detalle

#### POST `/api/tokens/recoverForm`

**Body:**
```json
{
  "token": "string",
  "email": "string",
  "newPassword": "string",
  "confirmPassword": "string"
}
```

- `token` y `email` son **requeridos**; el token se valida contra la base de datos.
- El token debe no haber expirado; tras un uso exitoso se elimina (uso único).
- Las contraseñas deben coincidir.

**Respuesta 200:** `{ "success": true, "message": "Contraseña actualizada correctamente." }`.

**Errores:** 400 (token/email faltantes, token inválido o expirado, contraseñas no coinciden), 500.

---

#### POST `/api/tokens/recoverPassword`

**Body:** `{ "email": "string" }`.

Envía email con link/token de recuperación. Respuesta: `success`, `message`.

---

#### GET `/api/tokens/recoverPassword`

**Query:** `token`, `email` (requeridos).

Valida que el token exista en BD y no haya expirado. Se usa para mostrar el formulario de nueva contraseña en el frontend. Respuesta 200: `{ "success": true, "email": "..." }`. 400 si el token no es válido o expiró.

---

## Cursos (`/api/courses`)

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| GET | `/` | No | — | Listar todos los cursos (catálogo). |
| GET | `/id/:id` | No | — | Curso por _id. |
| GET | `/courseId/:courseId` | No | — | Curso por courseId. |
| GET | `/sku/:sku` | No | — | Curso por SKU. |
| GET | `/category/:category` | No | — | Cursos por categoría. |
| GET | `/difficulty/:difficulty` | No | — | Cursos por dificultad. |
| POST | `/create` | Sí | Administrador | Crear curso. |
| PUT | `/update/:courseId` | Sí | Administrador | Actualizar curso. |
| DELETE | `/delete/:courseId` | Sí | Administrador | Eliminar curso. |
| PUT | `/certificate/:courseId` | Sí | Administrador | Actualizar certificado del curso. |
| GET | `/manage/course/:courseId` | Sí | Administrador / Instructor | Curso completo para edición (incluye `gumletAssetId` por lección). El instructor solo si es titular del curso (coincidencia por email de contacto en `instructors`). |
| GET | `/admin/certificates` | Sí | Administrador | Listar certificados de curso emitidos (colección course-certificates). |
| POST | `/purchase/:userId` | Sí | Propietario/Admin | Comprar curso para userId. |
| GET | `/user/:userId/purchased` | Sí | Propietario/Admin | Cursos comprados del usuario. |
| PUT | `/user/:userId/course/:courseId/access` | Sí | Propietario/Admin | Registrar acceso al curso (actualiza lastAccessedAt para "Continúa donde quedaste"). |
| PUT | `/user/:userId/course/:courseId/progress` | Sí | Propietario/Admin | Actualizar progreso. |
| PUT | `/user/:userId/course/:courseId/module/:moduleId/lesson/:lessonId/progress` | Sí | Propietario/Admin | Marcar lección completada (recalcula progreso). |
| POST | `/user/:userId/course/:courseId/module/:moduleId/test-start` | Sí | Propietario/Admin | Iniciar intento de prueba parcial (incrementa contador). Máximo **2** intentos por módulo; si se alcanza el límite, 400. |
| PUT | `/user/:userId/course/:courseId/module/:moduleId/test-result` | Sí | Propietario/Admin | Enviar resultado de prueba parcial: body `{ "answers": { "<questionId>": "<optionId>", ... } }`. El servidor calcula el % con el curso en BD. Respuesta 200: `payload`: `{ "course": ..., "score": number }`. |
| POST | `/user/:userId/course/:courseId/test-final-start` | Sí | Propietario/Admin | Iniciar intento de prueba final. Máximo **2** intentos; elige hasta **25** preguntas en servidor y guarda `pendingFinalExam.questionIds` en el ítem del curso comprado. Si ya hay intento pendiente, devuelve los mismos IDs sin consumir otro intento. Respuesta 200: `payload`: `{ "questionIds": string[] }`. |
| PUT | `/user/:userId/course/:courseId/test-final-result` | Sí | Propietario/Admin | Enviar resultado de la prueba final: body `{ "answers": { "<moduleId>-<questionId>": "<optionId>", ... } }` (claves alineadas con `questionIds` del inicio). Requiere `pendingFinalExam` activo. Corrige en servidor, limpia el pendiente. Respuesta 200: `payload`: `{ "course": ..., "score": number }`. |
| GET | `/user/:userId/course/:courseId/lesson-playback` | Sí | Propietario/Admin | Metadatos de reproducción Gumlet (ver abajo). Query: `moduleId`, `lessonId`. |
| GET | `/user/:userId/course/:courseId/certificate` | Sí | Propietario/Admin | Certificado (award) del usuario en el curso. |
| PUT | `/user/:userId/course/:courseId/attempt` | Sí | Propietario/Admin | Agregar intento de examen. |
| PUT | `/user/:userId/course/:courseId/certificate` | Sí | Propietario/Admin | Actualizar certificado del usuario en el curso. |
| POST | `/request-modification/:courseId` | Sí | Instructor | Solicitar modificación de curso. |

### Detalle (resumen)

- **GET públicos de catálogo / ficha abierta** (`/courseId/:courseId`, `/category/:category`, `/difficulty/:difficulty`): Devuelven curso(s) en `payload` con sanitización **completa** para cadetes: en cada lección **no** se incluye `gumletAssetId`; en `questionBank` las opciones **no** incluyen `isCorrect` (no filtran respuestas correctas por API). 404 si no hay resultados.
- **GET** `/`, `/id/:id`, `/sku/:sku` (uso típico administración): omiten `gumletAssetId` en lecciones; el banco de preguntas puede incluir `isCorrect` para edición/gestión. Asegurar que solo los roles autorizados consuman estas rutas si se expone el listado completo.
- **POST `/create`:** Body con `courseId`, `sku`, `courseName`, `price`, `category` requeridos; opcionales: `bannerUrl`, `image`, `shortImage`, `currency`, `shortDescription`, `longDescription`, `duration`, `difficulty`, `professor` (datos del **instructor**, ver modelo), `modules`, `selectedInstructorId`. Cada lección puede incluir `gumletAssetId` (ID del asset en Gumlet). Respuesta 201 con curso creado.
- **PUT `/update/:courseId`:** Body con campos a actualizar (misma normalización de `modules` y `gumletAssetId` que en create). 200 con curso actualizado, 404 si no existe.
- **DELETE `/delete/:courseId`:** 200 al eliminar, 404 si no existe.
- **PUT `/certificate/:courseId`:** Actualiza datos del certificado del curso (campos según implementación).
- **GET `/manage/course/:courseId`:** Devuelve el curso completo con `gumletAssetId` en cada lección. **Administrador:** cualquier curso. **Instructor:** solo si el `course.instructor` coincide con el documento de `instructors` cuyo `contact.email` es el del usuario autenticado. 403 si no autorizado, 404 si no existe el curso.
- **GET `/admin/certificates`:** Lista certificados de curso emitidos (orden reciente). Solo Administrador.
- **POST `/purchase/:userId`:** Asocia el curso al usuario (sin pago directo; para flujo Mercado Pago se usa otro flujo). Solo el propio usuario o un administrador puede realizar la operación.
- **GET `/user/:userId/purchased`:** Lista cursos comprados del usuario. Solo el propio usuario o un administrador puede consultar.
- **PUT `.../access`:** Registra acceso al curso (actualiza `lastAccessedAt` en el ítem de `purchasedCourses`; usado para "Continúa donde quedaste"). Solo el propio usuario o un administrador.
- **PUT `.../progress`:** Body con progreso (módulos/lecciones completadas). Solo el propio usuario o un administrador puede consultar.
- **PUT `.../module/:moduleId/lesson/:lessonId/progress`:** Body `{ "completed": true|false }`. Marca lección y recalcula progreso del curso en el usuario.
- **POST/PUT pruebas parciales y final** (`test-start`, `test-result`, `test-final-start`, `test-final-result`): Requieren curso en `purchasedCourses`. Límite de **2** intentos por prueba parcial (por `moduleId`) y **2** por prueba final (en servidor). La **corrección** se hace en servidor: `test-result` y `test-final-result` reciben `answers` (mapa pregunta → `optionId`); no se acepta un puntaje enviado a mano por el cliente. La prueba final usa el subconjunto de preguntas fijado al `test-final-start` (`pendingFinalExam` en el usuario).
- **GET `.../lesson-playback`:** Query obligatorios: `moduleId`, `lessonId`. Solo si el usuario tiene el curso en `purchasedCourses`. Respuesta 200: `payload`: `{ "kind": "gumlet", "embedUrl": "https://play.gumlet.io/embed/<gumletAssetId>" }`. 404 si no hay asset, sin compra o lección inexistente. El reproductor en cliente usa `embedUrl` en un iframe.
- **GET `.../certificate`:** Obtiene el certificado (award) generado para el usuario en ese curso (PDF/metadata según implementación).
- **PUT `.../attempt`:** Registra intento de examen. Solo el propio usuario o un administrador puede consultar.
- **PUT `.../certificate`:** Actualiza certificado del usuario en ese curso. Solo el propio usuario o un administrador puede consultar.
- **POST `/request-modification/:courseId`:** Solo Instructor; envía solicitud de modificación por correo (comparación de campos propuestos vs actuales).

### Vídeo con Gumlet (modelo y seguridad)

- **Proveedor:** Gumlet (`https://play.gumlet.io/embed/{assetId}`). En MongoDB cada lección guarda `gumletAssetId` (string).
- **Privacidad:** Los listados y fichas **públicas** usadas como catálogo (`courseId`, `category`, `difficulty`) omiten `gumletAssetId` y **no** envían `isCorrect` en opciones de exámenes. Quien compra el curso obtiene la URL de embed solo vía `lesson-playback` autenticado.
- **Configuración en Gumlet:** restricciones de dominio o visibilidad del embed conviene definirlas en el panel de Gumlet además de la lógica de la API.

Todos los códigos de error estándar (400, 401, 403, 404, 500) aplican según validaciones y permisos.

---

## Eventos (`/api/events`)

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| GET | `/active` | No | — | Eventos activos. |
| GET | `/id/:id` | No | — | Evento por _id. |
| GET | `/eventId/:eventId` | No | — | Evento por eventId. |
| POST | `/purchase/:eventId` | Sí | Cualquiera | Comprar ticket(s). |
| GET | `/verify/:ticketId` | No | — | Verificar autenticidad de ticket (público). |
| GET | `/checkin/verify/:ticketId` | Sí | checkin | Verificar ticket y hacer check-in. |
| GET | `/checkin/logs` | Sí | checkin | Logs de verificación de tickets. |
| GET | `/` | Sí | Administrador | Todos los eventos. |
| POST | `/create` | Sí | Administrador | Crear evento. |
| PUT | `/update/:eventId` | Sí | Administrador | Actualizar evento. |
| DELETE | `/delete/:eventId` | Sí | Administrador | Eliminar evento. |
| POST | `/deactivate-expired` | Sí | Administrador | Desactivar eventos vencidos. |
| GET | `/logs` | Sí | Administrador | Logs de tickets (mismo que checkin/logs). |

### Detalle (resumen)

- **GET `/active`:** `payload`: array de eventos con `active: true`.
- **GET `/id/:id`**, **GET `/eventId/:eventId`:** `payload`: evento. 404 si no existe.
- **POST `/purchase/:eventId`:** Body: `{ "quantity": 1 }` (opcional, default 1). Usuario debe estar autenticado y con CI en perfil. Registra persona en el evento, genera `ticketId`, envía email con ticket y QR. Respuesta 200: `payload`: `ticketId`, `event`.
- **GET `/verify/:ticketId`:** Público. `payload`: datos del ticket y evento (válido o no). 404 si ticket no encontrado/inválido.
- **GET `/checkin/verify/:ticketId`:** Solo categoría `checkin`. Verifica el ticket y, si está disponible, lo marca como usado y crea log. Si el ticket ya fue usado, no lo vuelve a procesar pero sí puede crear log. Incrementa `eventsAttended` del usuario asistente (por CI). Respuesta 200: `payload`: `event`, `person`, `isValid`, `processed`. 404 si ticket inválido.
- **GET `/checkin/logs`**, **GET `/logs`:** Query opcional: `limit` (default 100). `payload`: array de logs de verificación de tickets.
- **POST `/create`:** Body: `title`, `date`, `hour` requeridos; `tickets.availableTickets` si se envían tickets. Otros: `price`, `currency`, `description`, `image`, `location`, `speaker`, etc. 201 con evento creado.
- **PUT `/update/:eventId`:** Body con campos a actualizar. Se recalculan `remainingTickets` si se envían `tickets`. 200 con evento actualizado.
- **DELETE `/delete/:eventId`:** 200 al eliminar. 404 si no existe.
- **POST `/deactivate-expired`:** 200 con `payload.modifiedCount` (eventos desactivados).

---

## Barcos (`/api/boats`)

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| GET | `/active` | No | — | Barcos activos. |
| GET | `/id/:id` | No | — | Barco por _id. |
| GET | `/registration/:registrationNumber` | No | — | Barco por número de registro. |
| GET | `/owner/:ownerId` | Sí | Cualquiera | Barcos del propietario. |
| POST | `/request-registration` | Sí | Cualquiera | Solicitar registro (barco inactivo). |
| GET | `/registration/approve/:id` | No* | — | Aprobar registro (requiere token de autorización). |
| GET | `/registration/reject/:id` | No* | — | Rechazar registro (requiere token de autorización). |
| GET | `/` | Sí | Administrador | Todos los barcos. |
| POST | `/create` | Sí | Administrador | Crear barco. |
| PUT | `/update/:id` | Sí | Administrador | Actualizar barco. |
| DELETE | `/delete/:id` | Sí | Administrador | Eliminar barco. |
| PATCH | `/toggle-active/:id` | Sí | Administrador | Activar/desactivar barco. |

\* Aprobar/rechazar requieren un token de autorización generado por el sistema (por ejemplo enviado por correo a quienes tengan permiso).

### Detalle (resumen)

- **GET públicos:** `payload`: barco o lista. 404 si no hay resultado.
- **GET `/owner/:ownerId`:** Lista barcos del usuario `ownerId`. Requiere Bearer token.
- **POST `/request-registration`:** Body: `name`, `registrationNumber`, `registrationCountry`, `registrationPort`, `boatType`, `lengthOverall`, `beam` requeridos; opcionales: `currentPort`, `depth`, `displacement`, `image`. Crea barco en estado pendiente de aprobación. 201 con barco creado. 409 si ya existe barco con ese número de registro.
- **GET `/registration/approve/:id`:** Requiere token de autorización. Marca barco como aprobado y notifica al propietario. 400 si falta autorización o barco ya aprobado, 404 si barco no existe.
- **GET `/registration/reject/:id`:** Requiere token de autorización. Rechaza la solicitud de registro. 400 si falta autorización, 404 si no existe.
- **POST `/create`:** Solo Administrador. Mismos campos que request-registration más `owner` (ObjectId). 201 con barco creado. 409 si número de registro duplicado.
- **PUT `/update/:id`:** Body con campos a actualizar. 200 con barco actualizado. 404 si no existe, 409 si otro barco tiene el mismo número de registro.
- **DELETE `/delete/:id`:** 200 al eliminar. 404 si no existe.
- **PATCH `/toggle-active/:id`:** Invierte `isActive`. 200 con barco actualizado. 404 si no existe.

**boatType (enum):** `Yate monocasco`, `Yate catamarán`, `Lancha`, `Velero monocasco`, `Velero catamarán`, `Moto náutica`, `Jet sky`, `Kayak`, `Canoa`, `Bote`, `Semirígido`, `Neumático`, `Otro`.

---

## Certificados (`/api/certificates`)

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| GET | `/id/:id` | No | — | Certificado por _id. |
| GET | `/boat/:boatId` | No | — | Certificados del barco. |
| GET | `/status/:status` | No | — | Certificados por estado. |
| GET | `/boat/:boatId/status/:status` | No | — | Por barco y estado. |
| GET | `/expired` | No | — | Certificados vencidos. |
| GET | `/expiring-soon` | No | — | Próximos a vencer (query days). |
| GET | `/` | Sí | Administrador | Todos los certificados. |
| POST | `/create` | Sí | Cualquiera | Crear certificado. |
| PUT | `/update/:id` | Sí | Cualquiera | Actualizar certificado. |
| DELETE | `/delete/:id` | Sí | Cualquiera | Eliminar certificado. |

### Detalle (resumen)

- **GET públicos:** `payload`: certificado o array. Para `/expiring-soon` query opcional: `days` (default 30). `status` debe ser: `vigente`, `vencido`, `anulado`. 400 si status inválido.
- **POST `/create`:** Body: `boatId`, `certificateType`, `number`, `issueDate`, `expirationDate` requeridos; opcionales: `observations`, `pdfFile`, `annualInspection`. El `status` se calcula por fecha de vencimiento. 201 con certificado creado. 404 si el barco no existe.
- **PUT `/update/:id`:** Body con campos a actualizar. 200 con certificado actualizado. 404 si no existe.
- **DELETE `/delete/:id`:** 200 al eliminar. 404 si no existe.

**annualInspection:** `Realizada`, `No realizada`, `No corresponde`.

---

## Solicitudes a gestor (`/api/ship-requests`)

Solicitudes de trabajo de un cliente (owner) hacia un gestor (manager) sobre un barco: renovación, preparación, asesoramiento de certificados; **solicitud especial** (solo notas); y **solicitud de flota** (desde Mi gestor: barco + certificado + tipos de trámite, con descuento de trámites o pago). Todas las rutas requieren **autenticación** (Bearer token).

| Método | Ruta | Auth | Rol / Restricción | Descripción |
|--------|------|------|-------------------|-------------|
| POST | `/` | Sí | Cualquiera | Crear solicitud (body: ship, owner?, manager, type/types, notes?). |
| POST | `/certificate` | Sí | Cualquiera | Crear solicitud desde certificado (flota) y enviar email al gestor. |
| POST | `/flota` | Sí | Cualquiera | Solicitud de trámite de flota (Mi gestor): barco + certificado + procedureTypes; descuenta 1 trámite o devuelve checkout 30 USD. |
| GET | `/` | Sí | Administrador o Gestor | Listar todas (query: status, owner, manager, ship). |
| GET | `/owner/:ownerId` | Sí | Propietario o Admin | Solicitudes del owner (solo el propio usuario o Admin). |
| GET | `/manager/:managerId` | Sí | Gestor o Admin | Solicitudes del gestor (solo el gestor o Admin). |
| GET | `/ship/:shipId` | Sí | Cualquiera | Solicitudes del barco. |
| GET | `/:id` | Sí | Cualquiera | Obtener una solicitud por ID. |
| PATCH | `/:id/status` | Sí | Administrador o Gestor asignado | Actualizar estado. |
| PUT | `/:id` | Sí | Administrador o Gestor asignado | Actualizar solicitud. |
| DELETE | `/:id` | Sí | Administrador o owner | Eliminar solicitud. |

### Solicitar trámite (Mi gestor)

En la página **Mi gestor** el usuario puede abrir el modal **Solicitar trámite** y elegir el tipo de solicitud:

- **Solicitud de flota** (implementado): el usuario selecciona barco (con puerto de registro), certificado (tipo y N°), uno o más tipos de trámite (Emisión inicial, Renovación por vencimiento, Inspección intermedia, Asesoramiento técnico/legal) y opcionalmente notas. Al confirmar:
  - Si el usuario tiene **premium.procedures > 0**: se descuenta 1 trámite, se crea la solicitud en estado "Pendiente" y se envía al gestor un email con todos los datos (solicitante con nombre, email y teléfono, barco, certificado, tipos de trámite, notas).
  - Si **premium.procedures === 0**: se crea la solicitud en estado "Pendiente de pago", se genera una preferencia de Mercado Pago por **30 USD** y se devuelve `requiresPayment: true` e `initPoint` para redirigir al checkout. Tras el pago aprobado, el webhook actualiza la solicitud a "Pendiente" y envía el mismo email al gestor (incluye teléfono del solicitante; el modelo ship-requests hace populate de `owner` con `firstName`, `lastName`, `email` y `phone`).
- **Solicitud de gente de mar** y **Solicitud especial**: previstos para implementación futura (la solicitud especial mantiene el flujo barco + cuerpo de texto desde el mismo modal).

### Detalle (resumen)

- **POST `/`:** Body: `ship` (ObjectId), `owner` (opcional, default usuario autenticado), `manager` (ObjectId), `type` o `types` (array: "Renovación", "Preparación", "Asesoramiento", "Solicitud especial"), `notes` (opcional). 201 con solicitud creada.
- **POST `/certificate`:** Body: `shipId`, `certificate` (objeto con certificateType, number, issueDate, expirationDate), `types` (array no vacío), `notes` (opcional). El usuario debe tener gestor asignado. Crea la solicitud y envía email al gestor (incluye observaciones en bloque "Detalle de la solicitud" si hay `notes`). 201 con solicitud creada. 400 si no hay gestor asignado.
- **POST `/flota`:** Body: `shipId`, `certificate` (certificateType, number, issueDate, expirationDate), `procedureTypes` (array no vacío: una de "Emisión inicial", "Renovación por vencimiento", "Inspección intermedia", "Otro", y opcionalmente "Asesoramiento técnico/legal"), `notes` (opcional). Usuario debe tener gestor asignado. Si `premium.procedures > 0`: se decrementa en 1, se crea solicitud en "Pendiente" y se envía email al gestor (solicitud de trámite de flota con datos completos del barco y certificado). Si `premium.procedures === 0`: se crea solicitud en "Pendiente de pago", se devuelve 200 con `requiresPayment: true`, `initPoint` (checkout 30 USD), `requestId`. Tras el pago, el webhook de Mercado Pago actualiza la solicitud a "Pendiente" y envía el email al gestor.
- **GET `/`:** Query opcionales: `status`, `owner`, `manager`, `ship`. `payload`: array de solicitudes.
- **GET `/owner/:ownerId`**, **GET `/manager/:managerId`:** `payload`: array de solicitudes. Validación de ownership: solo el propio usuario o Administrador.
- **GET `/ship/:shipId`:** `payload`: array de solicitudes del barco.
- **GET `/:id`:** `payload`: solicitud poblada (ship, owner, manager). 404 si no existe.
- **PATCH `/:id/status`:** Body: `status` (requerido: "Pendiente", "Pendiente de pago", "En progreso", "Completado", "Rechazado"), `completedAt` (opcional), `rejectionReason` (obligatorio si status es "Rechazado"). Al cambiar estado se envía email al owner con **detalle de la solicitud** (barco, tipos de trámite, fecha de solicitud, certificado y observaciones si existen). 200 con solicitud actualizada.
- **PUT `/:id`:** Body con campos a actualizar. 200 con solicitud actualizada. 404 si no existe.
- **DELETE `/:id`:** Solo Administrador o el owner de la solicitud. 200 al eliminar. 403 si no tiene permiso. 404 si no existe.

**status:** `Pendiente`, `Pendiente de pago`, `En progreso`, `Completado`, `Rechazado`. **type:** array que puede incluir `Renovación`, `Preparación`, `Asesoramiento`, `Solicitud especial`, `Solicitud de flota`. Para solicitudes de flota se guardan además `procedureTypes`, `certificateIssueDate`, `certificateExpirationDate`.

---

## Instructores (`/api/professors`)

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| GET | `/` | No | — | Todos los instructores. |
| GET | `/id/:id` | No | — | Instructor por _id. |
| GET | `/ci/:ci` | No | — | Instructor por CI (numérico). |
| GET | `/course/:courseId` | No | — | Instructores asignados a un curso. |
| POST | `/create` | Sí | Administrador | Crear instructor. |
| PUT | `/update/:id` | Sí | Administrador | Actualizar instructor. |
| DELETE | `/delete/:id` | Sí | Administrador | Eliminar instructor. |

### Detalle (resumen)

- **GET públicos:** `payload`: instructor o array. 404 en find por id/ci si no existe.
- **POST `/create`:** Body: `firstName`, `lastName`, `ci`, `profession`, `contact.email` requeridos; opcionales: `profileImage`, `experience`, `bio`, `certifications`, `achievements`, `courses`, `contact.phone`, `socialMedia`. 201 con instructor creado. 409 si CI duplicado.
- **PUT `/update/:id`:** Body con campos a actualizar. 200 con instructor actualizado. 404 si no existe.
- **DELETE `/delete/:id`:** 200 al eliminar. 404 si no existe.

---

## Contacto (`/api/contact`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/send` | No | Enviar mensaje de contacto por email. |

**Body:**
```json
{
  "name": "string",
  "email": "string",
  "body": "string"
}
```

Todos requeridos. `email` debe ser formato válido. El mensaje se envía al destinatario configurado en el servidor. El contenido se escapa para evitar XSS.

**Respuesta 200:** mensaje enviado correctamente. **Errores:** 400 (campos faltantes o email inválido), 500.

---

## Códigos de descuento (`/api/discount-codes`)

Gestión de códigos de descuento para aplicar un porcentaje sobre el precio (por ejemplo en compra de cursos). Solo **Administrador** puede crear, listar, actualizar y eliminar códigos. Cada código tiene un identificador asignado por la base de datos (`_id`), un **porcentaje** de descuento (0–100), el **código** en sí (elegido por el administrador, único) y una **descripción** que explica el motivo (festividad, creador de contenido, etc.).

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| GET | `/` | Sí | Administrador | Listar todos los códigos de descuento. |
| GET | `/id/:id` | Sí | Administrador | Obtener código por _id. |
| GET | `/code/:code` | Sí | Administrador | Obtener código por valor (ej. NAVIDAD2025). |
| POST | `/create` | Sí | Administrador | Crear código de descuento. |
| PUT | `/update/:id` | Sí | Administrador | Actualizar código por _id. |
| DELETE | `/delete/:id` | Sí | Administrador | Eliminar código por _id. |
| POST | `/apply` | Sí | Cualquiera | Aplicar código (registra uso del usuario). Body: `code`. Devuelve porcentaje; si el código está agotado o ya lo usó el usuario, 400 con msg. |

### Detalle (resumen)

- **GET `/`:** `payload`: array de códigos de descuento (ordenados por fecha de creación descendente). **Errores:** 401, 403, 500.
- **GET `/id/:id`:** `payload`: código. **404** si no existe. **Errores:** 401, 403, 500.
- **GET `/code/:code`:** `payload`: código (el valor se normaliza a mayúsculas en backend). **404** si no existe. **Errores:** 401, 403, 500.
- **POST `/create`:** Body: `code` (string, obligatorio), `percentage` (número 0–100, obligatorio), `description` (string, obligatorio), `quantity` (entero ≥ 0, obligatorio; número fijo de usos permitidos). El `code` se guarda en mayúsculas y debe ser único. `usedBy` se inicializa vacío e `isActive` en `true`. **201** con código creado. **Errores:** 400 (validación), 401, 403, 409 (código duplicado), 500.
- **PUT `/update/:id`:** Body: `code`, `percentage`, `description`, `quantity`, `isActive` (todos opcionales; `quantity` no puede ser menor que la cantidad de usos ya realizados). **200** con código actualizado. **404** si no existe. **Errores:** 400, 401, 403, 409 (código duplicado), 500.
- **DELETE `/delete/:id`:** **200** al eliminar. **404** si no existe. **Errores:** 401, 403, 500.
- **POST `/apply`:** Body: `code` (string). Usuario autenticado aplica el código: se agrega su `_id` a `usedBy` y, si `usedBy.length === quantity`, se pone `isActive` en `false`. Respuesta 200: `payload`: `percentage`, `code`, `_id`. **400** si código no encontrado, inactivo, agotado (`usedBy.length === quantity`) o el usuario ya lo usó; en esos casos `msg` indica el motivo (ej. "Este código ya fue utilizado la cantidad de veces disponible."). **Errores:** 401, 500.

---

## Mercado Pago (`/api/mercadopago`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/webhook` | No | Webhook que Mercado Pago llama (body + headers x-signature, x-request-id). |
| GET | `/payment-methods` | No | Listar métodos de pago disponibles. |
| POST | `/create-preference` | Sí | Crear preferencia de pago (solo para la propia cuenta o por administrador). |
| GET | `/preference/:preferenceId` | Sí | Obtener preferencia. |
| GET | `/payment/:paymentId` | Sí | Obtener pago (solo si pertenece al usuario o es Admin). |
| POST | `/create-payment` | Sí | Crear pago directo. |
| POST | `/refund/:paymentId` | Sí | Crear reembolso (body opcional: amount). |
| GET | `/payment-status/:paymentId` | Sí | Estado del pago (validación de propiedad). |
| POST | `/process-successful-payment` | Sí | Procesar pago aprobado: curso, plan premium o trámite según external_reference. |
| GET | `/processed-payments` | Sí | Administrador | Paginado de pagos procesados (cursos, suscripciones, trámites). Query: page, limit, paymentId, courseId, courseName, itemType, userEmail, userId, paymentStatus, currency. |

### Detalle (resumen)

- **POST `/webhook`:** Body con `type` y datos del evento. Siempre responde 200 para evitar reintentos de Mercado Pago. Procesamiento según tipo de evento. Se soportan `external_reference`: **curso** (`courseId|userId`), **plan premium** (`premium|planId|userId`) y **trámite de flota** (`procedure|pendingId` o `procedure|requestId`): para trámite, al aprobar el pago se crea la solicitud en ship-requests (desde pending), se registra en processed-payments con metadata (requestType, procedureTypes, shipId, shipName, registrationNumber) y se envía el email al gestor (30 USD).
- **GET `/payment-methods`:** `payload.paymentMethods`: array de métodos de pago.
- **POST `/create-preference`:** Body: `courseId`, `courseName`, `price`, `userId` requeridos; opcional: `currency`. Verifica que el curso exista. Respuesta: `preferenceId`, `initPoint`, `sandboxInitPoint`. 404 si curso no existe. Solo se pueden crear preferencias para la propia cuenta (o por un administrador).
- **GET `/preference/:preferenceId`:** `payload.preference`: objeto preferencia.
- **GET `/payment/:paymentId`:** `payload.payment`: pago. 403 si el usuario no tiene permiso para ver ese pago.
- **POST `/create-payment`:** Body: `transaction_amount`, `description`, `payment_method_id`, `payer` requeridos; opcionales: `installments`, `external_reference`. Crea pago en Mercado Pago.
- **POST `/refund/:paymentId`:** Body opcional: `amount`. Crea reembolso. 200 con `payload.refund`.
- **GET `/payment-status/:paymentId`:** `payload`: `paymentId`, `status`, `statusDetail`, `transactionAmount`, `externalReference`. 403 si el usuario no tiene permiso para consultar ese pago.
- **POST `/process-successful-payment`:** Body: `paymentId`. El pago debe estar aprobado. Según `external_reference`: asocia curso al usuario, activa plan premium o crea ship-request desde pending (trámite). Solo el usuario dueño del pago o un administrador. 200 con resultado.
- **GET `/processed-payments`:** Solo Administrador. Query: `page`, `limit`, `paymentId`, `courseId`, `courseName`, `itemType` (course|subscription|procedure|service|other), `userEmail`, `userId`, `paymentStatus`, `currency`. Respuesta paginada con `docs` en estructura unificada: `user` (id, email, firstName, lastName), `item` (type, id, name), `amount` (value, currency), `paymentStatus`, `processedAt`, etc. Ver modelo [Pagos procesados](#pagos-procesados-processed-payments).

Para más detalles de integración, ver `MERCADOPAGO_SETUP.md` en la raíz del proyecto.

---

## Upload (`/api/upload`)

Todos los endpoints de upload requieren `Authorization: Bearer <token>` y envío `multipart/form-data`. Los archivos se almacenan en el servidor y la respuesta incluye rutas relativas para acceder a ellos.

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| POST | `/course-image` | Sí | Administrador | Una imagen de curso. |
| POST | `/course-images` | Sí | Administrador | Múltiples imágenes: `bannerUrl`, `image`, `shortImage`. |
| POST | `/professor-image` | Sí | Administrador | Imagen de perfil de instructor. |
| POST | `/event-image` | Sí | Administrador | Imagen de evento. |
| POST | `/boat-image` | Sí | Cualquiera | Imagen de barco. |
| POST | `/certificate-pdf` | Sí | Cualquiera | PDF de certificado. |
| POST | `/withdrawal-proof` | Sí | Administrador | Subir comprobante de pago para un retiro (PDF o imagen). |

### Respuestas

- **200:** `payload`: para una imagen, `imagePath` o `profileImage`/`image`/`pdfFile` y `filename`; para course-images, objeto con `bannerUrl`, `image`, `shortImage` (rutas relativas).
- **400:** No se envió archivo o el archivo no cumple tipo/tamaño permitido. Para imágenes: límite de tamaño y formatos jpeg, jpg, png, gif, webp según configuración del servidor.

Los archivos subidos se sirven bajo rutas relativas del tipo `/uploads/...` (ruta base según despliegue).

---

## Retiros / Withdrawals (`/api/withdrawals`)

Sistema completo de **retiros** integrado con la wallet, priorizando consistencia, seguridad y trazabilidad.

### Conceptos clave

- **Fondos disponibles vs bloqueados:** al crear un retiro, el monto sale de `wallet.balance` y pasa a `wallet.lockedBalance` para evitar doble gasto.
- **Estados:** `pending`, `processing`, `completed`, `rejected`, `expired`.
- **Expiración automática:** los retiros `pending` expiran por cron; se devuelve el dinero de `lockedBalance` a `balance`.
- **Acción administrativa por link firmado:** el admin recibe un email con link a `/admin/withdrawals/process?token=...`. El token **no reemplaza** autenticación/rol: además se requiere Bearer JWT y categoría `Administrador`.
- **Validación siempre contra BD:** nunca se confía en datos del token para reglas de negocio; el token solo habilita identificar el `withdrawalId` a procesar.

### Endpoints

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| POST | `/` | Sí | Instructor/Gestor | Crear solicitud de retiro. |
| GET | `/admin/process?token=...` | Sí | Administrador | Obtener datos para procesar retiro (requiere token firmado en query + Bearer JWT). |
| PATCH | `/:id/process?token=...` | Sí | Administrador | Marcar retiro como completado y adjuntar `proofUrl` (validado por token). |
| PATCH | `/:id/reject?token=...` | Sí | Administrador | Rechazar retiro y devolver fondos (validado por token). |
| GET | `/admin/list` | Sí | Administrador | Listado paginado + filtros para panel de gestión. |

### Reglas de negocio (resumen)

- **POST `/api/withdrawals`**
  - Valida: `amount > 0`, no permite sobregiro, y requiere método/detalles de pago disponibles.
  - Crea retiro en `pending` con `expiresAt = now + 10 días`.
  - Actualiza wallet: `balance -= amount` y `lockedBalance += amount`.
  - Envía email al administrador (`GOOGLE_EMAIL`) con link firmado para procesar.
- **PATCH `/:id/process`**
  - Solo si el retiro está en `pending` o `processing`.
  - Guarda `proofUrl`, setea `status = completed`, `processedAt = now`.
  - Actualiza wallet: `lockedBalance -= amount`, `totalWithdrawn += amount`, `lastPayoutDate = now`.
  - Envía email al usuario con comprobante.
- **PATCH `/:id/reject`**
  - Solo si el retiro está en `pending` o `processing`.
  - Setea `status = rejected`, guarda `rejectionReason`.
  - Devuelve fondos: `lockedBalance -= amount`, `balance += amount`.
  - Envía email al usuario con motivo.
- **Expiración (cron)**
  - Encuentra retiros `pending` con `expiresAt <= now`, setea `status = expired` y devuelve fondos (`lockedBalance -> balance`).

---

## Archivos estáticos

- **Ruta `/uploads`:** Sirve los archivos subidos (imágenes y PDFs) mediante rutas relativas.
- **Ruta raíz / SPA:** Las rutas que no corresponden a `/api` ni a archivos estáticos se sirven como SPA; el servidor devuelve la aplicación frontend para enrutado del cliente.

---

## Modelos de datos

Resumen de las entidades y campos principales de la API (para referencia al integrar; los nombres pueden coincidir con los body/params documentados arriba).

### Usuario (users)

- `firstName`, `lastName`, `email`, `ci`, `password`, `phone`, `birth` — datos básicos; `email` y `ci` únicos.
- `category`: array/enum `Cadete`, `Instructor`, `Administrador`, `Gestor`, `checkin`. Default `Cadete`.
- `rank`: `{ title, description }`.
- `address`: `{ street, city, state, country, number, zipCode }`.
- `preferences`: `{ language, notifications, newsLetter }`.
- `statistics`: `{ eventsAttended: [{ eventId, attendedAt }], timeConnected, certificatesQuantity }`.
- `settings`: `{ theme, twoStepVerification }`.
- `purchasedCourses`, `finishedCourses`, `paymentMethods`: arrays. Cada ítem de `purchasedCourses` incluye progreso por curso (`modules` con lecciones completadas, `testAttempts` / `lastTestScore` por módulo, `finalTestAttempts`, `finalTestLastScore`, etc.). Durante un intento de prueba final abierto puede existir **`pendingFinalExam`**: `{ questionIds: string[], startedAt }` (subconjunto fijado en servidor).
- `fleet`: `[{ boatId, requestedAt, status: pending|approved|rejected }]`.
- `manager`: `{ active, managerId }`.
- `bankAccount`: `{ bank, number, type }` — datos de cobro (banco o billetera/fintech) para instructores y gestores.
- `wallet`: `{ balance, pendingBalance, lockedBalance, totalEarnings, totalWithdrawn, currency, lastPayoutDate }` — usado por instructores y gestores para ingresos por cursos y trámites; `lockedBalance` representa fondos comprometidos por retiros pendientes/en proceso.
- `lastLogin`: Date.

### Curso (courses)

- `courseId`, `sku`, `courseName` — identificadores y nombre; `bannerUrl`, `image`, `shortImage`, `currency`, `shortDescription`, `longDescription`, `duration`, `price`, `difficulty`, `category`.
- `certificate`: `{ certificateId, certificateUrl, credentialNumber }`.
- `professor`: array de `{ firstName, lastName, profession }` — datos del **instructor** (nombre, apellido, profesión). *(Se conserva el nombre técnico `professor` por compatibilidad del modelo/API.)*
- `modules`: array de módulos con `moduleId`, `moduleName`, `moduleDescription`, `lessons` (lessonId, lessonName, lessonDescription, `gumletAssetId`), `questionBank` (preguntas con `questionId`, `questionText`, opciones con `optionId`, `optionText`, `isCorrect` en BD; en respuestas públicas de catálogo las opciones van sin `isCorrect`).

### Evento (events)

- `eventId` (único, sparse), `title`, `date`, `hour`, `active`, `price`, `currency`, `description`, `image`.
- `tickets`: `{ availableTickets, soldTickets, remainingTickets }`.
- `location`: `{ city, country, address }`.
- `speaker`: `{ firstName, lastName, ci, profession, position }`.
- `peopleRegistered`: `[{ firstName, lastName, ci, ticketId, available, registeredAt }]`.

### Barco (boats)

- `owner` (ObjectId ref users), `name`, `registrationNumber` (único), `registrationCountry`, `registrationPort`, `currentPort`, `boatType` (enum), `lengthOverall`, `beam`, `depth`, `displacement`, `image`, `isActive`. Timestamps.

### Certificado (certificates)

- `boatId` (ObjectId ref boats), `certificateType`, `number`, `issueDate`, `expirationDate`, `status` (vigente|vencido|anulado), `observations`, `pdfFile`, `annualInspection` (Realizada|No realizada|No corresponde). Timestamps.

### Instructor (professors)

- `firstName`, `lastName`, `ci` (único, número), `profileImage`, `profession`, `experience`, `bio`, `certifications`, `achievements`, `courses` (array de courseId), `contact`: `{ email, phone }`, `socialMedia`. Timestamps.

### Retiro (withdrawals)

Colección `withdrawals` para solicitudes de retiro.

- `userId`: ObjectId ref users.
- `amount`: number (> 0).
- `currency`: string (default "USD").
- `status`: enum `pending|processing|completed|rejected|expired`.
- `payoutMethod`: string (ej. banco/fintech).
- `payoutDetails`: Mixed (snapshot de datos para pago).
- `proofUrl`: string (ruta del comprobante subido).
- `rejectionReason`: string.
- `expiresAt`: Date.
- `processedAt`: Date|null.
- Timestamps (`createdAt`, `updatedAt`).

### Solicitud a gestor (ship-requests)

- `ship` (ObjectId ref boats), `owner` (ObjectId ref users), `manager` (ObjectId ref users), `type` (array: "Renovación", "Preparación", "Asesoramiento", "Solicitud especial", "Solicitud de flota"), `status` ("Pendiente", "Pendiente de pago", "En progreso", "Completado", "Rechazado"), `requestedAt`, `completedAt`, `notes`, `certificate` (tipo de certificado), `number` (número de certificado), `certificateIssueDate`, `certificateExpirationDate`, `procedureTypes` (array, para Solicitud de flota: una de "Emisión inicial", "Renovación por vencimiento", "Inspección intermedia", "Otro", opcionalmente junto con "Asesoramiento técnico/legal"), `rejectionReason`. Timestamps.

### Ticket Log (ticket-logs)

- `ticketId`, `eventId`, `eventTitle`, `personFirstName`, `personLastName`, `personCi`, `checkedBy`: `{ userId, firstName, lastName, email }`, `action` (validated|already_used|invalid), `previousAvailable`, `newAvailable`, `timestamp`.

### Pagos procesados (processed-payments)

Registro unificado de pagos procesados (cursos, suscripciones a planes de gestoría, trámites de flota, etc.). Estructura:

- **paymentId**: string único (ID de Mercado Pago o identificador dev/simulación).
- **user**: objeto embebido — `id` (ObjectId ref users), `email`, `firstName`, `lastName`.
- **item**: objeto — `type` (enum: `course`, `subscription`, `procedure`, `service`, `other`), `id` (opcional, ej. courseId, planId, requestId), `name` (nombre del concepto; para procedures el frontend construye la etiqueta desde metadata).
- **amount**: objeto — `value` (número), `currency` (string).
- **paymentStatus**: enum `approved`, `pending`, `rejected`, `cancelled`, `refunded`.
- **paymentStatusDetail**, **externalReference**: strings. Para procedures, `externalReference` conserva el valor de Mercado Pago (`procedure|pendingId` o `procedure|requestId`); no incluye datos del barco.
- **provider**: string (default `mercadopago`).
- **processedAt**: Date.
- **metadata**: Mixed. Por tipo de item:
  - **course**: `alreadyPurchased` (boolean, si el usuario ya tenía el curso comprado).
  - **procedure**: `requestType` (ej. "Solicitud de flota", "Solicitud de gente de mar", "Solicitud especial"), `procedureTypes` (array, ej. "Emisión inicial", "Renovación por vencimiento"), `shipId`, `shipName`, `registrationNumber` (datos del barco para listados y recibos).
  - **subscription**: `planId`, `userId` u otros según el flujo.
- **errorMessage**: string opcional.

La API de listado (`GET /api/mercadopago/processed-payments`) devuelve documentos normalizados a esta estructura; documentos antiguos (con `courseId`, `userId`, etc. en raíz) se mapean en la respuesta para compatibilidad. El panel de gestión de pagos (GestionPagos) muestra: columna **Metadata** — para procedures, nombre e id del barco; para cursos, si ya estaba comprado (Sí/No); para planes, guión; columna **Concepto** — para procedures, etiqueta según `requestType` ("Trámite de flota", "Trámite de gente de mar", "Trámite especial") seguida de `procedureTypes` separados por comas; botón **Ver recibo** (preparado para generación de PDF).

### Transacción de wallet (transactions)

Registro de cada movimiento de la wallet (ingresos, reembolsos, retiros). Colección `transactions`.

- **userId**: ObjectId ref users (receptor o titular del movimiento).
- **type**: enum `course_sale`, `service_payment`, `refund`, `withdrawal`, `adjustment`.
- **sourceType**: enum `course`, `service`.
- **sourceId**: ObjectId (curso, solicitud, etc.).
- **paymentId**: string opcional (ID de Mercado Pago o ref para idempotencia).
- **grossAmount**, **fee**, **netAmount**: números (en refund/withdrawal los montos son negativos).
- **status**: enum `pending`, `available`, `paid`. Ingresos empiezan en pending y pasan a available tras el hold.
- **availableAt**: Date; para ingresos pending indica cuándo pasan a disponibles.
- **currency**: string, default "USD".
- Timestamps (`createdAt`, `updatedAt`).

---

### Código de descuento (discount-codes)

- `_id`: identificador asignado por la base de datos.
- `code`: string único, elegido por el administrador (se guarda en mayúsculas).
- `percentage`: número entre 0 y 100, descuento a aplicar sobre el precio.
- `description`: string que explica el motivo del código (festividad, creador de contenido, etc.).
- `quantity`: número entero ≥ 0; **número fijo** de usos permitidos (no se decrementa). Los usos reales = `usedBy.length`; cuando `usedBy.length === quantity` el código no se puede usar más.
- `usedBy`: array de ObjectIds de usuarios que ya usaron el código (empieza vacío). Cada usuario solo puede usarlo una vez.
- `isActive`: boolean, default `true`. Pasa a `false` cuando, tras un uso, `usedBy.length` coincide con `quantity`.
- Timestamps (`createdAt`, `updatedAt`).

---

## Nota sobre rutas de métodos de pago

Existe funcionalidad de métodos de pago (agregar, listar, eliminar, marcar por defecto) que **no está expuesta** en la API actual. Para habilitarla en el futuro debe configurarse en el servidor.

---

*Documentación generada a partir del análisis del backend LATIAS. Para dudas sobre integración con el frontend o variables de entorno, consultar el README del proyecto.*

---

## Contacto del desarrollador

**Nombre:** Joaquín Pérez Coria  
**LinkedIn:** [https://www.linkedin.com/in/joaquin-perez-coria](https://www.linkedin.com/in/joaquin-perez-coria)  
**Sitio web / Portafolio:** [https://jpc-dev.uy](https://jpc-dev.uy)  

---

## Licencia

Copyright (c) 2026 JPC Dev  

Este proyecto está bajo la Licencia MIT.  
Se permite usar, copiar, modificar, fusionar, publicar, distribuir, sublicenciar y/o vender copias del software. 