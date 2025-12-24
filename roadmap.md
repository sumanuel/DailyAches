# Roadmap para la App de Dolor Tracker

## Descripción del Proyecto

Esta aplicación móvil, desarrollada con humor, permite rastrear y registrar los dolores reportados por mujeres (esposas, novias, hermanas, etc.) de manera diaria. Incluye elementos de gamificación como niveles, logros y estadísticas, además de funcionalidades sociales y educativas. La app utiliza React Native con Expo para el frontend, una API backend (por ejemplo, Node.js con Express) y PostgreSQL como base de datos.

## Tecnologías Recomendadas

- **Frontend**: React Native con Expo (ya instalado).
- **Backend**: API RESTful (Node.js, Express, JWT para autenticación).
- **Base de Datos**: PostgreSQL.
- **Otras**: Librerías como React Navigation para navegación, Victory o Chart.js para gráficos, Facebook SDK para compartir, AsyncStorage para almacenamiento local.

## Funcionalidades Principales

1. **Autenticación**:

   - Pantalla de registro.
   - Pantalla de login.
   - Pantalla de recuperación de contraseña.

2. **Home**:

   - Mensajes graciosos por defecto.
   - Mensajes dinámicos basados en registros diarios.
   - Imágenes dinámicas.
   - Mensajes de sorpresa si no hay registros al final del día.

3. **Registro de Dolores**:

   - Pantalla para registrar dolores (con dolores por defecto no editables/eliminables).
   - Opción para crear dolores personalizados.
   - Asignar a quién se registra (esposa, hermana, etc.).

4. **Estadísticas y Visualización**:

   - Pantalla para ver dolores registrados por mes/semana.
   - Estadísticas con gráficos.
   - Sistema de niveles (ganar puntos por registros).
   - Logros desbloqueables.

5. **Funcionalidades Adicionales**:
   - Compartir registros o días sin dolor en Facebook.
   - Sección informativa sobre por qué ocurren ciertos dolores.
   - Modo oscuro.

## Estructura de la Base de Datos (PostgreSQL)

- **Usuarios**: id, nombre, email, contraseña, nivel, puntos, fecha_registro.
- **Dolores**: id, nombre, descripcion, tipo (por_defecto o personalizado), usuario_id.
- **Registros**: id, usuario_id, dolor_id, fecha, persona_asignada (esposa, hermana, etc.).
- **Logros**: id, nombre, descripcion, puntos_requeridos.
- **Usuario_Logros**: usuario_id, logro_id, fecha_desbloqueado.

## Fases de Desarrollo

### Fase 1: Planificación y Diseño (1-2 semanas)

- **Tareas**:
  - Crear wireframes y mockups para todas las pantallas (usar Figma o similar).
  - Diseñar esquema de base de datos.
  - Definir endpoints de la API (ej. /auth/register, /dolores, /estadisticas).
  - Investigar integraciones (Facebook SDK, gráficos).
- **Entregables**: Documento de diseño, esquema DB.

### Fase 2: Desarrollo del Backend (3-4 semanas)

- **Tareas**:
  - Configurar servidor API (Node.js + Express).
  - Implementar autenticación (registro, login, recuperación de contraseña con email).
  - Crear modelos y migraciones para PostgreSQL.
  - Desarrollar CRUD para dolores, registros y estadísticas.
  - Implementar lógica de niveles y logros.
  - Configurar CORS y seguridad básica.
- **Entregables**: API funcional con documentación (Swagger).

### Fase 3: Desarrollo del Frontend (4-5 semanas)

- **Tareas**:
  - Configurar proyecto Expo.
  - Implementar navegación (React Navigation).
  - Desarrollar pantallas de autenticación.
  - Crear Home con mensajes dinámicos e imágenes.
  - Pantalla de registro de dolores (con selección de persona y dolores personalizados).
  - Pantalla de estadísticas con gráficos (usar Victory o similar).
  - Implementar sistema de niveles y logros.
  - Agregar sección informativa.
  - Integrar modo oscuro (usar Context API o librería como react-native-paper).
  - Integrar compartir en Facebook.
- **Entregables**: App funcional en Expo.

### Fase 4: Integración, Testing y Optimización (2-3 semanas)

- **Tareas**:
  - Integrar frontend con backend.
  - Realizar testing unitario (Jest para backend, Detox o similar para frontend).
  - Pruebas de UI/UX y compatibilidad.
  - Optimizar rendimiento y manejo de errores.
  - Implementar notificaciones push si es necesario.
- **Entregables**: App integrada y probada.

### Fase 5: Despliegue y Lanzamiento (1 semana)

- **Tareas**:
  - Desplegar API en un servidor (Heroku, AWS, etc.).
  - Publicar app en App Store y Google Play.
  - Configurar monitoreo básico.
- **Entregables**: App en producción.

## Timeline Estimada

- **Fase 1**: Semanas 1-2
- **Fase 2**: Semanas 3-6
- **Fase 3**: Semanas 7-11
- **Fase 4**: Semanas 12-14
- **Fase 5**: Semana 15

## Riesgos y Consideraciones

- **Privacidad**: Asegurar cumplimiento con leyes de datos (GDPR si aplica).
- **Humor**: Mantener un tono respetuoso y no ofensivo.
- **Integraciones**: Verificar compatibilidad de Facebook SDK con Expo.
- **Escalabilidad**: Diseñar API para posibles expansiones.

## Próximos Pasos

1. Revisar y aprobar este roadmap.
2. Comenzar con la Fase 1: Crear wireframes y esquema DB.
3. Configurar repositorio Git para versionado.

Este roadmap es flexible y puede ajustarse según necesidades. ¿Quieres que proceda con alguna fase específica o ajustes?
