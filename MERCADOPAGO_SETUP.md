# Configuración y Pruebas de Mercado Pago

Esta guía explica cómo configurar y probar la integración con **Checkout Pro** de Mercado Pago en el proyecto LATIAS Academia.

## Checkout Pro – Flujo implementado

La integración sigue la [documentación oficial de Checkout Pro](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/overview):

1. **Backend**: Crear preferencia de pago (items, `back_urls`, `auto_return`, `notification_url`, `external_reference`).
2. **Frontend**: SDK con Public Key; componente **Wallet** con `preferenceId`; el usuario es redirigido al checkout de Mercado Pago.
3. **Retorno**: Mercado Pago redirige a las `back_urls` con `payment_id`/`collection_id`, `status`, etc. La app verifica el pago en el backend.
4. **Notificaciones**: Webhook recibe notificaciones (formato `type`/`action` + `data.id`). Opcional: validación de firma con `MERCADOPAGO_WEBHOOK_SECRET`.

## 📋 Requisitos Previos

1. Tener una cuenta de Mercado Pago (real o de prueba)
2. Crear una aplicación en el [Panel de Desarrolladores de Mercado Pago](https://www.mercadopago.com/developers/panel/app)
3. Obtener las credenciales de acceso (Access Token)

## 🔧 Configuración Inicial

### 1. Crear Aplicación en Mercado Pago

1. Ve al [Panel de Desarrolladores de Mercado Pago](https://www.mercadopago.com/developers/panel/app)
2. Crea una nueva aplicación o selecciona una existente
3. Obtén tu **Access Token** desde la sección "Credenciales de prueba"

### 2. Configurar Variables de Entorno

#### Backend

En tu archivo `.env.development` del backend (o `.env` según tu entorno), agrega:

```env
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxx
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
# Opcional: validar firma del webhook (Tus integraciones > Webhooks > Configurar notificaciones > Clave secreta)
# MERCADOPAGO_WEBHOOK_SECRET=tu_clave_secreta
```

**Importante:** 
- Usa el Access Token de la cuenta **VENDEDOR** (no del comprador)
- En producción, usa las credenciales de producción

#### Frontend

En tu archivo `.env` o `.env.local` del frontend, agrega:

```env
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxx
```

**⚠️ IMPORTANTE - CRÍTICO:**
- Esta es la **Public Key** (clave pública), no el Access Token
- La Public Key se obtiene desde: **Tus integraciones > Detalles de aplicación > Credenciales de prueba > Public Key**
- **DEBE ser de la MISMA aplicación y MISMA cuenta que el Access Token del backend**
- Si el Access Token es de la aplicación "App A", la Public Key también debe ser de "App A"
- En Vite, las variables de entorno deben empezar con `VITE_` para ser expuestas al frontend
- En producción, usa la Public Key de producción (de la misma aplicación que el Access Token de producción)

## 🧪 Configuración de Cuentas de Prueba

Para probar la integración correctamente, necesitas crear **cuentas de prueba** en Mercado Pago:

### Pasos para Crear Cuentas de Prueba

1. En el [Panel de Desarrolladores](https://www.mercadopago.com/developers/panel/app), selecciona tu aplicación
2. Ve a la sección **"Cuentas de prueba"**
3. Haz clic en **"Crear cuenta de prueba"**
4. Completa el formulario:
   - **País de operación**: Selecciona el país (ej: Uruguay, Argentina)
     - ⚠️ **IMPORTANTE**: El país no se puede cambiar después
     - ⚠️ **IMPORTANTE**: Vendedor y Comprador deben ser del mismo país
   - **Descripción**: Ej: "Vendedor - LATIAS Academia" o "Comprador - Pruebas"
   - **Tipo de cuenta**: Selecciona **Vendedor** o **Comprador**
   - **Saldo ficticio**: Ingresa un monto para pruebas (ej: 10000)
5. Haz clic en **"Crear cuenta de prueba"**

### Tipos de Cuentas Necesarias

#### Cuenta VENDEDOR
- **Propósito**: Configurar la aplicación y credenciales
- **Uso**: Esta es tu cuenta principal
- **Access Token**: Usa este token en `MERCADOPAGO_ACCESS_TOKEN`
- **Nota**: Esta cuenta recibe los pagos

#### Cuenta COMPRADOR
- **Propósito**: Probar el proceso de compra
- **Uso**: Inicia sesión con esta cuenta para simular compras
- **Nota**: Esta cuenta realiza los pagos de prueba

### Información de las Cuentas de Prueba

Cada cuenta de prueba tiene:
- **User ID**: Identificación única (últimos 6 dígitos para autenticación)
- **Usuario**: Nombre de usuario generado automáticamente
- **Contraseña**: Contraseña generada automáticamente
- **Saldo ficticio**: Dinero disponible para pruebas

**Nota:** Puedes crear hasta 15 cuentas de prueba simultáneamente.

## 🔐 Iniciar Sesión con Usuarios de Prueba

Al iniciar sesión en la web de Mercado Pago con un usuario de prueba, es posible que se solicite autenticación por email.

Como son usuarios ficticios, no tendrás acceso al email. En su lugar:

1. Usa los **últimos 6 dígitos del User ID** de la cuenta de prueba, O
2. Usa los **últimos 6 dígitos del Access Token** de la cuenta

### Dónde Encontrar el User ID y Access Token

- **User ID**: En la tabla de "Cuentas de prueba" del Panel de Desarrolladores
- **Access Token**: En la sección "Credenciales" de tu aplicación

## 💳 Tarjetas de Prueba

Mercado Pago proporciona tarjetas de prueba para simular diferentes escenarios:

### Tarjetas Aprobadas
- **Visa**: `4509 9535 6623 3704`
- **Mastercard**: `5031 7557 3453 0604`
- **American Express**: `3711 803032 57522`

### Tarjetas Rechazadas
- **Visa rechazada**: `4013 5406 8274 6260`
- **Mastercard rechazada**: `5031 4332 1540 6351`

### Datos de Prueba Comunes
- **CVV**: Cualquier número de 3 dígitos (ej: 123)
- **Fecha de vencimiento**: Cualquier fecha futura (ej: 11/25)
- **Nombre del titular**: Cualquier nombre
- **DNI**: Cualquier número (ej: 12345678)

**Documentación completa:** [Tarjetas de Prueba de Mercado Pago](https://www.mercadopago.com/developers/es/docs/your-integrations/test/cards)

## 🧪 Probar el Flujo Completo

### 1. Configurar el Backend

```bash
# Asegúrate de tener las variables de entorno configuradas
cd latias-back
npm install
npm run dev
```

### 2. Configurar el Frontend

```bash
cd latias-front
npm install
npm run dev
```

### 3. Probar el Flujo de Pago

1. **Inicia sesión** en la aplicación con un usuario cadete
2. **Navega** a un curso disponible
3. **Haz clic** en "Comprar" o "Inscribirse"
4. **Selecciona** "Mercado Pago" como método de pago
5. **Haz clic** en "Pagar"
6. **Serás redirigido** a Mercado Pago
7. **Inicia sesión** con la cuenta COMPRADOR de prueba
8. **Usa una tarjeta de prueba** para completar el pago
9. **Serás redirigido** de vuelta a la aplicación
10. **Verifica** que el curso aparezca en tu dashboard

### 4. Verificar el Webhook

El webhook se ejecuta automáticamente cuando Mercado Pago confirma el pago. Para verificar:

1. Revisa los logs del backend
2. Busca mensajes como: `"Notificación de pago recibida"`
3. Verifica que el curso se agregue automáticamente al usuario

## 🔍 Verificar el Estado de los Pagos

Puedes verificar el estado de los pagos desde:

1. **Panel de Mercado Pago**: Ve a "Tus ventas" en tu cuenta de vendedor
2. **Logs del Backend**: Revisa los logs para ver el procesamiento
3. **Base de Datos**: Verifica que el curso se agregue a `purchasedCourses` del usuario

## ⚠️ Problemas Comunes

### Error: "Token inválido"
- **Causa**: El Access Token no es válido o está mal configurado
- **Solución**: Verifica que `MERCADOPAGO_ACCESS_TOKEN` esté correctamente configurado en `.env.development`

### Error: "Una de las partes con la que intentas hacer el pago es de prueba"
- **Causa**: Estás usando la misma cuenta para vender y comprar, o las credenciales no coinciden
- **Solución**: 
  1. **Verifica que tengas DOS cuentas de prueba diferentes:**
     - Cuenta VENDEDOR: Usa el Access Token de esta cuenta en `MERCADOPAGO_ACCESS_TOKEN` (backend)
     - Cuenta COMPRADOR: Inicia sesión con esta cuenta en Mercado Pago para hacer el pago
  2. **Asegúrate de que ambas cuentas sean del mismo país**
  3. **Verifica que el Access Token en el backend sea de la cuenta VENDEDOR:**
     - Ve a: Panel de Desarrolladores > Tu aplicación > Credenciales de prueba
     - El Access Token debe ser de la cuenta VENDEDOR (no del comprador)
  4. **Cuando hagas el pago:**
     - NO inicies sesión con la cuenta VENDEDOR
     - Inicia sesión con la cuenta COMPRADOR (diferente)
     - O usa una tarjeta de prueba sin iniciar sesión
- **Recurso adicional**: [Guía detallada sobre este error en sandbox](https://www.mexico.com.se/2025/03/una-de-las-partes-con-la-que-intentas-hacer-el-pago-es-de-prueba.html)

### Error: "401 (Unauthorized)" o "Failed to get preference details"
- **Causa**: La Public Key del frontend no coincide con el Access Token del backend
- **Solución**: 
  1. **Verifica que ambos pertenezcan a la MISMA aplicación:**
     - Ve a: Panel de Desarrolladores > Tu aplicación > Credenciales
     - El Access Token (backend) y la Public Key (frontend) deben ser de la **misma aplicación**
  2. **Verifica que ambos sean de prueba o ambos de producción:**
     - No mezcles credenciales de prueba con producción
     - Si el Access Token es `TEST-...`, la Public Key también debe ser `TEST-...`
  3. **Verifica que ambos sean de la misma cuenta VENDEDOR:**
     - Ambos deben obtenerse de la misma cuenta VENDEDOR
     - No uses Access Token de una cuenta y Public Key de otra

### Error: "auto_return invalid. back_url.success must be defined"
- **Causa**: Las URLs de redirección no están configuradas correctamente
- **Solución**: Verifica que `FRONTEND_URL` y `BACKEND_URL` estén configuradas en `.env.development`

### El botón "Pagar" está deshabilitado en Mercado Pago
- **Causa**: El precio o la moneda no están formateados correctamente
- **Solución**: Verifica que el precio sea un número válido y la moneda sea un código de 3 letras (USD, UYU, etc.)

### El webhook no se ejecuta
- **Causa**: La URL del webhook no es accesible públicamente (en desarrollo local)
- **Solución**: 
  - En desarrollo, el webhook puede no funcionar si estás usando localhost
  - Considera usar herramientas como [ngrok](https://ngrok.com/) para exponer tu servidor local
  - O espera a que el usuario complete el pago y se procese desde `PaymentSuccess.jsx`

### No me redirige a la plataforma después del pago
- **Causa**: En algunos entornos (p. ej. localhost) Mercado Pago puede no hacer la redirección automática.
- **Solución**: 
  - El backend intenta enviar `auto_return: approved` para que MP redirija solo; si MP lo rechaza, se crea la preferencia sin auto_return.
  - Si tras pagar te quedas en la página de Mercado Pago, **haz clic en el botón "Volver al comercio"** (o "Return to site") para regresar a la plataforma.
  - Comprueba que `FRONTEND_URL` en el backend sea la URL donde corre tu front (ej. `http://localhost:5173`). Esa es la URL a la que MP enviará al usuario.

### Modo desarrollo: simular compra sin Mercado Pago
Cuando el sandbox no redirige a localhost, puedes probar el flujo completo con el **botón "Comprar (Dev mode)"** (azul), que aparece en los checkouts **solo en desarrollo** (`npm run dev` o `VITE_DEV_PAYMENT=true`).

- **Cursos**: `POST /mercadopago/dev-complete-purchase` con `courseId` y `userId` → redirige a `/payment/success?dev=1`.
- **Planes (gestoría)**: `POST /mercadopago/dev-complete-premium` con `planId` y `userId` → redirige a `/payment/success?dev=1&type=premium`.
- **Trámites de flota**: `POST /mercadopago/dev-complete-procedure` con `pendingId` y `userId` → crea el ship-request, registra el pago y redirige a `/payment/success?dev=1&type=procedure`.
- **Backend**: Las rutas `dev-complete-*` solo responden si `NODE_ENV === 'development'` o `ENABLE_DEV_PAYMENT === 'true'`; en producción devuelven 404.
- **Producción**: No exponer los botones y, si se desea, eliminar las rutas y métodos correspondientes en el controlador.

### Registro de pagos (processed-payments)
Todos los pagos confirmados (cursos, suscripciones a planes, trámites de flota) se registran en la colección **processed-payments** con una estructura unificada:

- **user**: datos del usuario (id, email, firstName, lastName).
- **item**: tipo (`course`, `subscription`, `procedure`, `service`, `other`), id (opcional) y nombre del concepto.
- **amount**: valor y moneda.
- **paymentStatus**, **externalReference**, **provider** (p. ej. `mercadopago`), **processedAt**, **metadata** (opcional, ej. `alreadyPurchased` para cursos).

El panel de **Gestión de pagos** (solo Administrador) consume `GET /api/mercadopago/processed-payments` con filtros por tipo de ítem, concepto, usuario, estado y moneda. Ver en el README del backend la sección [Modelos de datos > Pagos procesados](README.md#pagos-procesados-processed-payments).

## 📚 Recursos Adicionales

- [Documentación de Mercado Pago](https://www.mercadopago.com/developers/es/docs)
- [Cuentas de Prueba](https://www.mercadopago.com/developers/es/docs/your-integrations/test/test-users)
- [Tarjetas de Prueba](https://www.mercadopago.com/developers/es/docs/your-integrations/test/cards)
- [Panel de Desarrolladores](https://www.mercadopago.com/developers/panel/app)

## 🚀 Producción

Cuando estés listo para producción:

1. **Cambia** el Access Token y la Public Key por las credenciales de producción (misma aplicación).
2. **Configura** `FRONTEND_URL` y `BACKEND_URL` con las URLs públicas (HTTPS).
3. **Configura el webhook** en [Tus integraciones > Webhooks > Configurar notificaciones](https://www.mercadopago.com.ar/developers/panel/app): URL `https://tu-backend.com/api/mercadopago/webhook`, evento **Pagos**. Copia la **clave secreta** y añádela como `MERCADOPAGO_WEBHOOK_SECRET` en el backend (recomendado para validar la firma).
4. **Prueba** con montos pequeños antes de lanzar.
5. **Monitorea** los logs y las transacciones.

---

**Última actualización:** 2025
