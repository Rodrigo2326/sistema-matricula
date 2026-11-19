# Sistema de Matrícula

[![Integracion continua](https://github.com/Rodrigo2326/sistema-matricula/actions/workflows/ci.yml/badge.svg)](https://github.com/Rodrigo2326/sistema-matricula/actions/workflows/ci.yml)
[![Entrega continua](https://github.com/Rodrigo2326/sistema-matricula/actions/workflows/cd.yml/badge.svg)](https://github.com/Rodrigo2326/sistema-matricula/actions/workflows/cd.yml)

Aplicación web para registrar y consultar las matrículas de estudiantes por
ciclo académico. Proyecto Integrador del curso **Herramientas de Desarrollo
(100000S66T)** — periodo 2026-II.

**Aplicación en funcionamiento:** https://rodrigo2326.github.io/sistema-matricula/

## Problema

Las áreas académicas pequeñas siguen registrando las matrículas de cada ciclo en
hojas de cálculo compartidas: el archivo se duplica entre varias personas, no
existe validación de los datos ingresados, un mismo estudiante termina
registrado dos veces y consultar quién está matriculado en un curso obliga a
revisar el archivo fila por fila. Este proyecto reemplaza esa hoja de cálculo
por una aplicación web sencilla que centraliza el registro, valida la
información al momento de ingresarla y permite buscar y exportar los datos sin
depender de quién tenga la última versión del archivo.

## Objetivo

Construir una solución web funcional para el registro y consulta de matrículas,
gestionada íntegramente con las herramientas de control de versiones y
colaboración trabajadas en el curso, de modo que la evolución del producto
quede trazable en el repositorio.

## Alcance funcional

### Primera versión (APF1)

La primera entrega cubrió la base versionada del proyecto y el flujo
fundamental de Git. Funcionalmente incluyó:

- Registro de matrículas mediante formulario.
- Listado de las matrículas registradas con contador.
- Búsqueda por nombre, código, carrera o curso.
- Filtros por carrera y por ciclo, combinables con la búsqueda.
- Ordenamiento del listado al hacer clic en los encabezados.
- Edición de una matrícula ya registrada.
- Validación de los datos ingresados.
- Exportación del listado a CSV.
- Resumen de matrículas agrupado por carrera.
- Eliminación de registros y persistencia en el navegador.

### Segunda versión (APF2) — `v2.0.0`

El segundo avance incorporó tres funcionalidades nuevas, una por integrante:

- **Catálogo de cursos con control de vacantes.** Alta, edición y baja de los
  cursos que se ofrecen cada ciclo, con su número de vacantes. El curso a
  matricular dejó de escribirse a mano: se elige de un selector filtrado por
  carrera y ciclo que muestra las vacantes restantes, y el sistema rechaza la
  matrícula cuando el cupo se agota.
- **Constancia de matrícula imprimible.** Comprobante por estudiante con sus
  datos, el curso, el código del curso y la fecha, listo para imprimir o
  guardar como PDF desde el navegador.
- **Panel de ocupación por curso.** Barra de progreso por curso con el
  porcentaje ocupado — verde por debajo del 70 %, ámbar entre 70 % y 99 %, rojo
  al 100 % — y aviso de cuántos cursos quedaron sin vacantes.

### Tercera versión (APF3) — `v3.0.0-rc.1`

El tercer avance no agregó funcionalidades: incorporó la automatización del
proceso de desarrollo y la publicación del proyecto en la nube.

- **Pruebas automatizadas.** 26 pruebas sobre la lógica de la aplicación,
  ejecutadas con el runner de Node y un DOM simulado.
- **Verificación estática.** Diez comprobaciones sobre la estructura del
  proyecto, el balance de la hoja de estilos y el orden de carga de los
  módulos.
- **Integración continua.** Se ejecuta en cada push y en cada Pull Request.
- **Entrega continua.** Publica en GitHub Pages tras una integración correcta.
- **Seguimiento de incidencias.** Los defectos se registran, se asignan y se
  cierran con el cambio que los resolvió.

Queda **fuera de alcance** por ahora: autenticación de usuarios, base de datos
en servidor y empaquetado en contenedor. Esos puntos corresponden al proyecto
final.

## Integrantes

| Integrante | Usuario de GitHub | Rol | Aporte principal |
| --- | --- | --- | --- |
| Aparcana Mamani Rodrigo Alonso | [@Rodrigo2326](https://github.com/Rodrigo2326) | Responsable de repositorio y documentación | Estructura base, registro, listado, búsqueda, validación, exportación CSV, resumen por carrera y **catálogo de cursos con control de vacantes** |
| Ccahuana Huillca Giancarlo | [@soulahrikermette-hub](https://github.com/soulahrikermette-hub) | Responsable funcional | Edición de matrículas, botón de limpieza del formulario y **constancia de matrícula imprimible** |
| Arnold Jhuncor Díaz Silva | [@gamergggpro123-lgtm](https://github.com/gamergggpro123-lgtm) | Responsable de calidad y automatización | Filtros por carrera y ciclo, ordenamiento del listado y **panel de ocupación por curso** |

Los tres integrantes tienen commits propios en el historial del repositorio.
Cada funcionalidad se desarrolló en su propia rama y se integró a `main`
mediante una fusión explícita.

## Requisitos

Para **usar** la aplicación basta un navegador moderno: no requiere
instalación, servidor ni dependencias.

Para **ejecutar las validaciones** hace falta Node.js 20 o superior.

## Ejecución

```bash
git clone https://github.com/Rodrigo2326/sistema-matricula.git
cd sistema-matricula
```

Luego abre el archivo `index.html` con el navegador (doble clic es suficiente).

Si prefieres servirlo por HTTP:

```bash
python -m http.server 8000
# abrir http://localhost:8000
```

O úsala directamente en https://rodrigo2326.github.io/sistema-matricula/

## Validaciones automatizadas

```bash
npm ci            # instala las dependencias de las pruebas
npm run verificar # sintaxis + estructura + pruebas
```

Por separado:

| Comando | Qué hace |
| --- | --- |
| `npm run verificar:js` | Comprueba la sintaxis de los cuatro módulos |
| `npm run verificar:estructura` | Diez comprobaciones sobre la estructura del proyecto |
| `npm test` | Las 26 pruebas automatizadas |

Las mismas validaciones son las que ejecuta el flujo de integración continua,
de modo que lo que pasa en local pasa en el pipeline.

## Estructura del proyecto

```
sistema-matricula/
├── index.html                  Interfaz de la aplicación
├── css/
│   └── estilos.css             Hoja de estilos
├── .github/
│   └── workflows/
│       ├── ci.yml              Integración continua
│       └── cd.yml              Entrega continua a GitHub Pages
├── tests/
│   ├── entorno.js              Arranca la aplicación en un DOM simulado
│   ├── matriculas.test.js      Registro, duplicados y vacantes
│   ├── cursos.test.js          Catálogo y edición
│   ├── exportacion.test.js     Exportación a CSV
│   └── herramientas/
│       └── verificar-estructura.js   Verificación estática
├── js/
│   ├── app.js                  Registro, listado, búsqueda y validación
│   ├── cursos.js               Catálogo de cursos y control de vacantes
│   ├── constancia.js           Constancia de matrícula imprimible
│   └── ocupacion.js            Panel de ocupación por curso
├── docs/
│   ├── informe-apf1.md         Informe del avance 1
│   ├── Informe_APF1.pdf        Informe del avance 1 en PDF
│   ├── informe-apf2.md         Informe del avance 2
│   ├── Informe_APF2.pdf        Informe del avance 2 en PDF
│   ├── Informe_APF2.docx       Informe del avance 2 editable
│   ├── generar_informe.py      Script que genera los PDF
│   ├── evidencias/             Salidas de Git del APF1
│   └── evidencias-apf2/        Salidas de Git del APF2
├── .gitignore
├── .mailmap
└── README.md
```

## Estado del proyecto

**APF3 (Semana 15) — completado.** Versión candidata `v3.0.0-rc.1`, desplegada
en https://rodrigo2326.github.io/sistema-matricula/. Pipeline de integración
continua operativo, entrega continua a la nube y seguimiento de incidencias.
Ver `docs/evidencias-apf3/`.

**APF2 (Semana 11) — completado.** Versión `v2.0.0`. Tres funcionalidades nuevas
integradas mediante Pull Request con revisión previa, conflicto de fusión
resuelto y documentado, y gestión del trabajo en tablero. Ver
`docs/evidencias-apf2/`.

**APF1 (Semana 6) — completado.** Base versionada, ramas de trabajo, merges y
resolución de conflicto documentados. Ver `docs/evidencias/`.

### Herramientas utilizadas

| Necesidad | Herramienta |
| --- | --- |
| Control de versiones | Git |
| Repositorio remoto y revisión de código | GitHub (Pull Requests) |
| Gestión de actividades | GitHub Issues con responsables, etiquetas e hitos |
| Gestión del proyecto | Tablero de GitHub Projects + hito *APF2 - Semana 11* |
| Colaboración del equipo | Microsoft Teams (reunión diaria de 10:00 a 10:30) |
| Seguimiento de incidencias | GitHub Issues con etiqueta `incidencia` |
| Pruebas automatizadas | Runner de Node (`node --test`) con jsdom |
| Integración y entrega continuas | GitHub Actions |
| Plataforma en la nube | GitHub Pages |

## Flujo de trabajo con ramas

- `main` — versión principal estable.
- `feature/<nombre-funcionalidad>` — nuevas funcionalidades.
- `fix/<nombre-error>` — correcciones.
- `hotfix/<nombre-problema>` — correcciones urgentes.

Cada rama se integra a `main` mediante una fusión explícita (`git merge --no-ff`)
para que el historial conserve el punto de integración.

### Ramas utilizadas en el APF3

| Rama | Propósito | Estado |
| --- | --- | --- |
| `feature/pruebas-automatizadas` | Pruebas, verificación estática y pipelines | Fusionada (PR #19) |
| `fix/csv-ignora-filtros` | Incidencia #20: el CSV ignoraba los filtros | Fusionada (PR #28) |
| `fix/favicon-404` | Incidencia #29: 404 de favicon en el sitio | Fusionada (PR #30) |
| `feature/documentacion-apf3` | Informe, README y evidencias del avance | Fusionada |

### Ramas utilizadas en el APF2

| Rama | Propósito | Estado |
| --- | --- | --- |
| `main` | Versión principal estable | Activa |
| `feature/catalogo-cursos` | Catálogo de cursos con control de vacantes | Fusionada (PR #2) |
| `feature/constancia-matricula` | Constancia de matrícula imprimible | Fusionada (PR #13) |
| `feature/ocupacion` | Panel de ocupación por curso | Fusionada (PR #14, con conflicto) |
| `feature/documentacion-apf2` | Informe, README y evidencias del avance | Fusionada |

### Ramas utilizadas en el APF1

| Rama | Propósito | Estado |
| --- | --- | --- |
| `main` | Versión principal estable | Activa |
| `feature/formulario-matricula` | Formulario de registro de matrículas | Fusionada |
| `feature/listado-matriculas` | Tabla de registros, contador y eliminación | Fusionada |
| `feature/busqueda-matriculas` | Filtrado del listado | Fusionada |
| `feature/validacion-formulario` | Reglas de validación previas al registro | Fusionada |
| `feature/exportar-csv` | Exportación del listado a CSV | Fusionada |
| `feature/resumen-por-carrera` | Resumen de matrículas por carrera | Fusionada (con conflicto) |
| `fix/filtro-se-pierde-al-actualizar` | Corrección del filtro al registrar o eliminar | Fusionada |
| `feature/documentacion-apf1` | Informe y evidencias del avance | Fusionada |
| `fix/unificar-identidad-de-autor` | Archivo mailmap del nombre de autor | Fusionada |
| `feature/evidencias-apf1` | Evidencias de Git e informe en PDF | Fusionada |
| `feature/actualizar-evidencias` | Actualización de las evidencias | Fusionada |
| `feature/editar-matricula` | Edición de matrículas registradas | Fusionada |
| `feature-filtros-ordenamiento` | Filtros por carrera/ciclo y ordenamiento | Fusionada |
| `feature/actualizar-documentacion-equipo` | README, evidencias e informe del equipo | Fusionada |
| `fix/pagina-huerfana-del-informe` | Maquetación del informe en PDF | Fusionada |
| `feature/arreglar-toolbar` | Estilos de la barra de herramientas y del listado | Fusionada |
| `fix/ancho-del-buscador` | Ancho del campo de búsqueda | Fusionada |
| `fix/unificar-nombres-de-autor` | Mailmap de los tres integrantes | Fusionada |

### Ejemplo de uso

```bash
# 1. Partir siempre de main actualizado
git checkout main
git pull

# 2. Crear la rama de trabajo
git checkout -b feature/mi-funcionalidad

# 3. Trabajar y confirmar los cambios
git add .
git commit -m "Agregar mi funcionalidad"

# 4. Publicar la rama
git push -u origin feature/mi-funcionalidad

# 5. Integrar a main conservando el punto de fusión
git checkout main
git merge --no-ff feature/mi-funcionalidad
git push origin main
```

## Evidencias del APF3

El detalle está en [`docs/informe-apf3.md`](docs/informe-apf3.md) y en
[`docs/Informe_APF3.pdf`](docs/Informe_APF3.pdf). Las salidas que lo respaldan
están en `docs/evidencias-apf3/`:

| Archivo | Contenido |
| --- | --- |
| `incidencias.txt` | Incidencias con estado, responsable y resultado |
| `relacion-incidencia-cambio.txt` | Cada incidencia resuelta con su PR y sus commits |
| `ejecuciones-pipeline.txt` | Historial de ejecuciones del pipeline |
| `flujos-configurados.txt` | Flujos de trabajo configurados y su estado |
| `entorno-nube.txt` | URL del despliegue y verificación de los recursos |
| `validaciones.txt` | Salida de `npm run verificar` |
| `capturas/` | Pipeline, incidencias, release y despliegues |

## Evidencias del APF2

El detalle del avance está en [`docs/informe-apf2.md`](docs/informe-apf2.md) y en
[`docs/Informe_APF2.pdf`](docs/Informe_APF2.pdf). Las salidas que lo respaldan
están en `docs/evidencias-apf2/`:

| Archivo | Contenido |
| --- | --- |
| `historial-commits.txt` | Commits del avance con autor y fecha |
| `grafico-ramas.txt` | Gráfico del historial con las tres integraciones |
| `commits-por-integrante.txt` | Reparto de commits del avance y acumulado |
| `ramas.txt` | Ramas del avance y su estado |
| `pull-requests.txt` | Los tres Pull Requests con sus revisiones |
| `revision-pr2.txt` | Comentarios de revisión sobre líneas concretas del PR #2 |
| `conflicto-01-deteccion.txt` | Salida de Git al detectar el conflicto |
| `conflicto-02-marcadores.txt` | Marcadores de conflicto tal como los dejó Git |
| `conflicto-03-resolucion.txt` | Criterio, pasos y verificación de la resolución |
| `sincronizacion-local-remoto.txt` | Estado de sincronización local/remoto |

## Evidencias del APF1

El detalle del avance está en [`docs/informe-apf1.md`](docs/informe-apf1.md) y en
[`docs/Informe_APF1.pdf`](docs/Informe_APF1.pdf). Las salidas de Git que lo
respaldan están en `docs/evidencias/`:

| Archivo | Contenido |
| --- | --- |
| `historial-commits.txt` | Historial completo de commits con autor y fecha |
| `grafico-ramas.txt` | Gráfico del historial con ramas y puntos de fusión |
| `ramas.txt` | Ramas locales y remotas del proyecto |
| `merges.txt` | Fusiones realizadas hacia `main` |
| `conflicto-01-deteccion.txt` | Salida de Git al detectar el conflicto |
| `conflicto-02-marcadores.txt` | Marcadores de conflicto tal como los dejó Git |
| `conflicto-03-resolucion.txt` | Criterio y pasos de la resolución |
| `sincronizacion-local-remoto.txt` | Estado de sincronización entre local y remoto |
| `verificacion-funcional.txt` | Prueba de las funcionalidades en el navegador |
| `aplicacion-en-ejecucion.png` | Captura de la aplicación con registros cargados |

## Licencia

Proyecto académico sin fines comerciales.
