/**
 * Verificaciones estaticas del proyecto, pensadas para correr en el pipeline
 * antes de las pruebas.
 *
 * Comprueban cosas que ya rompieron el proyecto al menos una vez:
 *  - que las llaves de la hoja de estilos esten balanceadas (en el APF2 una
 *    resolucion de conflicto perdio una llave y dejo medio archivo anidado
 *    dentro de una regla @media print);
 *  - que los scripts se carguen en orden de dependencia (ocupacion.js llego a
 *    cargarse antes que cursos.js, del que depende);
 *  - que cada archivo referenciado desde index.html exista de verdad.
 *
 * Uso: node tests/herramientas/verificar-estructura.js
 */

const fs = require('node:fs');
const path = require('node:path');

const RAIZ = path.join(__dirname, '..', '..');
const fallos = [];
const comprobaciones = [];

function comprobar(descripcion, condicion, detalle) {
  comprobaciones.push(descripcion);
  if (!condicion) fallos.push(`${descripcion}\n    ${detalle}`);
}

const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(RAIZ, 'css', 'estilos.css'), 'utf8');

// --- Hoja de estilos ---------------------------------------------------
const abiertas = (css.match(/{/g) || []).length;
const cerradas = (css.match(/}/g) || []).length;
comprobar(
  'Las llaves de css/estilos.css estan balanceadas',
  abiertas === cerradas,
  `${abiertas} de apertura y ${cerradas} de cierre`);

// Ninguna regla de nivel superior debe quedar dentro de otra por descuido.
const marcadores = ['/* ===== Panel de ocupación por curso ===== */',
                    '/* ===== Constancia de matrícula ===== */'];
for (const marcador of marcadores) {
  const i = css.indexOf(marcador);
  if (i === -1) continue;
  const previo = css.slice(0, i);
  const nivel = (previo.match(/{/g) || []).length - (previo.match(/}/g) || []).length;
  comprobar(
    `El bloque "${marcador.replace(/\/\*|=|\*\//g, '').trim()}" esta en el nivel superior`,
    nivel === 0,
    `quedo anidado ${nivel} nivel(es) dentro de otra regla`);
}

// --- Orden de los scripts ----------------------------------------------
const scripts = [...html.matchAll(/<script src="(js\/[^"]+)"><\/script>/g)].map(m => m[1]);
comprobar('index.html carga los cuatro modulos', scripts.length === 4,
  `encontrados ${scripts.length}: ${scripts.join(', ')}`);

const ORDEN_ESPERADO = ['js/app.js', 'js/cursos.js', 'js/constancia.js', 'js/ocupacion.js'];
comprobar(
  'Los scripts se cargan en orden de dependencia',
  JSON.stringify(scripts) === JSON.stringify(ORDEN_ESPERADO),
  `esperado ${ORDEN_ESPERADO.join(' -> ')}\n    encontrado ${scripts.join(' -> ')}`);

// --- Archivos referenciados --------------------------------------------
const referencias = [...html.matchAll(/(?:src|href)="((?:js|css)\/[^"]+)"/g)].map(m => m[1]);
for (const ref of referencias) {
  comprobar(`Existe el archivo ${ref}`, fs.existsSync(path.join(RAIZ, ref)),
    'referenciado desde index.html pero no esta en el repositorio');
}

// --- Resultado ----------------------------------------------------------
if (fallos.length > 0) {
  console.error(`\nVerificacion de estructura: ${fallos.length} de ${comprobaciones.length} fallaron\n`);
  fallos.forEach(f => console.error(`  x ${f}\n`));
  process.exit(1);
}

console.log(`Verificacion de estructura: ${comprobaciones.length} comprobaciones correctas`);
comprobaciones.forEach(c => console.log(`  - ${c}`));
