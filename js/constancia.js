/* Sistema de Matrícula - constancia de matrícula imprimible */

const vistaConstancia = document.getElementById('vistaConstancia');

/**
 * Devuelve el código del curso de una matrícula.
 * Las matrículas registradas antes del catálogo no guardaron el código, así que
 * se busca el curso por nombre, carrera y ciclo.
 */
function codigoCursoDeMatricula(matricula) {
  if (matricula.cursoCodigo) return matricula.cursoCodigo;
  const curso = cursos.find(item =>
    item.nombre.toLowerCase() === matricula.curso.toLowerCase() &&
    item.carrera === matricula.carrera &&
    item.ciclo === matricula.ciclo);
  return curso ? curso.codigo : 'Sin código';
}

/** Escribe un dato de la matrícula en su campo de la constancia. */
function llenarCampo(campo, valor) {
  vistaConstancia.querySelector(`[data-campo="${campo}"]`).textContent = valor;
}

/** Llena la constancia con los datos de la matrícula y la muestra. */
function abrirConstancia(matricula) {
  llenarCampo('nombre', `${matricula.nombres} ${matricula.apellidos}`);
  llenarCampo('codigo', matricula.codigo);
  llenarCampo('dni', matricula.dni);
  llenarCampo('carrera', matricula.carrera);
  llenarCampo('ciclo', matricula.ciclo);
  llenarCampo('curso', matricula.curso);
  llenarCampo('cursoCodigo', codigoCursoDeMatricula(matricula));
  llenarCampo('fecha', matricula.fecha);
  llenarCampo('emision', new Date().toLocaleDateString('es-PE'));

  vistaConstancia.classList.remove('oculto');
  document.body.classList.add('con-constancia');
}

/** Cierra la constancia y vuelve al listado. */
function cerrarConstancia() {
  vistaConstancia.classList.add('oculto');
  document.body.classList.remove('con-constancia');
}

cuerpoTabla.addEventListener('click', evento => {
  if (!evento.target.classList.contains('btn-constancia')) return;
  const id = Number(evento.target.dataset.id);
  const matricula = matriculas.find(item => item.id === id);
  if (matricula) abrirConstancia(matricula);
});

document.getElementById('btnImprimirConstancia').addEventListener('click', () => window.print());
document.getElementById('btnCerrarConstancia').addEventListener('click', cerrarConstancia);

document.addEventListener('keydown', evento => {
  if (evento.key === 'Escape' && !vistaConstancia.classList.contains('oculto')) {
    cerrarConstancia();
  }
});
