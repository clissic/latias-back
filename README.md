# LATIAS Academia

**Descripción:**  
LATIAS Academia es una plataforma de aprendizaje online enfocada en cursos de náutica y supervivencia, entre otros. La aplicación permite a los cadetes acceder a cursos desarrollados por profesionales del mar, utilizando herramientas de inteligencia artíficial para la generación de videos y diálogos, evaluaciones profesionales y académicas en conjunto con exámenes finales para la obtención de certificados oficiales, generados automáticamente al completar los cursos. En cuanto a los aspéctos técnicos, la plataforma está desarrollada con el stack MERN y utiliza Bootstrap para la interfaz gráfica para mantener un diseño responsive y prolijo.

---

## Características principales

- Gestión de usuarios con roles: Cadetes, Instructores, Administradores y Gestores.  
- Creación y gestión de cursos (CRUD).  
- Utilización de plataformas externas de IA para generar avatares, diálogos y voces de los instructores.  
- Videos protegidos para evitar distribución no autorizada.  
- Evaluaciones automáticas tipo test.  
- Generación automática de diplomas en PDF.  
- Pagos con Mercado Pago (con posibilidad de agregar otras pasarelas más adelante).  
- Panel de administración para gestión de usuarios, cursos y entregables.  
- Flota de barcos por usuario, certificados por barco y solicitudes a gestor (renovación, preparación, asesoramiento).  

---

## Roadmap de desarrollo

La siguiente lista detalla los **100 pasos** planeados para el desarrollo completo de la plataforma:

✔️ CUMPLIDO (1% cada uno) - 🟡 EN DESARROLLO (0.5% cada uno) - ❌ INCUMPLIDO (0%)

**Progreso del proyecto: 48.5% completado**
- ✔️ Completados: 47 puntos (48%)
- 🟡 En desarrollo: 1 puntos (0.5%)
- ❌ Pendientes: 51 puntos (0%)

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
❌ 36. Seleccionar plataforma de videos externa segura (ej. YouTube privado, Vimeo, etc.).  
❌ 37. Definir flujo para que los instructores generen y editen videos externamente.  
✔️ 38. Al crear un curso, permitir que el instructor ingrese la URL del video externo.  
❌ 39. Configurar permisos para que solo cadetes inscritos puedan acceder al video.  
❌ 40. Crear endpoints para obtener las URLs de los videos por curso.  
❌ 41. Mostrar videos en reproductor seguro dentro de la app.  
❌ 42. Implementar control de progreso de visualización por cadete.  
❌ 43. Guardar el progreso de reproducción en la base de datos interna de la app.  
❌ 44. Mostrar avance de los cadetes en el dashboard.  
❌ 45. Probar flujo completo de publicación de curso con videos externos.  
❌ 46. Documentar cómo se integran los videos externos en la plataforma.  
❌ 47. Establecer pautas para que los instructores mantengan sus videos privados.  
❌ 48. Validar que los videos sean compatibles con la app y reproducibles en todos los dispositivos.  
❌ 49. Asegurar consistencia entre videos, módulos y evaluaciones en la app.  
❌ 50. Mantener seguridad y privacidad de los enlaces de video frente a distribución no autorizada.  

### Evaluaciones y corrección automática (51-65)
❌ 51. Crear modelo de evaluación (preguntas tipo test).  
❌ 52. Crear endpoints para CRUD de evaluaciones.  
❌ 53. Crear interfaz de instructor para crear exámenes.  
❌ 54. Implementar preguntas de opción múltiple.  
❌ 55. Guardar respuestas de cadetes.  
❌ 56. Implementar corrección automática de test.  
❌ 57. Guardar resultados en base de datos.  
❌ 58. Mostrar resultados a cadetes.  
❌ 59. Crear ranking o listado de resultados (opcional inicial).  
❌ 60. Probar flujo completo de evaluación.  
❌ 61. Manejar reintentos y límites de exámenes.  
❌ 62. Testear seguridad de evaluaciones.  
❌ 63. Documentar flujo de evaluación.  
❌ 64. Integrar generación automática de diplomas (PDF).  
❌ 65. Subir diplomas generados a perfil del cadete.  

### Pagos y monetización (66-75)
✔️ 66. Configurar cuenta de Mercado Pago.  
🟡 67. Crear modelo de transacción en base de datos.  
✔️ 68. Crear endpoints para pagos y verificación.  
✔️ 69. Implementar frontend para proceso de compra.  
✔️ 70. Integrar webhooks de Mercado Pago para confirmar pagos.  
✔️ 71. Marcar cursos comprados en perfil de cadete.  
❌ 72. Restringir acceso a cursos no comprados.  
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
❌ 82. Visualizar historial de pagos y transacciones.  
❌ 83. Revisar entregas de cadetes.  
❌ 84. Probar funcionalidades administrativas.  
❌ 85. Documentar uso del panel de administración.  

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

Documentación de los endpoints del backend de LATIAS Academia. El servidor expone la API bajo el prefijo `/api` y utiliza tokens Bearer (JWT) para autenticación en rutas protegidas. Incluye: usuarios y roles (Cadete, Instructor, Administrador, Gestor, checkin), cursos, eventos, barcos y flota, certificados, **solicitudes a gestor** (ship-requests), instructores, contacto, Mercado Pago y subida de archivos.

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
14. [Mercado Pago (`/api/mercadopago`)](#mercado-pago-apimercadopago)
15. [Upload (`/api/upload`)](#upload-apiupload)
16. [Archivos estáticos](#archivos-estáticos)
17. [Modelos de datos](#modelos-de-datos)

Para una revisión de seguridad de los endpoints, ver **SECURITY_AUDIT.md** en la raíz del proyecto.

---

## Información general

- **Base URL:** `http://localhost:5000` (o la URL del servidor desplegado)
- **Prefijo API:** `/api`
- **Content-Type:** `application/json` para request/response en la mayoría de los endpoints. Excepciones: `multipart/form-data` en uploads.
- **Codificación:** UTF-8

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
| POST | `/logout` | Sí | Cualquiera | Cerrar sesión (stateless). |
| PUT | `/update-password` | Sí | Cualquiera | Cambiar contraseña. |
| POST | `/fleet/request` | Sí | Cualquiera | Solicitar agregar barco a mi flota. |
| GET | `/fleet` | Sí | Cualquiera | Obtener mi flota (barcos solicitados/aprobados). |
| DELETE | `/fleet/:boatId` | Sí | Cualquiera | Quitar barco de mi flota. |
| PUT | `/fleet/update-status` | Sí | Administrador | Aprobar/rechazar solicitud de flota. |
| GET | `/` | Sí | Administrador | Listar todos los usuarios. |
| GET | `/findByEmail` | Sí | Administrador | Buscar usuario por email (query). |
| GET | `/findByCi` | Sí | Administrador | Buscar usuario por CI (query). |
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
| POST | `/purchase/:userId` | Sí | Propietario/Admin | Comprar curso para userId. |
| GET | `/user/:userId/purchased` | Sí | Propietario/Admin | Cursos comprados del usuario. |
| PUT | `/user/:userId/course/:courseId/progress` | Sí | Propietario/Admin | Actualizar progreso. |
| PUT | `/user/:userId/course/:courseId/attempt` | Sí | Propietario/Admin | Agregar intento de examen. |
| PUT | `/user/:userId/course/:courseId/certificate` | Sí | Propietario/Admin | Actualizar certificado del usuario en el curso. |
| POST | `/request-modification/:courseId` | Sí | Instructor | Solicitar modificación de curso. |

### Detalle (resumen)

- **GET públicos:** Devuelven curso(s) en `payload`. 404 si no hay resultados.
- **POST `/create`:** Body con `courseId`, `sku`, `courseName`, `price`, `category` requeridos; opcionales: `bannerUrl`, `image`, `shortImage`, `currency`, `shortDescription`, `longDescription`, `duration`, `difficulty`, `professor`, `modules`, `selectedInstructorId`. Respuesta 201 con curso creado.
- **PUT `/update/:courseId`:** Body con campos a actualizar. 200 con curso actualizado, 404 si no existe.
- **DELETE `/delete/:courseId`:** 200 al eliminar, 404 si no existe.
- **PUT `/certificate/:courseId`:** Actualiza datos del certificado del curso (campos según implementación).
- **POST `/purchase/:userId`:** Asocia el curso al usuario (sin pago directo; para flujo Mercado Pago se usa otro flujo). Solo el propio usuario o un administrador puede realizar la operación.
- **GET `/user/:userId/purchased`:** Lista cursos comprados del usuario. Solo el propio usuario o un administrador puede consultar.
- **PUT `.../progress`:** Body con progreso (módulos/lecciones completadas). Solo el propio usuario o un administrador puede consultar.
- **PUT `.../attempt`:** Registra intento de examen. Solo el propio usuario o un administrador puede consultar.
- **PUT `.../certificate`:** Actualiza certificado del usuario en ese curso. Solo el propio usuario o un administrador puede consultar.
- **POST `/request-modification/:courseId`:** Solo Instructor; envía solicitud de modificación (detalle según implementación).

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

**annualInspection:** `realizada`, `no_realizada`, `no_corresponde`.

---

## Solicitudes a gestor (`/api/ship-requests`)

Solicitudes de trabajo de un cliente (owner) hacia un gestor (manager) sobre un barco: renovación, preparación o asesoramiento de certificados. Todas las rutas requieren **autenticación** (Bearer token).

| Método | Ruta | Auth | Rol / Restricción | Descripción |
|--------|------|------|-------------------|-------------|
| POST | `/` | Sí | Cualquiera | Crear solicitud (body: ship, owner?, manager, type/types, notes?). |
| POST | `/certificate` | Sí | Cualquiera | Crear solicitud desde certificado (flota) y enviar email al gestor. |
| GET | `/` | Sí | Administrador o Gestor | Listar todas (query: status, owner, manager, ship). |
| GET | `/owner/:ownerId` | Sí | Propietario o Admin | Solicitudes del owner (solo el propio usuario o Admin). |
| GET | `/manager/:managerId` | Sí | Gestor o Admin | Solicitudes del gestor (solo el gestor o Admin). |
| GET | `/ship/:shipId` | Sí | Cualquiera | Solicitudes del barco. |
| GET | `/:id` | Sí | Cualquiera | Obtener una solicitud por ID. |
| PATCH | `/:id/status` | Sí | Administrador o Gestor asignado | Actualizar estado. |
| PUT | `/:id` | Sí | Administrador o Gestor asignado | Actualizar solicitud. |
| DELETE | `/:id` | Sí | Administrador o owner | Eliminar solicitud. |

### Detalle (resumen)

- **POST `/`:** Body: `ship` (ObjectId), `owner` (opcional, default usuario autenticado), `manager` (ObjectId), `type` o `types` (array: "Renovación", "Preparación", "Asesoramiento"), `notes` (opcional). 201 con solicitud creada.
- **POST `/certificate`:** Body: `shipId`, `certificate` (objeto con certificateType, number, issueDate, expirationDate), `types` (array no vacío), `notes` (opcional). El usuario debe tener gestor asignado (`manager.managerId`). Crea la solicitud y envía email al gestor. 201 con solicitud creada. 400 si no hay gestor asignado.
- **GET `/`:** Query opcionales: `status`, `owner`, `manager`, `ship`. `payload`: array de solicitudes.
- **GET `/owner/:ownerId`**, **GET `/manager/:managerId`:** `payload`: array de solicitudes. Validación de ownership: solo el propio usuario o Administrador.
- **GET `/ship/:shipId`:** `payload`: array de solicitudes del barco.
- **GET `/:id`:** `payload`: solicitud poblada (ship, owner, manager). 404 si no existe.
- **PATCH `/:id/status`:** Body: `status` (requerido: "Pendiente", "En progreso", "Completado", "Rechazado"), `completedAt` (opcional), `rejectionReason` (obligatorio si status es "Rechazado"). Envía email al owner al cambiar estado. 200 con solicitud actualizada.
- **PUT `/:id`:** Body con campos a actualizar. 200 con solicitud actualizada. 404 si no existe.
- **DELETE `/:id`:** Solo Administrador o el owner de la solicitud. 200 al eliminar. 403 si no tiene permiso. 404 si no existe.

**status:** `Pendiente`, `En progreso`, `Completado`, `Rechazado`. **type:** array de `Renovación`, `Preparación`, `Asesoramiento`.

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
| POST | `/process-successful-payment` | Sí | Procesar pago aprobado y asociar curso al usuario. |

### Detalle (resumen)

- **POST `/webhook`:** Body con `type` y datos del evento. Siempre responde 200 para evitar reintentos de Mercado Pago. Procesamiento según tipo de evento.
- **GET `/payment-methods`:** `payload.paymentMethods`: array de métodos de pago.
- **POST `/create-preference`:** Body: `courseId`, `courseName`, `price`, `userId` requeridos; opcional: `currency`. Verifica que el curso exista. Respuesta: `preferenceId`, `initPoint`, `sandboxInitPoint`. 404 si curso no existe. Solo se pueden crear preferencias para la propia cuenta (o por un administrador).
- **GET `/preference/:preferenceId`:** `payload.preference`: objeto preferencia.
- **GET `/payment/:paymentId`:** `payload.payment`: pago. 403 si el usuario no tiene permiso para ver ese pago.
- **POST `/create-payment`:** Body: `transaction_amount`, `description`, `payment_method_id`, `payer` requeridos; opcionales: `installments`, `external_reference`. Crea pago en Mercado Pago.
- **POST `/refund/:paymentId`:** Body opcional: `amount`. Crea reembolso. 200 con `payload.refund`.
- **GET `/payment-status/:paymentId`:** `payload`: `paymentId`, `status`, `statusDetail`, `transactionAmount`, `externalReference`. 403 si el usuario no tiene permiso para consultar ese pago.
- **POST `/process-successful-payment`:** Body: `paymentId`. El pago debe estar aprobado. Asocia el curso al usuario correspondiente al pago. Solo el usuario dueño del pago o un administrador puede ejecutar esta acción. 200 con resultado; si el curso ya estaba comprado, 200 con mensaje de "ya asociado".

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

### Respuestas

- **200:** `payload`: para una imagen, `imagePath` o `profileImage`/`image`/`pdfFile` y `filename`; para course-images, objeto con `bannerUrl`, `image`, `shortImage` (rutas relativas).
- **400:** No se envió archivo o el archivo no cumple tipo/tamaño permitido. Para imágenes: límite de tamaño y formatos jpeg, jpg, png, gif, webp según configuración del servidor.

Los archivos subidos se sirven bajo rutas relativas del tipo `/uploads/...` (ruta base según despliegue).

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
- `purchasedCourses`, `finishedCourses`, `paymentMethods`: arrays.
- `fleet`: `[{ boatId, requestedAt, status: pending|approved|rejected }]`.
- `manager`: `{ active, managerId }`.
- `lastLogin`: Date.

### Curso (courses)

- `courseId`, `sku`, `courseName` — identificadores y nombre; `bannerUrl`, `image`, `shortImage`, `currency`, `shortDescription`, `longDescription`, `duration`, `price`, `difficulty`, `category`.
- `certificate`: `{ certificateId, certificateUrl, credentialNumber }`.
- `professor`: array de `{ firstName, lastName, profession }`.
- `modules`: array de módulos con `moduleId`, `moduleName`, `moduleDescription`, `lessons` (lessonId, lessonName, lessonDescription, videoUrl), `questionBank` (preguntas y opciones).

### Evento (events)

- `eventId` (único, sparse), `title`, `date`, `hour`, `active`, `price`, `currency`, `description`, `image`.
- `tickets`: `{ availableTickets, soldTickets, remainingTickets }`.
- `location`: `{ city, country, address }`.
- `speaker`: `{ firstName, lastName, ci, profession, position }`.
- `peopleRegistered`: `[{ firstName, lastName, ci, ticketId, available, registeredAt }]`.

### Barco (boats)

- `owner` (ObjectId ref users), `name`, `registrationNumber` (único), `registrationCountry`, `registrationPort`, `currentPort`, `boatType` (enum), `lengthOverall`, `beam`, `depth`, `displacement`, `image`, `isActive`. Timestamps.

### Certificado (certificates)

- `boatId` (ObjectId ref boats), `certificateType`, `number`, `issueDate`, `expirationDate`, `status` (vigente|vencido|anulado), `observations`, `pdfFile`, `annualInspection` (realizada|no_realizada|no_corresponde). Timestamps.

### Instructor (professors)

- `firstName`, `lastName`, `ci` (único, número), `profileImage`, `profession`, `experience`, `bio`, `certifications`, `achievements`, `courses` (array de courseId), `contact`: `{ email, phone }`, `socialMedia`. Timestamps.

### Solicitud a gestor (ship-requests)

- `ship` (ObjectId ref boats), `owner` (ObjectId ref users), `manager` (ObjectId ref users), `type` (array de "Renovación", "Preparación", "Asesoramiento"), `status` ("Pendiente", "En progreso", "Completado", "Rechazado"), `requestedAt`, `completedAt`, `notes`, `rejectionReason`. Timestamps.

### Ticket Log (ticket-logs)

- `ticketId`, `eventId`, `eventTitle`, `personFirstName`, `personLastName`, `personCi`, `checkedBy`: `{ userId, firstName, lastName, email }`, `action` (validated|already_used|invalid), `previousAvailable`, `newAvailable`, `timestamp`.

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

Copyright (c) 2025 JPC Dev  

Este proyecto está bajo la Licencia MIT.  
Se permite usar, copiar, modificar, fusionar, publicar, distribuir, sublicenciar y/o vender copias del software. 