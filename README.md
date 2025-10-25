# LATIAS Academia

**Descripción:**  
LATIAS Academia es una plataforma de aprendizaje online enfocada en cursos de náutica y supervivencia, entre otros. La aplicación permite a los cadetes acceder a cursos desarrollados por profesionales del mar, utilizando herramientas de inteligencia artíficial para la generación de videos y diálogos, evaluaciones profesionales y académicas en conjunto con exámenes finales para la obtención de certificados oficiales, generados automáticamente al completar los cursos. En cuanto a los aspéctos técnicos, la plataforma está desarrollada con el stack MERN y utiliza Bootstrap para la interfaz gráfica para mantener un diseño responsive y prolijo.

---

## Características principales

- Gestión de usuarios con roles: Cadetes, Instructores y Administradores.  
- Creación y gestión de cursos (CRUD).  
- Utilización de plataformas externas de IA para generar avatares, diálogos y voces de los instructores.  
- Videos protegidos para evitar distribución no autorizada.  
- Evaluaciones automáticas tipo test.  
- Generación automática de diplomas en PDF.  
- Pagos con Mercado Pago (con posibilidad de agregar otras pasarelas más adelante).  
- Panel de administración para gestión de usuarios, cursos y entregables.  

---

## Roadmap de desarrollo

La siguiente lista detalla los **100 pasos** planeados para el desarrollo completo de la plataforma:

✔️ CUMPLIDO - 🟡 EN DESARROLLO - ❌ INCUMPLIDO

### Preparación del proyecto (1-10)
✔️ 1. Crear el repositorio en GitHub.  
✔️ 2. Inicializar proyecto MERN con Vite.  
✔️ 3. Configurar ESLint y Prettier.  
❌ 4. Configurar GitHub Actions para CI/CD.  
✔️ 5. Crear estructura de carpetas (frontend, backend, assets, utils).  
✔️ 6. Configurar Node.js y Express en backend.  
✔️ 7. Configurar conexión a MongoDB Atlas.  
✔️ 8. Configurar variables de entorno para desarrollo y producción.  
✔️ 9. Instalar Bootstrap en frontend.  
✔️ 10. Configurar rutas básicas de frontend y backend.  

### Autenticación y roles (11-20)
✔️ 11. Crear modelo de usuario en MongoDB.  
✔️ 12. Implementar registro de cadetes.  
❌ 13. Implementar login con JWT.  
❌ 14. Crear middleware de autenticación.  
❌ 15. Crear roles: cadete, instructor, administrador.  
❌ 16. Crear middleware de autorización según rol.  
❌ 17. Probar endpoints de autenticación con Postman.  
✔️ 18. Configurar frontend para login y registro.  
❌ 19. Crear páginas protegidas según rol.  
❌ 20. Testear flujo completo de autenticación y roles.  

### Gestión de cursos (21-35)
✔️ 21. Crear modelo de curso en MongoDB.  
✔️ 22. Definir campos: título, descripción, categoría, videos, recursos.  
🟡 23. Crear endpoints para CRUD de cursos.  
❌ 24. Crear interfaz de instructor para crear cursos.  
❌ 25. Crear formulario de creación de curso en frontend.  
❌ 26. Implementar subida de archivos (miniaturas y PDFs).  
❌ 27. Integrar edición de curso existente.  
❌ 28. Implementar eliminación de curso.  
❌ 29. Crear endpoint para listar cursos.  
✔️ 30. Mostrar cursos en dashboard de cadetes.  
✔️ 31. Filtrar cursos por categoría.  
❌ 32. Crear paginación en listado de cursos.  
✔️ 33. Crear búsqueda por título y descripción.  
❌ 34. Probar CRUD completo de cursos.  
❌ 35. Testear interfaz y experiencia de usuario.  

### Integración de videos y control (36-50)
❌ 36. Seleccionar plataforma de videos externa segura (ej. YouTube privado, Vimeo, etc.).  
❌ 37. Definir flujo para que los instructores generen y editen videos externamente.  
❌ 38. Al crear un curso, permitir que el instructor ingrese la URL del video externo.  
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
🟡 66. Configurar cuenta de Mercado Pago.  
🟡 67. Crear modelo de transacción en base de datos.  
🟡 68. Crear endpoints para pagos y verificación.  
🟡 69. Implementar frontend para proceso de compra.  
❌ 70. Integrar webhooks de Mercado Pago para confirmar pagos.  
❌ 71. Marcar cursos comprados en perfil de cadete.  
❌ 72. Restringir acceso a cursos no comprados.  
❌ 73. Probar pagos en modo sandbox.  
❌ 74. Implementar confirmación visual de compra.  
❌ 75. Documentar flujo de pagos.  

### Panel de administración y cadetes (76-85)
❌ 76. Crear dashboard de administrador.  
❌ 77. Listar todos los cadetes y sus cursos.  
❌ 78. Listar todos los instructores y cursos asignados.
❌ 79. Permitir desactivar o eliminar usuarios.  
❌ 80. Crear filtros por rol y estado.  
❌ 81. Implementar búsqueda de usuarios.  
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

## Contacto del desarrollador

**Nombre:** Joaquín Pérez Coria 
**LinkedIn:** [https://www.linkedin.com/in/joaquin-perez-coria](https://www.linkedin.com/in/joaquin-perez-coria)  
**Sitio web / Portafolio:** [https://jpc-dev.uy](https://jpc-dev.uy)  

---

## Licencia

Copyright (c) 2025 Joaquín Pérez

Este proyecto está bajo la Licencia MIT.
Se permite usar, copiar, modificar, fusionar, publicar, distribuir, sublicenciar y/o vender copias del software. 