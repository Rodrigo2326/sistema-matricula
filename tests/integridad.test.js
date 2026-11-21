const { test, describe } = require('node:test');
const assert = require('node:assert');
const {
  abrirAplicacion, leer, registrarMatricula, registrarCurso, CURSOS_DE_PRUEBA,
} = require('./entorno');

const ALUMNO = {
  nombres: 'Juan', apellidos: 'Perez', codigo: '2026-0001', dni: '12345678',
  carrera: 'Ingeniería de Sistemas', ciclo: 'III', cursoCodigo: 'SIS-101',
};

/**
 * Deja el almacenamiento rechazando solo la escritura de una clave concreta.
 *
 * Hace falta ese grano fino para esta prueba: el caso que se quiere reproducir
 * es que el guardado de las matriculas funcione y el del catalogo falle.
 */
function conClaveQueFalla(app, clave, fn) {
  const original = app.ventana.Storage.prototype.setItem;
  app.ventana.Storage.prototype.setItem = function (nombre, valor) {
    if (nombre === clave) {
      const error = new Error('No queda espacio en el almacenamiento');
      error.name = 'QuotaExceededError';
      throw error;
    }
    return original.call(this, nombre, valor);
  };
  try {
    return fn();
  } finally {
    app.ventana.Storage.prototype.setItem = original;
  }
}

describe('Integridad entre el catalogo y las matriculas', () => {
  // Observacion de @soulahrikermette-hub en la revision del PR #33: el
  // retroceso estaba incompleto. propagarCambiosDelCurso actualizaba y
  // guardaba las matriculas antes de guardar el catalogo, de modo que al
  // fallar ese guardado los cursos volvian atras y las matriculas se quedaban
  // apuntando a un codigo que nunca llego a existir.
  test('si falla el guardado del catalogo, las matriculas no quedan huerfanas', () => {
    const app = abrirAplicacion({ cursos: CURSOS_DE_PRUEBA });
    app.ventana.console.error = () => {};
    registrarMatricula(app, ALUMNO);

    app.ventana.cargarCursoEnFormulario(app.ventana.buscarCurso('SIS-101'));
    const aviso = conClaveQueFalla(app, 'cursos', () => registrarCurso(app, {
      codigo: 'SIS-999', nombre: 'Algoritmos',
      carrera: 'Ingeniería de Sistemas', ciclo: 'III', vacantes: 2,
    }));

    const matricula = leer(app, 'matriculas')[0];

    assert.match(aviso, /No se pudo guardar el catálogo/);
    assert.strictEqual(matricula.cursoCodigo, 'SIS-101',
      'la matricula no debe apuntar a un codigo que no llego a guardarse');
    assert.ok(app.ventana.buscarCurso(matricula.cursoCodigo),
      'el curso al que apunta la matricula debe existir en el catalogo');
    app.cerrar();
  });

  test('si falla el guardado del catalogo, la ocupacion sigue siendo correcta', () => {
    const app = abrirAplicacion({ cursos: CURSOS_DE_PRUEBA });
    app.ventana.console.error = () => {};
    registrarMatricula(app, ALUMNO);

    app.ventana.cargarCursoEnFormulario(app.ventana.buscarCurso('SIS-101'));
    conClaveQueFalla(app, 'cursos', () => registrarCurso(app, {
      codigo: 'SIS-999', nombre: 'Algoritmos',
      carrera: 'Ingeniería de Sistemas', ciclo: 'III', vacantes: 2,
    }));

    assert.strictEqual(app.ventana.contarOcupacion(app.ventana.buscarCurso('SIS-101')), 1,
      'el curso perdio la cuenta de su unico matriculado');
    app.cerrar();
  });

  test('cuando el guardado funciona, el cambio de codigo si se propaga', () => {
    const app = abrirAplicacion({ cursos: CURSOS_DE_PRUEBA });
    registrarMatricula(app, ALUMNO);

    app.ventana.cargarCursoEnFormulario(app.ventana.buscarCurso('SIS-101'));
    registrarCurso(app, {
      codigo: 'SIS-999', nombre: 'Algoritmos I',
      carrera: 'Ingeniería de Sistemas', ciclo: 'III', vacantes: 2,
    });

    const matricula = leer(app, 'matriculas')[0];

    assert.strictEqual(matricula.cursoCodigo, 'SIS-999');
    assert.strictEqual(matricula.curso, 'Algoritmos I');
    assert.strictEqual(app.ventana.contarOcupacion(app.ventana.buscarCurso('SIS-999')), 1);
    app.cerrar();
  });
});
