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

  refrescarListado();
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
  refrescarListado();
  mostrarAviso('Matrícula eliminada');
}

cuerpoTabla.addEventListener('click', eliminarMatricula);

renderizarTabla(matriculas);

/* ===== Búsqueda y Filtros de matrículas ===== */

const buscador = document.getElementById('buscador');
const filtroCarrera = document.getElementById('filtroCarrera');
const filtroCiclo = document.getElementById('filtroCiclo');
/* ===== Ordenamiento de tabla ===== */

let columnaOrden = null;
let ordenAscendente = true;

document.querySelectorAll('th.ordenable').forEach(th => {
  th.addEventListener('click', () => {
    const columna = th.dataset.columna;
    
    // Alternar dirección si es la misma columna, sino reiniciar a ascendente
    if (columnaOrden === columna) {
      ordenAscendente = !ordenAscendente;
    } else {
      columnaOrden = columna;
      ordenAscendente = true;
    }

    // Actualizar flechas visuales (opcional pero recomendado)
    document.querySelectorAll('th.ordenable span').forEach(span => span.textContent = '');
    th.querySelector('span').textContent = ordenAscendente ? ' ▲' : ' ▼';

    refrescarListado();
  });
});

function ordenarMatriculas(lista) {
  if (!columnaOrden) return lista;

  return lista.sort((a, b) => {
    let valorA, valorB;

    // Manejo especial para el nombre completo (ya que en el objeto están separados)
    if (columnaOrden === 'nombres') {
      valorA = `${a.nombres} ${a.apellidos}`.toLowerCase();
      valorB = `${b.nombres} ${b.apellidos}`.toLowerCase();
    } else {
      valorA = String(a[columnaOrden]).toLowerCase();
      valorB = String(b[columnaOrden]).toLowerCase();
    }

    if (valorA < valorB) return ordenAscendente ? -1 : 1;
    if (valorA > valorB) return ordenAscendente ? 1 : -1;
    return 0;
  });
}

function coincideConBusqueda(matricula, termino) {
  const campos = [
    `${matricula.nombres} ${matricula.apellidos}`,
    matricula.codigo,
    matricula.carrera,
    matricula.curso
  ];
  return campos.some(campo => campo.toLowerCase().includes(termino));
}

function filtrarMatriculas() {
  const termino = buscador.value.trim().toLowerCase();
  const fCarrera = filtroCarrera.value;
  const fCiclo = filtroCiclo.value;

  return matriculas.filter(matricula => {
    // Si el filtro está vacío, pasa la validación (true), sino compara
    const pasaBuscador = termino === '' || coincideConBusqueda(matricula, termino);
    const pasaCarrera = fCarrera === '' || matricula.carrera === fCarrera;
    const pasaCiclo = fCiclo === '' || matricula.ciclo === fCiclo;
    
    // Solo devuelve la matrícula si cumple TODOS los filtros activos
    return pasaBuscador && pasaCarrera && pasaCiclo;
  });
}

// ACTUALIZA ESTA FUNCIÓN (Reemplaza la del Commit 1)
function refrescarListado() {
  const filtradas = filtrarMatriculas();
  const ordenadas = ordenarMatriculas(filtradas);
  renderizarTabla(ordenadas);
}

buscador.addEventListener('input', refrescarListado);
filtroCarrera.addEventListener('change', refrescarListado);
filtroCiclo.addEventListener('change', refrescarListado);

/**
 * Redibuja la tabla respetando lo que haya escrito en el buscador.
 * Debe usarse despues de registrar o eliminar, para no perder el filtro activo.
 */
function refrescarListado() {
  renderizarTabla(filtrarMatriculas());
}

buscador.addEventListener('input', refrescarListado);

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

/* ===== Exportación a CSV ===== */

const ENCABEZADOS_CSV = ['Codigo', 'Nombres', 'Apellidos', 'DNI', 'Carrera', 'Ciclo', 'Curso', 'Fecha'];

/** Escapa un valor para que pueda incluirse en una celda CSV. */
function escaparCsv(valor) {
  return `"${String(valor).replace(/"/g, '""')}"`;
}

/** Arma el contenido CSV a partir de las matrículas indicadas. */
function construirCsv(lista) {
  const filas = lista.map(matricula => [
    matricula.codigo,
    matricula.nombres,
    matricula.apellidos,
    matricula.dni,
    matricula.carrera,
    matricula.ciclo,
    matricula.curso,
    matricula.fecha
  ].map(escaparCsv).join(';'));

  return [ENCABEZADOS_CSV.join(';'), ...filas].join('\n');
}

/** Descarga el listado actual como archivo CSV. */
function exportarCsv() {
  if (matriculas.length === 0) {
    mostrarAviso('No hay matrículas para exportar.', 'error');
    return;
  }

  // El BOM inicial permite que Excel reconozca los acentos como UTF-8.
  const contenido = new Blob(['\ufeff' + construirCsv(matriculas)], {
    type: 'text/csv;charset=utf-8;'
  });

  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(contenido);
  enlace.download = 'matriculas.csv';
  enlace.click();
  URL.revokeObjectURL(enlace.href);

  mostrarAviso('Listado exportado a CSV');
}

document.getElementById('btnExportar').addEventListener('click', exportarCsv);
/* ===== Resumen por carrera ===== */

const panelResumen = document.getElementById('panelResumen');

/** Cuenta cuántas matrículas hay por cada carrera. */
function contarPorCarrera() {
  return matriculas.reduce((conteo, matricula) => {
    conteo[matricula.carrera] = (conteo[matricula.carrera] || 0) + 1;
    return conteo;
  }, {});
}

/** Dibuja el panel con el total de matrículas de cada carrera. */
function renderizarResumen() {
  const conteo = contarPorCarrera();
  const carreras = Object.keys(conteo).sort();

  panelResumen.innerHTML = '';

  if (carreras.length === 0) {
    const vacio = document.createElement('p');
    vacio.className = 'sin-datos';
    vacio.textContent = 'Todavía no hay matrículas para resumir.';
    panelResumen.appendChild(vacio);
    return;
  }

  const lista = document.createElement('ul');
  carreras.forEach(carrera => {
    const item = document.createElement('li');
    const nombre = document.createElement('strong');
    nombre.textContent = carrera;
    item.appendChild(nombre);
    item.appendChild(document.createTextNode(`: ${conteo[carrera]} matriculado(s)`));
    lista.appendChild(item);
  });
  panelResumen.appendChild(lista);
}

/** Muestra u oculta el panel de resumen. */
function alternarResumen() {
  renderizarResumen();
  panelResumen.classList.toggle('oculto');
}

document.getElementById('btnResumen').addEventListener('click', alternarResumen);
