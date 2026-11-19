const { test, describe } = require('node:test');
const assert = require('node:assert');
const {
  abrirAplicacion, registrarMatricula, exportarCsvCapturando, CURSOS_DE_PRUEBA,
} = require('./entorno');

/** Registra una matricula de Sistemas y otra de Administracion. */
function conDosCarreras() {
  const app = abrirAplicacion({ cursos: CURSOS_DE_PRUEBA });
  registrarMatricula(app, {
    nombres: 'Juan', apellidos: 'Perez', codigo: '2026-0001', dni: '11111111',
    carrera: 'Ingeniería de Sistemas', ciclo: 'III', cursoCodigo: 'SIS-101',
  });
  registrarMatricula(app, {
    nombres: 'Ana', apellidos: 'Lopez', codigo: '2026-0002', dni: '22222222',
    carrera: 'Administración', ciclo: 'IX', cursoCodigo: 'ADM-110',
  });
  return app;
}

/** Filas de datos del CSV exportado, sin el encabezado. */
function filasExportadas(app) {
  const csv = exportarCsvCapturando(app);
  return csv === null ? [] : csv.split('\n').slice(1).filter(Boolean);
}

/** Filas visibles en la tabla del listado. */
function filasEnPantalla(app) {
  return app.documento.querySelectorAll('#cuerpoTabla tr').length;
}

describe('Exportacion a CSV', () => {
  test('exporta todas las matriculas cuando no hay filtros', () => {
    const app = conDosCarreras();
    assert.strictEqual(filasExportadas(app).length, 2);
    app.cerrar();
  });

  // Incidencia #20: el archivo traia todas las matriculas aunque la tabla
  // estuviera filtrada. La prueba intercepta la descarga para comprobar lo
  // que realmente se exporta, no lo que el filtro devuelve por separado.
  test('exporta solo lo visible cuando hay un filtro de carrera activo', () => {
    const app = conDosCarreras();
    app.documento.getElementById('filtroCarrera').value = 'Administración';
    app.ventana.refrescarListado();

    const exportadas = filasExportadas(app);

    assert.strictEqual(filasEnPantalla(app), 1);
    assert.strictEqual(exportadas.length, 1,
      'el CSV debe contener exactamente las filas visibles en el listado');
    assert.ok(exportadas[0].includes('Ana'), `fila inesperada: ${exportadas[0]}`);
    assert.ok(!exportadas[0].includes('Juan'), 'se exporto una matricula filtrada');
    app.cerrar();
  });

  test('exporta solo lo visible cuando hay una busqueda activa', () => {
    const app = conDosCarreras();
    app.documento.getElementById('buscador').value = 'Juan';
    app.ventana.refrescarListado();

    const exportadas = filasExportadas(app);

    assert.strictEqual(filasEnPantalla(app), 1);
    assert.strictEqual(exportadas.length, 1);
    assert.ok(exportadas[0].includes('Juan'));
    app.cerrar();
  });

  test('respeta el orden del listado al exportar', () => {
    const app = conDosCarreras();
    const encabezado = app.documento.querySelector('th[data-columna="codigo"]');
    encabezado.dispatchEvent(new app.ventana.Event('click', { bubbles: true }));
    encabezado.dispatchEvent(new app.ventana.Event('click', { bubbles: true }));  // descendente

    const exportadas = filasExportadas(app);

    assert.ok(exportadas[0].includes('2026-0002'),
      `el CSV no sigue el orden de la tabla: ${exportadas[0]}`);
    app.cerrar();
  });

  test('avisa y no descarga nada si ningun registro coincide con los filtros', () => {
    const app = conDosCarreras();
    app.documento.getElementById('buscador').value = 'no-existe-nadie';
    app.ventana.refrescarListado();

    assert.strictEqual(exportarCsvCapturando(app), null, 'no deberia generarse archivo');
    assert.match(app.documento.getElementById('aviso').textContent,
      /Ninguna matrícula coincide/);
    app.cerrar();
  });

  test('avisa de otro modo cuando no hay ninguna matricula registrada', () => {
    const app = abrirAplicacion({ cursos: CURSOS_DE_PRUEBA });

    assert.strictEqual(exportarCsvCapturando(app), null);
    assert.match(app.documento.getElementById('aviso').textContent,
      /No hay matrículas para exportar/);
    app.cerrar();
  });

  test('el CSV escapa las comillas de los valores', () => {
    const app = abrirAplicacion({ cursos: CURSOS_DE_PRUEBA });
    const linea = app.ventana.construirCsv([{
      codigo: '2026-0001', nombres: 'Juan "JC"', apellidos: 'Perez', dni: '11111111',
      carrera: 'Ingeniería de Sistemas', ciclo: 'III', curso: 'Algoritmos', fecha: '01/01/2026',
    }]).split('\n')[1];

    assert.ok(linea.includes('"Juan ""JC"""'), `linea inesperada: ${linea}`);
    app.cerrar();
  });
});
