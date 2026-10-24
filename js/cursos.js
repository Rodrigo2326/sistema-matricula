/* Sistema de Matrícula - catálogo de cursos y control de vacantes */

const CLAVE_CURSOS = 'cursos';

/**
 * Catálogo inicial. Solo se usa la primera vez que se abre la aplicación, para
 * que el listado de matrículas no quede sin cursos a los que apuntar.
 */
const CURSOS_INICIALES = [
  { codigo: 'SIS-101', nombre: 'Algoritmos y Estructuras de Datos', carrera: 'Ingeniería de Sistemas', ciclo: 'III', vacantes: 30 },
  { codigo: 'SIS-205', nombre: 'Herramientas de Desarrollo', carrera: 'Ingeniería de Sistemas', ciclo: 'V', vacantes: 25 },
  { codigo: 'ADM-110', nombre: 'Fundamentos de Administración', carrera: 'Administración', ciclo: 'I', vacantes: 40 },
  { codigo: 'CON-120', nombre: 'Contabilidad General', carrera: 'Contabilidad', ciclo: 'II', vacantes: 35 }
];

let cursos = cargarCursos();
let codigoCursoEnEdicion = null;

/** Lee el catálogo guardado en el navegador; si no existe, siembra el inicial. */
function cargarCursos() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_CURSOS));
    if (Array.isArray(guardado) && guardado.length > 0) return guardado;
  } catch (error) {
    console.error('No se pudo leer el catálogo de cursos:', error);
  }
  return CURSOS_INICIALES.map(curso => ({ ...curso }));
}

/** Persiste el catálogo de cursos en el navegador. */
function guardarCursos() {
  localStorage.setItem(CLAVE_CURSOS, JSON.stringify(cursos));
}

/** Devuelve el curso con el código indicado, o undefined si no existe. */
function buscarCurso(codigo) {
  return cursos.find(curso => curso.codigo === codigo);
}

/**
 * Cuenta cuántos estudiantes ocupan un curso.
 *
 * Las matrículas registradas antes del catálogo guardaron el curso como texto
 * libre, sin código. Para que esas matrículas sigan contando se las reconoce
 * comparando nombre, carrera y ciclo.
 */
function contarOcupacion(curso) {
  return matriculas.filter(matricula => {
    if (matricula.cursoCodigo) return matricula.cursoCodigo === curso.codigo;
    return matricula.curso.toLowerCase() === curso.nombre.toLowerCase() &&
      matricula.carrera === curso.carrera &&
      matricula.ciclo === curso.ciclo;
  }).length;
}

/** Vacantes que todavía quedan libres en un curso. */
function vacantesLibres(curso) {
  return Math.max(curso.vacantes - contarOcupacion(curso), 0);
}

/* ===== Registro de cursos ===== */

const formCurso = document.getElementById('formCurso');
const btnEnviarCurso = document.getElementById('btnEnviarCurso');

const FORMATO_CODIGO_CURSO = /^[A-Z]{3}-\d{3}$/;

/** Toma los valores del formulario de cursos. */
function leerFormularioCurso() {
  return {
    codigo: document.getElementById('codigoCurso').value.trim().toUpperCase(),
    nombre: document.getElementById('nombreCurso').value.trim(),
    carrera: document.getElementById('carreraCurso').value,
    ciclo: document.getElementById('cicloCurso').value,
    vacantes: Number(document.getElementById('vacantesCurso').value)
  };
}

/**
 * Revisa los datos de un curso antes de guardarlo.
 * codigoExcluir es el código del curso que se está editando, para que la
 * validación de duplicados no se dispare contra sí misma.
 */
function validarCurso(curso, codigoExcluir = null) {
  if (!FORMATO_CODIGO_CURSO.test(curso.codigo)) {
    return 'El código del curso debe tener el formato SIS-101.';
  }
  if (curso.nombre === '') {
    return 'El nombre del curso es obligatorio.';
  }
  if (!Number.isInteger(curso.vacantes) || curso.vacantes < 1) {
    return 'Las vacantes deben ser un número entero mayor que cero.';
  }
  if (curso.codigo !== codigoExcluir && buscarCurso(curso.codigo)) {
    return `Ya existe un curso con el código ${curso.codigo}.`;
  }
  if (codigoExcluir !== null) {
    const ocupacion = contarOcupacion(buscarCurso(codigoExcluir));
    if (curso.vacantes < ocupacion) {
      return `El curso ya tiene ${ocupacion} matriculados: no puede dejar menos vacantes.`;
    }
  }
  return '';
}

/** Carga un curso en el formulario para editarlo. */
function cargarCursoEnFormulario(curso) {
  document.getElementById('codigoCurso').value = curso.codigo;
  document.getElementById('nombreCurso').value = curso.nombre;
  document.getElementById('carreraCurso').value = curso.carrera;
  document.getElementById('cicloCurso').value = curso.ciclo;
  document.getElementById('vacantesCurso').value = curso.vacantes;

  codigoCursoEnEdicion = curso.codigo;
  btnEnviarCurso.textContent = 'Guardar cambios';
  formCurso.scrollIntoView({ behavior: 'smooth' });
}

/** Devuelve el formulario de cursos a su estado de alta. */
function salirDeEdicionCurso() {
  formCurso.reset();
  codigoCursoEnEdicion = null;
  btnEnviarCurso.textContent = '+ Registrar curso';
}

/** Registra un curso nuevo o actualiza el que se está editando. */
function registrarCurso(evento) {
  evento.preventDefault();

  const datos = leerFormularioCurso();
  const error = validarCurso(datos, codigoCursoEnEdicion);
  if (error !== '') {
    mostrarAviso(error, 'error');
    return;
  }

  if (codigoCursoEnEdicion !== null) {
    const indice = cursos.findIndex(curso => curso.codigo === codigoCursoEnEdicion);
    propagarCambiosDelCurso(cursos[indice], datos);
    cursos[indice] = datos;
    mostrarAviso('Curso actualizado correctamente');
  } else {
    cursos.push(datos);
    mostrarAviso('Curso registrado correctamente');
  }

  guardarCursos();
  salirDeEdicionCurso();
  refrescarCursos();
}

/**
 * Mantiene al día las matrículas cuando se edita un curso.
 *
 * Cada matrícula guarda el nombre del curso además de su código, para que el
 * listado, el CSV y la constancia no dependan de que el curso siga existiendo.
 * Ese nombre es una copia, así que al renombrar el curso hay que actualizarlo;
 * y al cambiarle el código hay que volver a apuntar las matrículas.
 */
function propagarCambiosDelCurso(cursoAnterior, cursoNuevo) {
  const mismoCodigo = cursoAnterior.codigo === cursoNuevo.codigo;
  const mismoNombre = cursoAnterior.nombre === cursoNuevo.nombre;
  if (mismoCodigo && mismoNombre) return;

  const afectadas = matriculas.filter(matricula => matricula.cursoCodigo === cursoAnterior.codigo);
  if (afectadas.length === 0) return;

  afectadas.forEach(matricula => {
    matricula.cursoCodigo = cursoNuevo.codigo;
    matricula.curso = cursoNuevo.nombre;
  });

  guardarMatriculas();
  refrescarListado();
}

formCurso.addEventListener('submit', registrarCurso);
formCurso.addEventListener('reset', salirDeEdicionCurso);

/* ===== Listado del catálogo ===== */

const cuerpoTablaCursos = document.getElementById('cuerpoTablaCursos');
const mensajeSinCursos = document.getElementById('mensajeSinCursos');

/** Construye la fila de un curso con su ocupación. */
function crearFilaCurso(curso) {
  const ocupados = contarOcupacion(curso);
  const libres = vacantesLibres(curso);

  const fila = document.createElement('tr');
  fila.appendChild(crearCelda(curso.codigo));
  fila.appendChild(crearCelda(curso.nombre));
  fila.appendChild(crearCelda(curso.carrera));
  fila.appendChild(crearCelda(curso.ciclo));
  fila.appendChild(crearCelda(`${ocupados} / ${curso.vacantes}`));

  const celdaEstado = document.createElement('td');
  const etiqueta = document.createElement('span');
  etiqueta.className = libres === 0 ? 'estado lleno' : 'estado disponible';
  etiqueta.textContent = libres === 0 ? 'Sin vacantes' : `${libres} libre(s)`;
  celdaEstado.appendChild(etiqueta);
  fila.appendChild(celdaEstado);

  const celdaAccion = document.createElement('td');

  const botonEditar = document.createElement('button');
  botonEditar.className = 'btn-editar-curso';
  botonEditar.title = 'Editar curso';
  botonEditar.textContent = '✎';
  botonEditar.dataset.codigo = curso.codigo;
  celdaAccion.appendChild(botonEditar);

  const botonEliminar = document.createElement('button');
  botonEliminar.className = 'btn-eliminar-curso';
  botonEliminar.title = 'Eliminar curso';
  botonEliminar.textContent = '✕';
  botonEliminar.dataset.codigo = curso.codigo;
  celdaAccion.appendChild(botonEliminar);

  fila.appendChild(celdaAccion);
  return fila;
}

/** Dibuja la tabla del catálogo de cursos. */
function renderizarCursos() {
  cuerpoTablaCursos.innerHTML = '';
  mensajeSinCursos.style.display = cursos.length === 0 ? 'block' : 'none';
  cursos.forEach(curso => cuerpoTablaCursos.appendChild(crearFilaCurso(curso)));
  document.getElementById('contadorCursos').textContent = cursos.length;
}

/** Maneja los clics del catálogo: editar o eliminar el curso. */
function manejarClicCursos(evento) {
  const codigo = evento.target.dataset.codigo;
  if (!codigo) return;

  if (evento.target.classList.contains('btn-editar-curso')) {
    cargarCursoEnFormulario(buscarCurso(codigo));
    return;
  }

  if (evento.target.classList.contains('btn-eliminar-curso')) {
    const curso = buscarCurso(codigo);
    if (contarOcupacion(curso) > 0) {
      mostrarAviso('No se puede eliminar un curso con estudiantes matriculados.', 'error');
      return;
    }
    if (!confirm(`¿Eliminar el curso ${curso.nombre}?`)) return;
    cursos = cursos.filter(item => item.codigo !== codigo);
    guardarCursos();
    if (codigoCursoEnEdicion === codigo) salirDeEdicionCurso();
    refrescarCursos();
    mostrarAviso('Curso eliminado');
  }
}

cuerpoTablaCursos.addEventListener('click', manejarClicCursos);

/* ===== Selector de curso en el formulario de matrícula ===== */

const selectorCurso = document.getElementById('curso');

/**
 * Llena el selector de cursos del formulario de matrícula.
 * Solo ofrece los cursos de la carrera y el ciclo elegidos, y deshabilita los
 * que ya no tienen vacantes. Conserva la selección previa si sigue siendo válida.
 */
function actualizarSelectorCursos() {
  const carrera = document.getElementById('carrera').value;
  const ciclo = document.getElementById('ciclo').value;
  const seleccionPrevia = selectorCurso.value;

  const disponibles = cursos.filter(curso => curso.carrera === carrera && curso.ciclo === ciclo);

  selectorCurso.innerHTML = '';

  if (disponibles.length === 0) {
    const vacio = document.createElement('option');
    vacio.value = '';
    vacio.textContent = 'No hay cursos registrados para esa carrera y ciclo';
    selectorCurso.appendChild(vacio);
    return;
  }

  const inicial = document.createElement('option');
  inicial.value = '';
  inicial.textContent = 'Seleccione un curso...';
  selectorCurso.appendChild(inicial);

  disponibles.forEach(curso => {
    const libres = vacantesLibres(curso);
    const opcion = document.createElement('option');
    opcion.value = curso.codigo;
    opcion.textContent = `${curso.codigo} — ${curso.nombre} (${libres} vacante(s))`;
    opcion.disabled = libres === 0 && curso.codigo !== seleccionPrevia;
    selectorCurso.appendChild(opcion);
  });

  if (disponibles.some(curso => curso.codigo === seleccionPrevia)) {
    selectorCurso.value = seleccionPrevia;
  }
}

document.getElementById('carrera').addEventListener('change', actualizarSelectorCursos);
document.getElementById('ciclo').addEventListener('change', actualizarSelectorCursos);

/** Vuelve a dibujar todo lo que depende del catálogo. */
function refrescarCursos() {
  renderizarCursos();
  actualizarSelectorCursos();
}

refrescarCursos();

/* ===== Control de vacantes ===== */

/**
 * Indica si todavía queda cupo en el curso indicado.
 *
 * idMatriculaExcluida es la matrícula que se está editando: si ya ocupaba una
 * plaza en ese mismo curso no debe contarse como una plaza nueva, de lo
 * contrario sería imposible corregir los datos de un curso lleno.
 */
function hayVacanteDisponible(codigoCurso, idMatriculaExcluida = null) {
  const curso = buscarCurso(codigoCurso);
  if (!curso) return false;

  const yaOcupabaPlaza = matriculas.some(matricula =>
    matricula.id === idMatriculaExcluida && matricula.cursoCodigo === codigoCurso);

  return yaOcupabaPlaza || vacantesLibres(curso) > 0;
}
