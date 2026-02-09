# Auditoría de seguridad de la API - LATIAS Backend

Resumen de la revisión de endpoints y protecciones aplicadas.

---

## Resumen ejecutivo

Se revisaron todas las rutas del backend y se corrigieron **tres vulnerabilidades críticas** que permitían acciones no autorizadas sin validación adecuada. El resto de endpoints ya estaba correctamente protegido con middlewares de autenticación y autorización.

---

## Estado actual por recurso

### `/api/users`
| Ruta | Auth | Rol | Estado |
|------|------|-----|--------|
| POST /login | No | — | Público (correcto) |
| POST /refresh-token | No | — | Público (correcto) |
| POST /create | No | — | Público registro (correcto) |
| GET /profile | Sí | Cualquiera | Protegido ✓ |
| POST /logout | Sí | Cualquiera | Protegido ✓ |
| PUT /update-password | Sí | Cualquiera | Protegido ✓ |
| POST /fleet/request | Sí | Cualquiera | Protegido ✓ |
| GET /fleet | Sí | Cualquiera | Protegido ✓ |
| DELETE /fleet/:boatId | Sí | Cualquiera | Protegido ✓ |
| PUT /fleet/update-status | Sí | Administrador | Protegido ✓ |
| GET /, findByEmail, findByCi, /:id | Sí | Administrador | Protegido ✓ |
| PUT /update, DELETE /:id | Sí | Administrador | Protegido ✓ |

### `/api/tokens`
| Ruta | Auth | Validación adicional | Estado |
|------|------|----------------------|--------|
| POST /recoverForm | No | **Token + email validados en BD, expiración, un solo uso** | Corregido ✓ |
| POST /recoverPassword | No | Envía token por email (público) | Correcto |
| GET /recoverPassword | No | Valida token y email (query) | Correcto |

**Corrección aplicada:** POST /recoverForm ahora exige `token` y `email` en el body, valida el token contra la base de datos, comprueba que no haya expirado y elimina el token tras usarlo (un solo uso). Antes cualquiera podía cambiar la contraseña de cualquier usuario solo con el email.

### `/api/courses`
| Ruta | Auth | Rol / validación | Estado |
|------|------|-------------------|--------|
| GET /, /id/:id, /courseId/:courseId, etc. | No | Público catálogo | Correcto |
| POST /create, PUT /update/:courseId, etc. | Sí | Administrador | Protegido ✓ |
| POST /purchase/:userId, GET /user/:userId/purchased, etc. | Sí | validateUserOwnership | Protegido ✓ |
| POST /request-modification/:courseId | Sí | Instructor | Protegido ✓ |

### `/api/events`
| Ruta | Auth | Rol | Estado |
|------|------|-----|--------|
| GET /active, /id/:id, /eventId/:eventId | No | Público | Correcto |
| POST /purchase/:eventId | Sí | Cualquiera | Protegido ✓ |
| GET /verify/:ticketId | No | Público (solo lectura ticket) | Correcto |
| GET /checkin/verify/:ticketId, /checkin/logs | Sí | checkin | Protegido ✓ |
| GET /, POST /create, PUT /update/:eventId, etc. | Sí | Administrador | Protegido ✓ |

### `/api/boats`
| Ruta | Auth | Validación adicional | Estado |
|------|------|----------------------|--------|
| GET /active, /id/:id, /registration/:registrationNumber | No | Público | Correcto |
| GET /owner/:ownerId | Sí | — | Protegido ✓ |
| POST /request-registration | Sí | — | Protegido ✓ |
| GET /registration/approve/:id | No | **Token de aprobación validado contra BD** | Corregido ✓ |
| GET /registration/reject/:id | No | **Token de rechazo validado contra BD** | Corregido ✓ |
| GET /, POST /create, PUT /update/:id, etc. | Sí | Administrador | Protegido ✓ |

**Corrección aplicada:** Se añadieron campos `approvalToken` y `rejectionToken` al modelo de barcos. Al solicitar registro se guardan los tokens; en approve/reject se exige que el token de la query coincida con el guardado. Tras aprobar se limpian los tokens (un solo uso). Antes cualquiera podía aprobar o rechazar cualquier barco con solo conocer el ID.

### `/api/certificates`
| Ruta | Auth | Rol | Estado |
|------|------|-----|--------|
| GET /id/:id, /boat/:boatId, /status/:status, etc. | No | Público | Correcto (catálogo/consulta) |
| GET / | Sí | Administrador | Protegido ✓ |
| POST /create, PUT /update/:id, DELETE /delete/:id | Sí | Cualquiera autenticado | Protegido ✓ |

### `/api/professors`
| Ruta | Auth | Rol | Estado |
|------|------|-----|--------|
| GET /, /id/:id, /ci/:ci, /course/:courseId | No | Público | Correcto |
| POST /create, PUT /update/:id, DELETE /delete/:id | Sí | Administrador | Protegido ✓ |

### `/api/contact`
| Ruta | Auth | Estado |
|------|------|--------|
| POST /send | No | Público (formulario de contacto, correcto) |

### `/api/mercadopago`
| Ruta | Auth | Validación adicional | Estado |
|------|------|----------------------|--------|
| POST /webhook | No | Llamado por Mercado Pago | Correcto |
| GET /payment-methods | No | Solo lectura métodos | Correcto |
| POST /create-preference | Sí | validateUserOwnership | Protegido ✓ |
| GET /preference/:preferenceId, GET /payment/:paymentId | Sí | Propiedad en controller | Protegido ✓ |
| POST /create-payment | Sí | — | Protegido ✓ |
| POST /refund/:paymentId | Sí | **Propiedad del pago (external_reference) en controller** | Corregido ✓ |
| GET /payment-status/:paymentId | Sí | Propiedad en controller | Protegido ✓ |
| POST /process-successful-payment | Sí | Propiedad en controller | Protegido ✓ |

**Corrección aplicada:** En refund se obtiene el pago, se extrae el userId del `external_reference` y se verifica que coincida con el usuario autenticado o que sea Administrador. Antes cualquier usuario autenticado podía solicitar reembolso de cualquier pago.

### `/api/upload`
| Ruta | Auth | Rol | Estado |
|------|------|-----|--------|
| POST /course-image, /course-images, /professor-image, /event-image | Sí | Administrador | Protegido ✓ |
| POST /boat-image, /certificate-pdf | Sí | Cualquiera | Protegido ✓ |

---

## Cambios realizados en código

1. **tokens.controller.js**  
   - `recoverPass`: exige `token` y `email` en body, valida token con `findOne({ token, email })`, comprueba `expire`, actualiza contraseña y llama a `deleteOne` para invalidar el token.

2. **tokens.service.js** y **tokens.model.js**  
   - Nuevo método `deleteOne({ token, email })` para borrar el token tras usarlo.

3. **boats.mongoose.js**  
   - Campos opcionales `approvalToken` y `rejectionToken` en el schema.

4. **boats.controller.js**  
   - `requestRegistration`: genera y guarda `approvalToken` y `rejectionToken` en el barco tras crearlo.  
   - `approveRegistration`: valida que `req.query.token === boat.approvalToken`; tras aprobar, limpia ambos tokens.  
   - `rejectRegistration`: valida que `req.query.token === boat.rejectionToken`.

5. **mercadopago.controller.js**  
   - `refundPayment`: obtiene el pago, extrae userId de `external_reference`, compara con `req.user.userId` o permite si `req.user.category === 'Administrador'`; si no, responde 403.

6. **Frontend ResetPass.jsx**  
   - Inclusión de `token` en el body de la petición POST a `/api/tokens/recoverForm` para cumplir con la nueva validación del backend.

---

## Recomendaciones adicionales

- **Webhook Mercado Pago:** En producción, validar la firma del webhook (headers `x-signature`, `x-request-id`) según la documentación de Mercado Pago.
- **Contacto POST /send:** Valorar rate limiting o CAPTCHA para reducir spam y abuso.
- **Certificados públicos (GET por barco/estado):** Si en el futuro se considera información sensible, restringir por autenticación o por ownership del barco.
- **Eventos GET /verify/:ticketId:** Los ticketId deben ser impredecibles (por ejemplo UUID) para evitar enumeración; el flujo actual es aceptable si así se generan.

---

*Auditoría realizada sobre el estado del backend LATIAS. Revisar tras cambios futuros en rutas o middlewares.*
