const { test, describe } = require('node:test');
const assert = require('node:assert');
const { abrirAplicacion, CURSOS_DE_PRUEBA } = require('./entorno');

/** Matricula minima; solo importan el codigo y la fecha para ordenar. */
function matricula(id, fecha) {
  const datos = {
    id, nombres: 'Alumno', apellidos: String(id), codigo: `2026-000${id}`,
    dni: `1234567${id}`, carrera: 'Ingeniería de Sistemas', ciclo: 'III',
    cursoCodigo: 'SIS-101', curso: 'Algoritmos',
  };
  if (fecha !== undefined) datos.fecha = fecha;
  return datos;
}

/**
 * Abre la aplicacion con matriculas que mezclan fechas validas, una sin el
 * campo y otra con un formato que no se puede leer. Las incompletas se
 * siembran intercaladas a proposito, para que solo queden al final si el
 * ordenamiento las manda alli.
 */
function abrirConFechasIncompletas() {
  const app = abrirAplicacion({
    cursos: CURSOS_DE_PRUEBA,
    matriculas: [
      matricula(1, '15/03/2026'),
      matricula(2),                  // sin campo fecha
      matricula(3, '02/01/2026'),
      matricula(4, 'sin registrar'), // formato que no es DD/MM/AAAA
      matricula(5, '20/11/2025'),
    ],
  });

  // Las excepciones dentro de un manejador de eventos no llegan al test: jsdom
  // las reporta en la ventana. Se recogen para poder afirmar que no hubo.
  app.errores = [];
  app.ventana.addEventListener('error', evento => app.errores.push(evento.error));
  return app;
}

function ordenarPorFecha(app, veces) {
  const encabezado = app.documento.querySelector('th[data-columna="fecha"]');
  for (let i = 0; i < veces; i++) {
    encabezado.dispatchEvent(new app.ventana.Event('click', { bubbles: true }));
  }
}

/** Codigos de estudiante en el orden en que se ven en la tabla. */
function codigosEnPantalla(app) {
  return [...app.documento.querySelectorAll('#cuerpoTabla tr')]
    .map(fila => fila.cells[0].textContent);
}

describe('Ordenamiento por fecha con datos incompletos (#21)', () => {
  test('no lanza excepcion si una matricula no tiene fecha', () => {
    const app = abrirConFechasIncompletas();
    ordenarPorFecha(app, 1);

    assert.deepStrictEqual(app.errores, []);
    assert.strictEqual(codigosEnPantalla(app).length, 5);
    app.cerrar();
  });

  test('en orden ascendente deja las fechas faltantes al final', () => {
    const app = abrirConFechasIncompletas();
    ordenarPorFecha(app, 1);

    const codigos = codigosEnPantalla(app);
    assert.deepStrictEqual(codigos.slice(0, 3), ['2026-0005', '2026-0003', '2026-0001']);
    assert.deepStrictEqual([...codigos.slice(3)].sort(), ['2026-0002', '2026-0004']);
    app.cerrar();
  });

  test('en orden descendente tambien deja las fechas faltantes al final', () => {
    const app = abrirConFechasIncompletas();
    ordenarPorFecha(app, 2);

    const codigos = codigosEnPantalla(app);
    assert.deepStrictEqual(app.errores, []);
    assert.deepStrictEqual(codigos.slice(0, 3), ['2026-0001', '2026-0003', '2026-0005']);
    assert.deepStrictEqual([...codigos.slice(3)].sort(), ['2026-0002', '2026-0004']);
    app.cerrar();
  });

  test('con todas las fechas completas el orden no cambia', () => {
    const app = abrirAplicacion({
      cursos: CURSOS_DE_PRUEBA,
      matriculas: [matricula(1, '15/03/2026'), matricula(2, '02/01/2026'), matricula(3, '20/11/2025')],
    });
    ordenarPorFecha(app, 1);

    assert.deepStrictEqual(codigosEnPantalla(app), ['2026-0003', '2026-0002', '2026-0001']);
    app.cerrar();
  });
});
