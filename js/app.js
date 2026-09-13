/* Sistema de Matrícula - lógica principal */

const CLAVE_ALMACEN = 'matriculas';

let matriculas = cargarMatriculas();

/**
 * Lee las matrículas guardadas en el navegador.
 * Si el contenido está dañado devuelve una lista vacía en lugar de romper la página.
 */
function cargarMatriculas() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_ALMACEN)) || [];
  } catch (error) {
    console.error('No se pudo leer el almacenamiento local:', error);
    return [];
  }
}

/** Persiste las matrículas en el navegador. */
function guardarMatriculas() {
  localStorage.setItem(CLAVE_ALMACEN, JSON.stringify(matriculas));
}

/** Muestra un aviso temporal en la esquina inferior derecha. */
function mostrarAviso(mensaje, tipo = 'exito') {
  const aviso = document.getElementById('aviso');
  aviso.textContent = mensaje;
  aviso.classList.toggle('error', tipo === 'error');
  aviso.classList.add('visible');
  setTimeout(() => aviso.classList.remove('visible'), 2800);
}

/* ===== Registro de matrículas ===== */

const formMatricula = document.getElementById('formMatricula');

/** Toma los valores del formulario y arma el objeto de la matrícula. */
function leerFormulario() {
  return {
    id: Date.now(),
    nombres: document.getElementById('nombres').value.trim(),
    apellidos: document.getElementById('apellidos').value.trim(),
    codigo: document.getElementById('codigo').value.trim().toUpperCase(),
    dni: document.getElementById('dni').value.trim(),
    carrera: document.getElementById('carrera').value,
    ciclo: document.getElementById('ciclo').value,
    curso: document.getElementById('curso').value.trim(),
    fecha: new Date().toLocaleDateString('es-PE')
  };
}

/** Registra una nueva matrícula y la persiste. */
function registrarMatricula(evento) {
  evento.preventDefault();

  const matricula = leerFormulario();

  const error = validarMatricula(matricula);
  if (error !== '') {
    mostrarAviso(error, 'error');
    return;
  }

  matriculas.push(matricula);
  guardarMatriculas();

  renderizarTabla(matriculas);
  formMatricula.reset();
  mostrarAviso('Matrícula registrada correctamente');
}

formMatricula.addEventListener('submit', registrarMatricula);

/* ===== Listado de matrículas ===== */

const cuerpoTabla = document.getElementById('cuerpoTabla');
const mensajeVacio = document.getElementById('mensajeVacio');
const contador = document.getElementById('contador');

/** Crea una celda de tabla con el texto indicado. */
function crearCelda(texto) {
  const celda = document.createElement('td');
  celda.textContent = texto;
  return celda;
}

/** Construye la fila correspondiente a una matrícula. */
function crearFila(matricula) {
  const fila = document.createElement('tr');
  fila.appendChild(crearCelda(matricula.codigo));
  fila.appendChild(crearCelda(`${matricula.nombres} ${matricula.apellidos}`));
  fila.appendChild(crearCelda(matricula.dni));
  fila.appendChild(crearCelda(matricula.carrera));
  fila.appendChild(crearCelda(matricula.ciclo));
  fila.appendChild(crearCelda(matricula.curso));
  fila.appendChild(crearCelda(matricula.fecha));

  const celdaAccion = document.createElement('td');
  const boton = document.createElement('button');
  boton.className = 'btn-eliminar';
  boton.title = 'Eliminar';
  boton.textContent = '✕';
  boton.dataset.id = matricula.id;
  celdaAccion.appendChild(boton);
  fila.appendChild(celdaAccion);

  return fila;
}

/** Dibuja en la tabla la lista de matrículas recibida. */
function renderizarTabla(lista) {
  cuerpoTabla.innerHTML = '';
  mensajeVacio.style.display = lista.length === 0 ? 'block' : 'none';
  lista.forEach(matricula => cuerpoTabla.appendChild(crearFila(matricula)));
  contador.textContent = lista.length;
}

/** Elimina la matrícula indicada previa confirmación. */
function eliminarMatricula(evento) {
  if (!evento.target.classList.contains('btn-eliminar')) return;

  const id = Number(evento.target.dataset.id);
  if (!confirm('¿Eliminar esta matrícula?')) return;

  matriculas = matriculas.filter(matricula => matricula.id !== id);
  guardarMatriculas();
  renderizarTabla(matriculas);
  mostrarAviso('Matrícula eliminada');
}

cuerpoTabla.addEventListener('click', eliminarMatricula);

renderizarTabla(matriculas);

/* ===== Búsqueda de matrículas ===== */

const buscador = document.getElementById('buscador');

/** Indica si la matrícula coincide con el término buscado. */
function coincideConBusqueda(matricula, termino) {
  const campos = [
    `${matricula.nombres} ${matricula.apellidos}`,
    matricula.codigo,
    matricula.carrera,
    matricula.curso
  ];
  return campos.some(campo => campo.toLowerCase().includes(termino));
}

/** Devuelve las matrículas que coinciden con lo escrito en el buscador. */
function filtrarMatriculas() {
  const termino = buscador.value.trim().toLowerCase();
  if (termino === '') return matriculas;
  return matriculas.filter(matricula => coincideConBusqueda(matricula, termino));
}

buscador.addEventListener('input', () => renderizarTabla(filtrarMatriculas()));

/* ===== Validación del formulario ===== */

const FORMATO_DNI = /^\d{8}$/;
const FORMATO_CODIGO = /^\d{4}-\d{4}$/;

/**
 * Revisa los datos de una matrícula antes de registrarla.
 * Devuelve el primer mensaje de error encontrado, o una cadena vacía si todo es válido.
 */
function validarMatricula(matricula) {
  if (matricula.nombres === '' || matricula.apellidos === '') {
    return 'Los nombres y apellidos son obligatorios.';
  }
  if (!FORMATO_CODIGO.test(matricula.codigo)) {
    return 'El código de estudiante debe tener el formato 2026-0001.';
  }
  if (!FORMATO_DNI.test(matricula.dni)) {
    return 'El DNI debe tener exactamente 8 dígitos.';
  }
  if (matricula.curso === '') {
    return 'Debe indicar el curso a matricular.';
  }
  if (existeMatriculaDuplicada(matricula)) {
    return `El estudiante ${matricula.codigo} ya está matriculado en ese curso.`;
  }
  return '';
}

/** Indica si el estudiante ya está matriculado en el mismo curso. */
function existeMatriculaDuplicada(nueva) {
  return matriculas.some(matricula =>
    matricula.codigo === nueva.codigo &&
    matricula.curso.toLowerCase() === nueva.curso.toLowerCase()
  );
}
