const { test, describe } = require('node:test');
const assert = require('node:assert');
const { abrirAplicacion, leer, registrarMatricula, registrarCurso, CURSOS_DE_PRUEBA } = require('./entorno');

const ALUMNO = {
  nombres: 'Juan', apellidos: 'Perez', codigo: '2026-0001', dni: '12345678',
  carrera: 'Ingeniería de Sistemas', ciclo: 'III', cursoCodigo: 'SIS-101',
};

describe('Catalogo de cursos', () => {
  test('siembra el catalogo inicial la primera vez', () => {
    const app = abrirAplicacion();
    assert.ok(leer(app, 'cursos').length >= 4);
    app.cerrar();
  });

  test('registra un curso nuevo', () => {
    const app = abrirAplicacion({ cursos: CURSOS_DE_PRUEBA });
    const aviso = registrarCurso(app, {
      codigo: 'CON-200', nombre: 'Costos', carrera: 'Contabilidad', ciclo: 'IV', vacantes: 20,
    });

    assert.match(aviso, /registrado correctamente/);
    assert.strictEqual(leer(app, 'cursos').length, 5);
    app.cerrar();
  });

  test('rechaza un codigo de curso con formato invalido', () => {
    const app = abrirAplicacion({ cursos: CURSOS_DE_PRUEBA });
    const aviso = registrarCurso(app, {
      codigo: 'xx1', nombre: 'Costos', carrera: 'Contabilidad', ciclo: 'IV', vacantes: 20,
    });

    assert.match(aviso, /formato SIS-101/);
    app.cerrar();
  });

  test('rechaza vacantes que no sean un entero positivo', () => {
    const app = abrirAplicacion({ cursos: CURSOS_DE_PRUEBA });
    const aviso = registrarCurso(app, {
      codigo: 'CON-200', nombre: 'Costos', carrera: 'Contabilidad', ciclo: 'IV', vacantes: 0,
    });

    assert.match(aviso, /mayor que cero/);
    app.cerrar();
  });

  test('rechaza un codigo de curso repetido', () => {
    const app = abrirAplicacion({ cursos: CURSOS_DE_PRUEBA });
    const aviso = registrarCurso(app, {
      codigo: 'SIS-101', nombre: 'Otro', carrera: 'Contabilidad', ciclo: 'IV', vacantes: 20,
    });

    assert.match(aviso, /Ya existe un curso/);
    app.cerrar();
  });
});

describe('Edicion de cursos', () => {
  test('al renombrar un curso actualiza las matriculas', () => {
    const app = abrirAplicacion({ cursos: CURSOS_DE_PRUEBA });
    registrarMatricula(app, ALUMNO);

    app.ventana.cargarCursoEnFormulario(app.ventana.buscarCurso('SIS-101'));
    registrarCurso(app, {
      codigo: 'SIS-101', nombre: 'Algoritmos I', carrera: 'Ingeniería de Sistemas', ciclo: 'III', vacantes: 2,
    });

    assert.strictEqual(leer(app, 'matriculas')[0].curso, 'Algoritmos I');
    app.cerrar();
  });

  test('al cambiar el codigo vuelve a apuntar las matriculas', () => {
    const app = abrirAplicacion({ cursos: CURSOS_DE_PRUEBA });
    registrarMatricula(app, ALUMNO);

    app.ventana.cargarCursoEnFormulario(app.ventana.buscarCurso('SIS-101'));
    registrarCurso(app, {
      codigo: 'SIS-999', nombre: 'Algoritmos', carrera: 'Ingeniería de Sistemas', ciclo: 'III', vacantes: 2,
    });

    assert.strictEqual(leer(app, 'matriculas')[0].cursoCodigo, 'SIS-999');
    app.cerrar();
  });

  test('no deja reducir las vacantes por debajo de la ocupacion', () => {
    const app = abrirAplicacion({ cursos: CURSOS_DE_PRUEBA });
    registrarMatricula(app, ALUMNO);
    registrarMatricula(app, { ...ALUMNO, codigo: '2026-0002', dni: '22222222' });

    app.ventana.cargarCursoEnFormulario(app.ventana.buscarCurso('SIS-101'));
    const aviso = registrarCurso(app, {
      codigo: 'SIS-101', nombre: 'Algoritmos', carrera: 'Ingeniería de Sistemas', ciclo: 'III', vacantes: 1,
    });

    assert.match(aviso, /no puede dejar menos vacantes/);
    app.cerrar();
  });
});

describe('Edicion de matriculas', () => {
  test('se puede corregir una matricula aunque su curso este lleno', () => {
    const app = abrirAplicacion({ cursos: CURSOS_DE_PRUEBA });
    registrarMatricula(app, ALUMNO);
    registrarMatricula(app, { ...ALUMNO, codigo: '2026-0002', dni: '22222222' });
    // SIS-101 tiene 2 vacantes: ahora esta lleno.

    const primera = leer(app, 'matriculas')[0];
    app.ventana.cargarEnFormulario(primera);

    // El selector debe quedar apuntando a su curso aunque este agotado.
    assert.strictEqual(app.documento.getElementById('curso').value, 'SIS-101',
      'el selector perdio el curso de la matricula que se esta editando');

    app.documento.getElementById('nombres').value = 'Juan Carlos';
    app.documento.getElementById('formMatricula')
      .dispatchEvent(new app.ventana.Event('submit', { cancelable: true, bubbles: true }));

    assert.match(app.documento.getElementById('aviso').textContent, /actualizada correctamente/);
    assert.strictEqual(leer(app, 'matriculas').length, 2);
    assert.strictEqual(leer(app, 'matriculas')[0].nombres, 'Juan Carlos');
    app.cerrar();
  });
});
