# Matriz app/backend: DailyAches

Ultima actualizacion: 2026-06-29

## Objetivo

Resume los contratos entre DailyAches y Dailyaches-api que hoy gobiernan autenticacion, perfil, personas, tipos de dolor y registros.

## Endpoints principales consumidos por la app

| Flujo                    | Metodo y ruta              | Consumido desde app       | Payload clave                                          | Campos sensibles a ruptura                                             |
| ------------------------ | -------------------------- | ------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------- |
| Registro                 | POST /api/auth/register    | utils/authService.js      | email, password, name                                  | backend exige email y password; password minimo 6; name es opcional    |
| Login                    | POST /api/auth/login       | utils/authService.js      | email, password                                        | token y user en respuesta                                              |
| Usuario actual           | GET /api/auth/me           | utils/authService.js      | header Bearer                                          | shape de user para profile                                             |
| Actualizar perfil        | PUT /api/auth/profile      | utils/authService.js      | name?, email?, phone?, birth_date?                     | birth_date en YYYY-MM-DD, email valido                                 |
| Listar personas          | GET /api/people            | utils/peopleService.js    | sin body                                               | people[]                                                               |
| Crear persona            | POST /api/people           | utils/peopleService.js    | name, relation?, image_url?, phone?, whatsapp_enabled? | name obligatorio; nombres exactos de image_url y whatsapp_enabled      |
| Actualizar persona       | PUT /api/people/:id        | utils/peopleService.js    | name, relation?, image_url?, phone?, whatsapp_enabled? | id entero, name obligatorio                                            |
| Eliminar persona         | DELETE /api/people/:id     | utils/peopleService.js    | path param                                             | ownership por user_id                                                  |
| Listar tipos de dolor    | GET /api/pain-types        | utils/painTypesService.js | sin body                                               | painTypes[]                                                            |
| Crear tipo de dolor      | POST /api/pain-types       | utils/painTypesService.js | name, image_url?                                       | name obligatorio, unicidad por usuario                                 |
| Actualizar tipo de dolor | PUT /api/pain-types/:id    | utils/painTypesService.js | name, image_url?                                       | id entero, name obligatorio, evita duplicados                          |
| Eliminar tipo de dolor   | DELETE /api/pain-types/:id | utils/painTypesService.js | path param                                             | ownership y dependencia funcional                                      |
| Listar records           | GET /api/records           | utils/recordsService.js   | sin body                                               | records con person_name, pain_type_name, pain_type_image               |
| Records de hoy           | GET /api/records/today     | utils/recordsService.js   | sin body                                               | filtro por fecha del servidor                                          |
| Crear record             | POST /api/records          | utils/recordsService.js   | person_id, pain_type_id, pain_level, notes?            | person_id y pain_type_id deben pertenecer al usuario; pain_level 1..10 |
| Actualizar record        | PUT /api/records/:id       | utils/recordsService.js   | person_id?, pain_type_id?, pain_level?, notes?         | id entero, ownership, pain_level 1..10                                 |
| Eliminar record          | DELETE /api/records/:id    | utils/recordsService.js   | path param                                             | ownership por user_id                                                  |

## Puntos fragiles detectados

1. La app usa nombres snake_case en payloads remotos como image_url, whatsapp_enabled, person_id y pain_type_id; renombrarlos rompe sin error de compilacion.
2. La URL base puede caer a IP LAN derivada o hardcodeada; en dispositivos fisicos esto suele ser la primera fuente de fallo.
3. UserContext mezcla datos locales y remotos durante bootstrap; cambios en /auth/me o en los endpoints de listas pueden degradar sincronizacion sin romper login.
4. La respuesta de /records agrega campos enriquecidos person_name, pain_type_name y pain_type_image; si se eliminan, varias pantallas seguiran compilando pero perderan contenido.

## Reglas de cambio seguro

1. Si cambias un nombre de campo en Dailyaches-api, buscar primero en utils y luego en UserContext.
2. Si cambias validaciones de records, probar createRecord y updateRecord de punta a punta.
3. Si cambias la URL o estrategia de API, actualizar constants/api.js y este documento al mismo tiempo.
