# Sistema de Matrícula

Aplicación web para registrar y consultar las matrículas de estudiantes por
ciclo académico. Proyecto Integrador del curso **Herramientas de Desarrollo
(100000S66T)** — periodo 2026-II.

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

## Alcance de esta primera versión (APF1)

Esta entrega cubre la base versionada del proyecto y el flujo fundamental de
Git. Funcionalmente incluye:

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

Queda **fuera de alcance** en esta versión: autenticación de usuarios, base de
datos en servidor, integración continua, contenedores y despliegue en nube.
Esos puntos corresponden a los avances APF2, APF3 y al proyecto final.

## Integrantes

| Integrante | Usuario de GitHub | Rol | Aporte principal |
| --- | --- | --- | --- |
| Aparcana Mamani Rodrigo Alonso | [@Rodrigo2326](https://github.com/Rodrigo2326) | Responsable de repositorio y documentación | Estructura base, registro, listado, búsqueda, validación, exportación CSV y resumen por carrera |
| Ccahuana Huillca Giancarlo | [@soulahrikermette-hub](https://github.com/soulahrikermette-hub) | Responsable funcional | Edición de matrículas registradas y botón de limpieza del formulario |
| Arnold Jhuncor Díaz Silva | [@gamergggpro123-lgtm](https://github.com/gamergggpro123-lgtm) | Responsable de calidad y automatización | Filtros por carrera y ciclo, y ordenamiento del listado por columnas |

Los tres integrantes tienen commits propios en el historial del repositorio.
Cada funcionalidad se desarrolló en su propia rama y se integró a `main`
mediante una fusión explícita.

## Requisitos

Solo un navegador web moderno (Chrome, Edge o Firefox). No requiere instalación,
servidor ni dependencias externas.

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

## Estructura del proyecto

```
sistema-matricula/
├── index.html                  Interfaz de la aplicación
├── css/
│   └── estilos.css             Hoja de estilos
├── js/
│   └── app.js                  Lógica de la aplicación
├── docs/
│   ├── informe-apf1.md         Informe del avance 1
│   ├── Informe_APF1.pdf        Informe del avance 1 en PDF
│   ├── generar_informe.py      Script que genera el PDF
│   └── evidencias/             Salidas de Git que respaldan el avance
├── .gitignore
├── .mailmap
└── README.md
```

## Estado del proyecto

**APF1 (Semana 6) — completado.** Base versionada, ramas de trabajo, merges y
resolución de conflicto documentados. Ver `docs/` para las evidencias del
avance.

## Flujo de trabajo con ramas

- `main` — versión principal estable.
- `feature/<nombre-funcionalidad>` — nuevas funcionalidades.
- `fix/<nombre-error>` — correcciones.
- `hotfix/<nombre-problema>` — correcciones urgentes.

Cada rama se integra a `main` mediante una fusión explícita (`git merge --no-ff`)
para que el historial conserve el punto de integración.

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
