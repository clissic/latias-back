# Configuración de Stripe para Latias

## Pasos para configurar Stripe

### 1. Crear cuenta en Stripe
- Ve a [stripe.com](https://stripe.com) y crea una cuenta
- Activa tu cuenta con la información requerida

### 2. Obtener las claves de API
- En el dashboard de Stripe, ve a "Developers" > "API keys"
- Copia tu "Publishable key" (clave pública)
- Copia tu "Secret key" (clave secreta)

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto backend con:

```env
# Configuración de Stripe
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_de_stripe_aqui
STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica_de_stripe_aqui
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret_de_stripe_aqui

# URL del frontend
FRONTEND_URL=http://localhost:5000

# Configuración de MongoDB
MONGODB_PASSWORD=tu_password_de_mongodb_aqui

# Puerto del servidor
PORT=5000
```

### 4. Actualizar la clave pública en el frontend
En el archivo `src/components/StripePayment/StripePayment.jsx`, línea 8:

```javascript
const stripePromise = loadStripe('pk_test_tu_clave_publica_de_stripe_aqui');
```

### 5. Configurar webhooks (opcional)
- En el dashboard de Stripe, ve a "Developers" > "Webhooks"
- Crea un nuevo webhook con la URL: `https://tu-dominio.com/api/stripe/webhook`
- Selecciona los eventos: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
- Copia el "Signing secret" y agrégalo a tu archivo `.env`

## Funcionalidades implementadas

### Backend
- ✅ Servicio de Stripe (`src/services/stripe.service.js`)
- ✅ Controlador de Stripe (`src/controllers/stripe.controller.js`)
- ✅ Rutas de Stripe (`src/routes/stripe.routes.js`)
- ✅ Integración con el sistema de cursos existente

### Frontend
- ✅ Componente de pasarela de pagos (`src/components/StripePayment/`)
- ✅ Componente de éxito de pago (`src/components/PaymentSuccess/`)
- ✅ Integración con las rutas existentes
- ✅ Diseño responsive y moderno

## Endpoints disponibles

### Backend
- `POST /api/stripe/create-payment-session` - Crear sesión de pago
- `POST /api/stripe/create-payment-intent` - Crear Payment Intent
- `GET /api/stripe/session/:sessionId` - Recuperar sesión
- `POST /api/stripe/webhook` - Webhook de Stripe
- `POST /api/stripe/process-successful-payment` - Procesar pago exitoso

### Frontend
- `/course/buy/:id` - Página de compra con Stripe
- `/payment/success` - Página de éxito de pago

## Flujo de pago

1. Usuario hace clic en "Enrolarte ahora" en cualquier curso
2. Se redirige a `/course/buy/:id` (componente StripePayment)
3. Se muestra el resumen del curso y formulario de pago
4. Usuario completa el pago con Stripe Checkout
5. Stripe redirige a `/payment/success` con parámetros de confirmación
6. Se procesa el pago y se agrega el curso al usuario
7. Usuario puede acceder al curso desde su dashboard

## Notas importantes

- **Modo de prueba**: Las claves que empiezan con `pk_test_` y `sk_test_` son para desarrollo
- **Modo producción**: Cambia a claves que empiecen con `pk_live_` y `sk_live_` para producción
- **Webhooks**: Son importantes para confirmar pagos de forma segura
- **Seguridad**: Nunca expongas tu clave secreta en el frontend

## Próximos pasos

1. Configurar las claves de Stripe
2. Probar el flujo de pago completo
3. Configurar webhooks para producción
4. Implementar manejo de errores más robusto
5. Agregar notificaciones por email
6. Implementar sistema de reembolsos

# IMPORTANTE: Chequear de implementar tambien MERCADO PAGO como forma altenativa de pago aparte de Stripe