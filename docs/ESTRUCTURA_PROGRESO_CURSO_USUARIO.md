# Estructura del progreso de curso en el usuario

Este documento describe cómo se guarda y se expone el progreso de un curso cuando un usuario lo compra: lecciones, intentos y resultados de las pruebas parciales por módulo.

---

## 1. Dónde se guarda

- **Colección:** `users`
- **Campo:** `purchasedCourses` (array). Cada elemento es un curso comprado por el usuario.
- En Mongoose está definido como `{ type: Array, default: [] }` (sin subesquema estricto).

---

## 2. Estructura al comprar un curso (`purchaseCourse`)

Cuando el usuario compra un curso, se agrega **un objeto** a `user.purchasedCourses` con esta forma:

```js
{
  courseId: string,           // ej. "course_xxx"
  purchasedDate: Date,
  enrolledDate: Date,
  isFinished: boolean,       // false al comprar
  finishedDate: null,
  progress: number,          // 0-100, porcentaje global del curso
  attempts: [],              // intentos de examen final (otro flujo)
  certificate: null,
  modules: [
    {
      moduleId: string,
      testAttempts: 0,       // intentos usados en la prueba parcial del módulo
      lastTestScore: null,   // mejor puntaje (0-100) de la prueba parcial
      lessons: [
        {
          lessonId: string,
          completed: false,
          completedAt: null
        }
      ]
    }
  ]
}
```

- **`modules`:** un elemento por cada módulo del curso. Solo se persisten IDs y estado de progreso.
- **Por módulo:** `testAttempts` y `lastTestScore` pertenecen a la **prueba parcial del módulo** (2 intentos máx., se guarda el mejor puntaje).

---

## 3. Progreso de lecciones (`updateUserLessonProgress`)

- Se actualiza el curso en `purchasedCourses` que coincida con `courseId`.
- Se localiza o se crea el módulo por `moduleId` y la lección por `lessonId`.
- Se actualiza:
  - `lesson.completed` (boolean)
  - `lesson.completedAt` (Date o null)
- Se recalcula `course.progress` (lecciones completadas / total lecciones) y, si llega a 100, `isFinished` y `finishedDate`.

Si el módulo se crea en este flujo, se usa `{ moduleId, lessons: [] }`; no se inicializan aquí `testAttempts` ni `lastTestScore` (en lectura se usan valores por defecto 0 y null).

---

## 4. Pruebas parciales por módulo

### 4.1 Inicio de intento (`startModuleTestAttempt`)

- **Cuándo:** al abrir la prueba (el intento se descuenta al entrar).
- **Qué se guarda:** en el módulo correspondiente de `purchasedCourses[courseIndex].modules`:
  - `testAttempts = (testAttempts || 0) + 1`

Si el módulo no existe, se crea con `{ moduleId, lessons: [], testAttempts: 0, lastTestScore: null }` y luego se incrementa `testAttempts`.

### 4.2 Guardar puntaje (`updateModuleTestResult`)

- **Cuándo:** al finalizar la prueba (completa o cerrada por el usuario).
- **Qué se guarda:** en el mismo módulo:
  - `lastTestScore`: solo se actualiza si el nuevo puntaje es **mayor** que el anterior (o si no había puntaje). Así, en el segundo intento se mantiene el mejor resultado.

No se vuelve a incrementar `testAttempts` aquí; ya se hizo al abrir la prueba.

---

## 5. Otros campos del curso en el usuario

- **`attempts`** (array): intentos de **examen final** del curso (flujo distinto a las pruebas parciales por módulo). Se usa en `addUserCourseAttempt`.
- **`certificate`**: dato del certificado, actualizado con `updateUserCourseCertificate`.
- **`progress`**: porcentaje global (0–100), recalculado en `updateUserLessonProgress` según lecciones completadas.

---

## 6. Qué recibe el frontend (curso enriquecido)

Al obtener los cursos del usuario (`getUserPurchasedCourses`), cada ítem de `purchasedCourses` se **enriquece** con datos del curso desde la colección `courses` (nombre, banner, etc.). El objeto que ve el frontend tiene esta forma relevante para progreso e intentos:

```js
{
  courseId: string,
  courseName: string,
  bannerUrl: string,
  // ... más datos del curso (image, price, category, professor, etc.)
  modulesCompleted: [
    {
      moduleId: string,
      moduleName: string,
      moduleDescription: string,
      testAttempts: number,    // del usuario (storedMod.testAttempts ?? 0)
      lastTestScore: number | null,  // del usuario (storedMod.lastTestScore ?? null)
      lessons: [
        {
          lessonId: string,
          lessonName: string,
          lessonDescription: string,
          completed: boolean,
          completedAt: Date | null
        }
      ]
    }
  ],
  purchasedDate: Date,
  enrolledDate: Date,
  progress: number,
  isFinished: boolean,
  finishedDate: Date | null,
  attempts: [],
  certificate: null
}
```

- **`modulesCompleted`:** mezcla de datos del curso (nombres, descripción) con el progreso guardado en el usuario (`completed`, `completedAt`, `testAttempts`, `lastTestScore`).
- El frontend usa `userCourse.modulesCompleted` (p. ej. en CursoVista) para:
  - Saber qué lecciones están completadas y si todas lo están (`allLessonsCompleted`).
  - Mostrar intentos usados: `testAttempts` (máx. 2 por módulo).
  - Mostrar puntaje registrado: `lastTestScore` (mejor puntaje entre los intentos).

---

## 7. Resumen por campo de progreso / pruebas

| Dato                         | Dónde se guarda (usuario)           | Cuándo se actualiza                          |
|-----------------------------|--------------------------------------|----------------------------------------------|
| Lección completada          | `modules[].lessons[].completed`      | `updateUserLessonProgress`                   |
| Fecha lección               | `modules[].lessons[].completedAt`     | `updateUserLessonProgress`                   |
| Intentos prueba parcial     | `modules[].testAttempts`             | `startModuleTestAttempt` (al abrir prueba)   |
| Puntaje prueba parcial      | `modules[].lastTestScore`            | `updateModuleTestResult` (solo si mejora)    |
| Progreso global (%)         | `progress`                           | `updateUserLessonProgress`                    |
| Intentos examen final       | `attempts[]`                         | `addUserCourseAttempt`                       |
| Certificado                 | `certificate`                        | `updateUserCourseCertificate`                |

---

## 8. Compatibilidad con datos antiguos

- Si un módulo en el usuario no tiene `testAttempts` ni `lastTestScore`, al enriquecer se usan `0` y `null`.
- Si un módulo se creó solo por progreso de lecciones (sin pruebas), en `startModuleTestAttempt` / `updateModuleTestResult` se crea o se completa el objeto del módulo con `testAttempts` y `lastTestScore` según corresponda.
