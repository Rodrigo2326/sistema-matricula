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
- Búsqueda y filtrado de los registros.
- Validación de los datos ingresados.
- Exportación del listado a CSV.
- Resumen de matrículas agrupado por carrera.
- Eliminación de registros y persistencia en el navegador.

Queda **fuera de alcance** en esta versión: autenticación de usuarios, base de
datos en servidor, integración continua, contenedores y despliegue en nube.
Esos puntos corresponden a los avances APF2, APF3 y al proyecto final.

## Integrantes

| Integrante | Usuario de GitHub | Rol |
| --- | --- | --- |
| Rodrigo Aparcana | [@Rodrigo2326](https://github.com/Rodrigo2326) | Responsable de repositorio |
| _Por asignar_ | _Por asignar_ | Responsable funcional |
| _Por asignar_ | _Por asignar_ | Responsable de calidad/automatización |
| _Por asignar_ | _Por asignar_ | Responsable de despliegue/documentación |

> Los integrantes pendientes deben ser agregados como colaboradores del
> repositorio y registrar sus propios commits desde sus cuentas.

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
├── index.html          Interfaz de la aplicación
├── css/
│   └── estilos.css     Hoja de estilos
├── js/
│   └── app.js          Lógica de la aplicación
├── docs/               Documentación y evidencias del avance
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

## Licencia

Proyecto académico sin fines comerciales.
