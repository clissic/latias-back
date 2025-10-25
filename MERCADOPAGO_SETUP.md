# Configuración de Mercado Pago para Latias

## Pasos para configurar Mercado Pago

### 1. Crear cuenta en Mercado Pago
- Ve a [mercadopago.com](https://www.mercadopago.com) y crea una cuenta
- Completa la información requerida para activar tu cuenta
- Verifica tu identidad según los requisitos de tu país

### 2. Obtener las credenciales de API
- En el dashboard de Mercado Pago, ve a "Desarrolladores" > "Tus credenciales"
- Copia tu "Access Token" (clave de acceso)
- Para desarrollo, usa las credenciales de "Test" (modo sandbox)

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto backend con:

```env
# Configuración de Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=TEST-tu_access_token_de_mercadopago_aqui
MERCADOPAGO_PUBLIC_KEY=TEST-tu_public_key_de_mercadopago_aqui

# URLs del frontend y backend
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3000

# Configuración de MongoDB
MONGODB_PASSWORD=tu_password_de_mongodb_aqui

# Puerto del servidor
PORT=3000
```

### 4. Configurar webhooks (opcional pero recomendado)
- En el dashboard de Mercado Pago, ve a "Desarrolladores" > "Webhooks"
- Crea un nuevo webhook con la URL: `https://tu-dominio.com/api/mercadopago/webhook`
- Selecciona los eventos: `payment`, `merchant_order`
- Copia el "Webhook Secret" y agrégalo a tu archivo `.env`

## Funcionalidades implementadas

### Backend
- ✅ Servicio de Mercado Pago (`src/services/mercadopago.service.js`)
- ✅ Controlador de Mercado Pago (`src/controllers/mercadopago.controller.js`)
- ✅ Rutas de Mercado Pago (`src/routes/mercadopago.routes.js`)
- ✅ Integración con el sistema de cursos existente

### Frontend
- ✅ Componente de pasarela de pagos (`src/components/MercadoPagoPayment/`)
- ✅ Componente de éxito de pago (`src/components/PaymentSuccess/`)
- ✅ Integración con las rutas existentes
- ✅ Diseño responsive y moderno

## Endpoints disponibles

### Backend
- `POST /api/mercadopago/create-preference` - Crear preferencia de pago
- `GET /api/mercadopago/preference/:preferenceId` - Obtener preferencia
- `GET /api/mercadopago/payment/:paymentId` - Obtener pago
- `POST /api/mercadopago/webhook` - Webhook de Mercado Pago
- `POST /api/mercadopago/process-successful-payment` - Procesar pago exitoso
- `GET /api/mercadopago/payment-methods` - Obtener métodos de pago
- `POST /api/mercadopago/refund/:paymentId` - Crear reembolso

### Frontend
- `/course/buy/:id` - Página de compra con Mercado Pago
- `/payment/success` - Página de éxito de pago
- `/payment/failure` - Página de pago fallido
- `/payment/pending` - Página de pago pendiente

## Flujo de pago

1. Usuario hace clic en "Enrolarte ahora" en cualquier curso
2. Se redirige a `/course/buy/:id` (componente MercadoPagoPayment)
3. Se muestra el resumen del curso y formulario de pago
4. Usuario hace clic en "Pagar" y se crea una preferencia de pago
5. Se redirige a Mercado Pago para completar el pago
6. Mercado Pago redirige según el resultado:
   - **Éxito**: `/payment/success`
   - **Fallido**: `/payment/failure`
   - **Pendiente**: `/payment/pending`
7. Se procesa el pago y se agrega el curso al usuario
8. Usuario puede acceder al curso desde su dashboard

## Métodos de pago soportados

### Tarjetas de crédito y débito
- Visa
- Mastercard
- American Express
- Diners Club
- Maestro

### Efectivo
- Rapipago
- Pago Fácil
- Boleto bancario

### Transferencias
- Transferencia bancaria
- PIX (Brasil)
- SPEI (México)

### Billeteras digitales
- Mercado Pago
- PayPal (según país)

## Notas importantes

- **Modo de prueba**: Las credenciales que empiezan con `TEST-` son para desarrollo
- **Modo producción**: Cambia a credenciales de producción para el entorno real
- **Webhooks**: Son importantes para confirmar pagos de forma segura
- **Seguridad**: Nunca expongas tu Access Token en el frontend
- **Monedas**: Por defecto se usa ARS (peso argentino), pero puedes cambiar a USD, BRL, etc.

## Próximos pasos

1. Configurar las credenciales de Mercado Pago
2. Probar el flujo de pago completo en modo sandbox
3. Configurar webhooks para producción
4. Implementar manejo de errores más robusto
5. Agregar notificaciones por email
6. Implementar sistema de reembolsos
7. Agregar soporte para múltiples monedas

## Diferencias con Stripe

### Ventajas de Mercado Pago
- ✅ Mejor soporte para América Latina
- ✅ Más métodos de pago locales (efectivo, transferencias)
- ✅ Menores comisiones en algunos países
- ✅ Mejor integración con bancos locales

### Consideraciones
- ⚠️ Principalmente enfocado en América Latina
- ⚠️ Menos documentación en inglés
- ⚠️ API menos moderna que Stripe
- ⚠️ Soporte limitado fuera de LATAM
