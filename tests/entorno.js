/**
 * Arranca la aplicacion dentro de un DOM simulado para poder probarla sin
 * navegador.
 *
 * Los archivos de js/ son scripts clasicos que tocan el DOM en cuanto se
 * cargan: no exportan nada y asumen que index.html ya existe. En lugar de
 * reescribirlos para poder importarlos, se levanta el index.html real y se
 * ejecutan dentro, que ademas prueba el mismo HTML que se publica.
 */

const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const RAIZ = path.join(__dirname, '..');
const SCRIPTS = ['js/app.js', 'js/cursos.js', 'js/constancia.js', 'js/ocupacion.js'];

/**
 * Devuelve la aplicacion recien cargada.
 *
 * @param {object} [datos] Estado inicial del almacenamiento local.
 * @param {Array}  [datos.matriculas]
 * @param {Array}  [datos.cursos]
 * @returns {{ventana: Window, documento: Document, cerrar: Function}}
 */
function abrirAplicacion(datos = {}) {
  // Se quitan las etiquetas <script src> del HTML: jsdom no resuelve rutas
  // locales, y ademas conviene sembrar el almacenamiento antes de ejecutarlos.
  const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8')
    .replace(/\s*<script src="js\/[^"]+"><\/script>/g, '');

  const dom = new JSDOM(html, {
    url: 'http://localhost/',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
  });

  const ventana = dom.window;

  // El estado inicial se siembra antes de ejecutar los scripts, porque los
  // modulos leen el almacenamiento en cuanto se cargan.
  if (datos.matriculas) {
    ventana.localStorage.setItem('matriculas', JSON.stringify(datos.matriculas));
  }
  if (datos.cursos) {
    ventana.localStorage.setItem('cursos', JSON.stringify(datos.cursos));
  }

  // scrollIntoView no existe en jsdom y la aplicacion lo usa al editar.
  ventana.HTMLElement.prototype.scrollIntoView = function () {};

  // Los scripts se insertan como etiquetas reales, en el mismo orden que en
  // index.html. Inyectarlos asi -y no con eval- es lo que hace que sus
  // declaraciones let y const queden en el ambito global de la ventana y no
  // en un ambito temporal que se descarta.
  for (const rel of SCRIPTS) {
    const etiqueta = ventana.document.createElement('script');
    etiqueta.textContent = fs.readFileSync(path.join(RAIZ, rel), 'utf8');
    ventana.document.body.appendChild(etiqueta);
  }

  return {
    ventana,
    documento: ventana.document,
    cerrar: () => ventana.close(),
  };
}

/**
 * Lee una variable del ambito global de la aplicacion.
 *
 * Los modulos declaran su estado con let y const, que crean enlaces lexicos
 * globales pero no propiedades de window, de modo que ventana.matriculas es
 * undefined. Evaluar el nombre dentro de la ventana si las alcanza.
 */
function leer(app, expresion) {
  return app.ventana.eval(expresion);
}

/** Rellena el formulario de matricula y lo envia. */
function registrarMatricula(app, datos) {
  const { documento } = app;
  documento.getElementById('carrera').value = datos.carrera;
  documento.getElementById('ciclo').value = datos.ciclo;
  app.ventana.actualizarSelectorCursos();

  documento.getElementById('nombres').value = datos.nombres;
  documento.getElementById('apellidos').value = datos.apellidos;
  documento.getElementById('codigo').value = datos.codigo;
  documento.getElementById('dni').value = datos.dni;
  documento.getElementById('curso').value = datos.cursoCodigo;

  documento.getElementById('formMatricula')
    .dispatchEvent(new app.ventana.Event('submit', { cancelable: true, bubbles: true }));

  return documento.getElementById('aviso').textContent;
}

/** Rellena el formulario de cursos y lo envia. */
function registrarCurso(app, datos) {
  const { documento } = app;
  documento.getElementById('codigoCurso').value = datos.codigo;
  documento.getElementById('nombreCurso').value = datos.nombre;
  documento.getElementById('carreraCurso').value = datos.carrera;
  documento.getElementById('cicloCurso').value = datos.ciclo;
  documento.getElementById('vacantesCurso').value = String(datos.vacantes);

  documento.getElementById('formCurso')
    .dispatchEvent(new app.ventana.Event('submit', { cancelable: true, bubbles: true }));

  return documento.getElementById('aviso').textContent;
}

/** Catalogo minimo y predecible para las pruebas. */
const CURSOS_DE_PRUEBA = [
  { codigo: 'SIS-101', nombre: 'Algoritmos', carrera: 'Ingeniería de Sistemas', ciclo: 'III', vacantes: 2 },
  { codigo: 'SIS-205', nombre: 'Herramientas de Desarrollo', carrera: 'Ingeniería de Sistemas', ciclo: 'V', vacantes: 10 },
  { codigo: 'ADM-110', nombre: 'Practica Preprofesional', carrera: 'Administración', ciclo: 'IX', vacantes: 5 },
  { codigo: 'ADM-120', nombre: 'Practica Preprofesional', carrera: 'Administración', ciclo: 'X', vacantes: 5 },
];

module.exports = { abrirAplicacion, leer, registrarMatricula, registrarCurso, CURSOS_DE_PRUEBA };
