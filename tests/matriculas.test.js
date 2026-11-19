const { test, describe } = require('node:test');
const assert = require('node:assert');
const { abrirAplicacion, leer, registrarMatricula, CURSOS_DE_PRUEBA } = require('./entorno');

const ALUMNO = {
  nombres: 'Juan', apellidos: 'Perez', codigo: '2026-0001', dni: '12345678',
  carrera: 'Ingeniería de Sistemas', ciclo: 'III', cursoCodigo: 'SIS-101',
};

describe('Registro de matriculas', () => {
  test('registra una matricula valida', () => {
    const app = abrirAplicacion({ cursos: CURSOS_DE_PRUEBA });
    const aviso = registrarMatricula(app, ALUMNO);

    assert.match(aviso, /registrada correctamente/);
    assert.strictEqual(leer(app, 'matriculas').length, 1);
    assert.strictEqual(leer(app, 'matriculas')[0].cursoCodigo, 'SIS-101');
    assert.strictEqual(leer(app, 'matriculas')[0].curso, 'Algoritmos');
    app.cerrar();
  });

  test('guarda el nombre del curso ademas del codigo', () => {
    const app = abrirAplicacion({ cursos: CURSOS_DE_PRUEBA });
    registrarMatricula(app, ALUMNO);
    const guardado = JSON.parse(app.ventana.localStorage.getItem('matriculas'));

    assert.strictEqual(guardado[0].curso, 'Algoritmos');
    app.cerrar();
  });

  test('rechaza un codigo de estudiante con formato invalido', () => {
    const app = abrirAplicacion({ cursos: CURSOS_DE_PRUEBA });
    const aviso = registrarMatricula(app, { ...ALUMNO, codigo: '26-1' });

    assert.match(aviso, /formato 2026-0001/);
    assert.strictEqual(leer(app, 'matriculas').length, 0);
    app.cerrar();
  });

  test('rechaza un DNI que no tenga ocho digitos', () => {
    const app = abrirAplicacion({ cursos: CURSOS_DE_PRUEBA });
    const aviso = registrarMatricula(app, { ...ALUMNO, dni: '123' });

    assert.match(aviso, /ocho d|8 d/i);
    assert.strictEqual(leer(app, 'matriculas').length, 0);
    app.cerrar();
  });

  test('rechaza la matricula sin curso seleccionado', () => {
    const app = abrirAplicacion({ cursos: CURSOS_DE_PRUEBA });
    const aviso = registrarMatricula(app, { ...ALUMNO, cursoCodigo: '' });

    assert.match(aviso, /seleccionar el curso/);
    assert.strictEqual(leer(app, 'matriculas').length, 0);
    app.cerrar();
  });
});

describe('Control de duplicados', () => {
  test('rechaza al mismo estudiante en el mismo curso', () => {
    const app = abrirAplicacion({ cursos: CURSOS_DE_PRUEBA });
    registrarMatricula(app, ALUMNO);
    const aviso = registrarMatricula(app, ALUMNO);

    assert.match(aviso, /ya está matriculado/);
    assert.strictEqual(leer(app, 'matriculas').length, 1);
    app.cerrar();
  });

  test('permite dos cursos homonimos en ciclos distintos', () => {
    // ADM-110 y ADM-120 se llaman igual pero son cursos distintos.
    const app = abrirAplicacion({ cursos: CURSOS_DE_PRUEBA });
    const base = { nombres: 'Ana', apellidos: 'Lopez', codigo: '2026-0002',
                   dni: '87654321', carrera: 'Administración' };

    registrarMatricula(app, { ...base, ciclo: 'IX', cursoCodigo: 'ADM-110' });
    const aviso = registrarMatricula(app, { ...base, ciclo: 'X', cursoCodigo: 'ADM-120' });

    assert.match(aviso, /registrada correctamente/);
    assert.strictEqual(leer(app, 'matriculas').length, 2);
    app.cerrar();
  });
});

describe('Control de vacantes', () => {
  test('rechaza la matricula cuando el curso esta lleno', () => {
    const app = abrirAplicacion({ cursos: CURSOS_DE_PRUEBA });  // SIS-101 tiene 2
    registrarMatricula(app, ALUMNO);
    registrarMatricula(app, { ...ALUMNO, codigo: '2026-0002', dni: '22222222' });
    const aviso = registrarMatricula(app, { ...ALUMNO, codigo: '2026-0003', dni: '33333333' });

    assert.match(aviso, /no tiene vacantes/);
    assert.strictEqual(leer(app, 'matriculas').length, 2);
    app.cerrar();
  });

  test('cuenta las matriculas anteriores al catalogo, que no guardan codigo', () => {
    const antigua = {
      id: 1, nombres: 'Vieja', apellidos: 'Matricula', codigo: '2025-0001',
      dni: '99999999', carrera: 'Ingeniería de Sistemas', ciclo: 'III',
      curso: 'Algoritmos', fecha: '01/01/2025',
    };
    const app = abrirAplicacion({ cursos: CURSOS_DE_PRUEBA, matriculas: [antigua] });
    const curso = app.ventana.buscarCurso('SIS-101');

    assert.strictEqual(app.ventana.contarOcupacion(curso), 1);
    assert.strictEqual(app.ventana.vacantesLibres(curso), 1);
    app.cerrar();
  });

  test('vacantesLibres nunca devuelve un numero negativo', () => {
    const app = abrirAplicacion({
      cursos: [{ codigo: 'SIS-101', nombre: 'Algoritmos', carrera: 'Ingeniería de Sistemas', ciclo: 'III', vacantes: 1 }],
      matriculas: [1, 2, 3].map(n => ({
        id: n, nombres: 'A' + n, apellidos: 'B', codigo: `2026-000${n}`, dni: '1111111' + n,
        carrera: 'Ingeniería de Sistemas', ciclo: 'III', cursoCodigo: 'SIS-101',
        curso: 'Algoritmos', fecha: '01/01/2026',
      })),
    });
    const curso = app.ventana.buscarCurso('SIS-101');

    assert.strictEqual(app.ventana.contarOcupacion(curso), 3);
    assert.strictEqual(app.ventana.vacantesLibres(curso), 0);
    app.cerrar();
  });
});
