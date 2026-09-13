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
