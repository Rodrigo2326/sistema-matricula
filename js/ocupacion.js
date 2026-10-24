/* Sistema de Matrícula - panel de ocupación por curso */

const panelOcupacion = document.getElementById('panelOcupacion');

/** Clasifica el llenado de un curso para darle color a la barra. */
function nivelDeOcupacion(porcentaje) {
  if (porcentaje >= 100) return 'lleno';
  if (porcentaje >= 70) return 'alto';
  return 'normal';
}

/** Arma la barra de ocupación de un curso. */
function crearBarraDeCurso(curso) {
  const ocupados = contarOcupacion(curso);
  const porcentaje = Math.round((ocupados / curso.vacantes) * 100);

  const fila = document.createElement('div');
  fila.className = 'ocupacion-fila';

  const titulo = document.createElement('div');
  titulo.className = 'ocupacion-titulo';
  titulo.textContent = `${curso.codigo} — ${curso.nombre}`;
  fila.appendChild(titulo);

  const canal = document.createElement('div');
  canal.className = 'ocupacion-canal';

  const barra = document.createElement('div');
  barra.className = `ocupacion-barra ${nivelDeOcupacion(porcentaje)}`;
  barra.style.width = `${Math.min(porcentaje, 100)}%`;
  canal.appendChild(barra);
  fila.appendChild(canal);

  const cifra = document.createElement('div');
  cifra.className = 'ocupacion-cifra';
  cifra.textContent = `${ocupados} / ${curso.vacantes} (${porcentaje}%)`;
  fila.appendChild(cifra);

  return fila;
}

/** Dibuja el panel completo. */
function renderizarOcupacion() {
  panelOcupacion.innerHTML = '';

  if (cursos.length === 0) {
    const vacio = document.createElement('p');
    vacio.className = 'sin-datos';
    vacio.textContent = 'Todavía no hay cursos en el catálogo.';
    panelOcupacion.appendChild(vacio);
    return;
  }

  const llenos = cursos.filter(curso => vacantesLibres(curso) === 0).length;

  const aviso = document.createElement('p');
  aviso.className = 'ocupacion-aviso';
  aviso.textContent = llenos === 0
    ? 'Todos los cursos tienen vacantes disponibles.'
    : `${llenos} curso(s) sin vacantes.`;
  panelOcupacion.appendChild(aviso);

  cursos.forEach(curso => panelOcupacion.appendChild(crearBarraDeCurso(curso)));
}

/** Muestra u oculta el panel. */
function alternarOcupacion() {
  renderizarOcupacion();
  panelOcupacion.classList.toggle('oculto');
}

document.getElementById('btnOcupacion').addEventListener('click', alternarOcupacion);