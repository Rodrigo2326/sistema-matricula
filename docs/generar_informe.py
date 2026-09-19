# -*- coding: utf-8 -*-
"""
Genera el informe del avance APF1 en PDF a partir de docs/informe-apf1.md.

El Markdown es la unica fuente de verdad: este script solo lo maqueta. Si el
contenido del informe cambia, basta con volver a ejecutarlo.

Uso:
    python docs/generar_informe.py

Requiere: reportlab (pip install reportlab)
"""

import io
import os
import re
import sys

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    BaseDocTemplate, Frame, KeepTogether, ListFlowable, ListItem, PageBreak,
    PageTemplate, Paragraph, Preformatted, Spacer, Table, TableStyle,
)

AQUI = os.path.dirname(os.path.abspath(__file__))
ORIGEN = os.path.join(AQUI, 'informe-apf1.md')
DESTINO = os.path.join(AQUI, 'Informe_APF1.pdf')

AZUL = colors.HexColor('#1a2a52')
AZUL_CLARO = colors.HexColor('#2e4a9e')
GRIS_BORDE = colors.HexColor('#c8d0e4')
GRIS_FONDO = colors.HexColor('#f4f6fb')
GRIS_TEXTO = colors.HexColor('#555555')

ANCHO_UTIL = A4[0] - 4.4 * cm


# --------------------------------------------------------------------------
# Estilos
# --------------------------------------------------------------------------

def construir_estilos():
    base = getSampleStyleSheet()
    e = {}

    e['titulo_portada'] = ParagraphStyle(
        'titulo_portada', parent=base['Title'], fontSize=24, leading=30,
        textColor=AZUL, spaceAfter=6,
    )
    e['subtitulo_portada'] = ParagraphStyle(
        'subtitulo_portada', parent=base['Normal'], fontSize=13, leading=19,
        alignment=TA_CENTER, textColor=AZUL_CLARO,
    )
    e['dato_portada'] = ParagraphStyle(
        'dato_portada', parent=base['Normal'], fontSize=10.5, leading=17,
        alignment=TA_CENTER, textColor=GRIS_TEXTO,
    )
    e['integrante_portada'] = ParagraphStyle(
        'integrante_portada', parent=base['Normal'], fontSize=11, leading=18,
        alignment=TA_CENTER, textColor=AZUL,
    )
    e['h1'] = ParagraphStyle(
        'h1', parent=base['Heading1'], fontSize=15, leading=19, textColor=AZUL,
        spaceBefore=11, spaceAfter=5,
    )
    e['h2'] = ParagraphStyle(
        'h2', parent=base['Heading2'], fontSize=12, leading=15,
        textColor=AZUL_CLARO, spaceBefore=9, spaceAfter=4,
    )
    e['cuerpo'] = ParagraphStyle(
        'cuerpo', parent=base['Normal'], fontSize=10, leading=13.6,
        alignment=TA_JUSTIFY, spaceAfter=5,
    )
    e['vineta'] = ParagraphStyle(
        'vineta', parent=e['cuerpo'], spaceAfter=2,
    )
    e['codigo'] = ParagraphStyle(
        'codigo', parent=base['Code'], fontSize=8, leading=10.5,
        textColor=colors.HexColor('#1f2933'),
    )
    e['celda'] = ParagraphStyle(
        'celda', parent=base['Normal'], fontSize=8.5, leading=11.5,
    )
    e['celda_cab'] = ParagraphStyle(
        'celda_cab', parent=e['celda'], fontName='Helvetica-Bold',
        textColor=colors.white,
    )
    return e


# --------------------------------------------------------------------------
# Formato en linea
# --------------------------------------------------------------------------

def formato_linea(texto, tam_codigo=9):
    """Convierte el formato en linea de Markdown al marcado de reportlab."""
    texto = texto.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    texto = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', texto)
    texto = re.sub(r'(?<!\*)\*([^*]+?)\*(?!\*)', r'<i>\1</i>', texto)
    texto = re.sub(
        r'`(.+?)`',
        r'<font face="Courier" size="%s" color="#1f2933">\1</font>' % tam_codigo,
        texto,
    )
    # Enlaces [texto](url) -> texto subrayado; la URL suele repetirse en el texto.
    texto = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<u>\1</u>', texto)
    return texto


# --------------------------------------------------------------------------
# Bloques
# --------------------------------------------------------------------------

def bloque_codigo(lineas, estilos):
    """Caja gris con el contenido literal de un bloque de codigo."""
    texto = '\n'.join(lineas).rstrip()
    if not texto:
        return []
    envoltorio = Table(
        [[Preformatted(texto, estilos['codigo'])]],
        colWidths=[ANCHO_UTIL],
    )
    envoltorio.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), GRIS_FONDO),
        ('BOX', (0, 0), (-1, -1), 0.6, GRIS_BORDE),
        ('LEFTPADDING', (0, 0), (-1, -1), 7),
        ('RIGHTPADDING', (0, 0), (-1, -1), 7),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    return [envoltorio, Spacer(1, 8)]


def bloque_tabla(filas, estilos):
    """Tabla con encabezado azul y filas alternadas."""
    if len(filas) < 2:
        return []

    cabecera = [c.strip() for c in filas[0].strip('|').split('|')]
    cuerpo = []
    for fila in filas[2:]:            # la fila 1 es el separador |---|---|
        celdas = [c.strip() for c in fila.strip('|').split('|')]
        if len(celdas) == len(cabecera):
            cuerpo.append(celdas)

    if not cuerpo:
        return []

    # Ancho proporcional al contenido de cada columna. El peso se acota entre un
    # minimo y un maximo para que una columna de texto largo no deje sin espacio
    # a las demas, y para que la palabra mas larga de cada columna quepa entera.
    TOPE = 45
    RELLENO = 10          # 5 pt de padding a cada lado de la celda
    CARACTER = 5.6        # ancho aproximado de un caracter a 8.5 pt en negrita

    anchos_texto = []
    for i in range(len(cabecera)):
        celdas = [cabecera[i]] + [f[i] for f in cuerpo]
        largo = min(max(len(c) for c in celdas), TOPE)
        # Ninguna palabra suelta deberia partirse a la mitad.
        palabra = max((len(p) for c in celdas for p in c.split()), default=6)
        anchos_texto.append(max(largo, palabra, 6))

    # El relleno de las celdas no escala con el texto: se descuenta antes de
    # repartir el ancho y se devuelve despues, para que una columna estrecha no
    # termine partiendo su encabezado.
    disponible = ANCHO_UTIL - RELLENO * len(cabecera)
    total = float(sum(anchos_texto))
    anchos = [disponible * a / total + RELLENO for a in anchos_texto]

    # Garantiza que la palabra mas larga de cada columna quepa entera.
    for i in range(len(cabecera)):
        celdas = [cabecera[i]] + [f[i] for f in cuerpo]
        palabra = max((len(p) for c in celdas for p in c.split()), default=6)
        minimo = palabra * CARACTER + RELLENO
        if anchos[i] < minimo:
            anchos[i] = minimo

    # Si los minimos desbordaron la pagina, se reduce la columna mas ancha.
    exceso = sum(anchos) - ANCHO_UTIL
    while exceso > 0.5:
        i = anchos.index(max(anchos))
        recorte = min(exceso, anchos[i] * 0.25)
        anchos[i] -= recorte
        exceso -= recorte

    datos = [[
        Paragraph(formato_linea(c, tam_codigo=7.5), estilos['celda_cab'])
        for c in cabecera
    ]]
    for fila in cuerpo:
        datos.append([
            Paragraph(formato_linea(c, tam_codigo=7.5), estilos['celda'])
            for c in fila
        ])

    tabla = Table(datos, colWidths=anchos, repeatRows=1)
    estilo = [
        ('BACKGROUND', (0, 0), (-1, 0), AZUL),
        ('GRID', (0, 0), (-1, -1), 0.5, GRIS_BORDE),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]
    for i in range(1, len(datos)):
        if i % 2 == 0:
            estilo.append(('BACKGROUND', (0, i), (-1, i), GRIS_FONDO))
    tabla.setStyle(TableStyle(estilo))
    return [tabla, Spacer(1, 9)]


def bloque_lista(elementos, numerada, estilos):
    items = [
        ListItem(Paragraph(formato_linea(t), estilos['vineta']), leftIndent=12)
        for t in elementos
    ]
    lista = ListFlowable(
        items,
        bulletType='1' if numerada else 'bullet',
        bulletFontSize=8,
        leftIndent=16,
        bulletColor=AZUL_CLARO,
    )
    return [lista, Spacer(1, 7)]


# --------------------------------------------------------------------------
# Conversion del Markdown
# --------------------------------------------------------------------------

def convertir(markdown, estilos):
    """Recorre el Markdown linea a linea y devuelve los flowables del cuerpo."""
    historia = []
    lineas = markdown.split('\n')

    # La cabecera del Markdown (titulo y metadatos, hasta el primer separador)
    # ya aparece en la portada, por lo que no se repite en el cuerpo.
    marcas = [l.strip() for l in lineas]
    if '---' in marcas:
        lineas = lineas[marcas.index('---') + 1:]

    i = 0
    parrafo = []
    lista = []
    lista_numerada = False

    def cerrar_parrafo():
        if parrafo:
            historia.append(Paragraph(formato_linea(' '.join(parrafo)), estilos['cuerpo']))
            del parrafo[:]

    def cerrar_lista():
        if lista:
            historia.extend(bloque_lista(list(lista), lista_numerada, estilos))
            del lista[:]

    while i < len(lineas):
        linea = lineas[i]
        limpia = linea.strip()

        # El encabezado del documento y los separadores se omiten: ya van en la portada.
        if limpia.startswith('# ') or limpia == '---':
            i += 1
            continue

        if limpia.startswith('```'):
            cerrar_parrafo()
            cerrar_lista()
            i += 1
            codigo = []
            while i < len(lineas) and not lineas[i].strip().startswith('```'):
                codigo.append(lineas[i])
                i += 1
            historia.extend(bloque_codigo(codigo, estilos))
            i += 1
            continue

        if limpia.startswith('|'):
            cerrar_parrafo()
            cerrar_lista()
            filas = []
            while i < len(lineas) and lineas[i].strip().startswith('|'):
                filas.append(lineas[i].strip())
                i += 1
            historia.extend(bloque_tabla(filas, estilos))
            continue

        if limpia.startswith('### '):
            cerrar_parrafo()
            cerrar_lista()
            historia.append(Paragraph(formato_linea(limpia[4:]), estilos['h2']))
            i += 1
            continue

        if limpia.startswith('## '):
            cerrar_parrafo()
            cerrar_lista()
            historia.append(Paragraph(formato_linea(limpia[3:]), estilos['h1']))
            i += 1
            continue

        if limpia.startswith('- '):
            cerrar_parrafo()
            if lista and lista_numerada:
                cerrar_lista()
            lista_numerada = False
            lista.append(limpia[2:])
            i += 1
            continue

        if re.match(r'^\d+\.\s', limpia):
            cerrar_parrafo()
            if lista and not lista_numerada:
                cerrar_lista()
            lista_numerada = True
            lista.append(re.sub(r'^\d+\.\s+', '', limpia))
            i += 1
            continue

        if limpia == '':
            cerrar_parrafo()
            # Una linea en blanco entre elementos no interrumpe la lista: en
            # Markdown separa items del mismo listado. Solo se cierra si lo que
            # sigue ya no es un elemento del mismo tipo; de lo contrario cada
            # item formaria su propia lista y la numeracion reiniciaria en 1.
            if lista:
                j = i + 1
                while j < len(lineas) and lineas[j].strip() == '':
                    j += 1
                siguiente = lineas[j].strip() if j < len(lineas) else ''
                if lista_numerada:
                    continua = bool(re.match(r'^\d+\.\s', siguiente))
                else:
                    continua = siguiente.startswith('- ')
                if not continua:
                    cerrar_lista()
            i += 1
            continue

        # Continuacion de un elemento de lista (linea indentada).
        if lista and linea.startswith('  '):
            lista[-1] += ' ' + limpia
            i += 1
            continue

        parrafo.append(limpia)
        i += 1

    cerrar_parrafo()
    cerrar_lista()
    return historia


# --------------------------------------------------------------------------
# Portada y pie de pagina
# --------------------------------------------------------------------------

def portada(estilos, metadatos, integrantes):
    elementos = [
        Spacer(1, 3.4 * cm),
        Paragraph('Avance de Proyecto Final 1', estilos['titulo_portada']),
        Paragraph('Sistema de Matr&iacute;cula', estilos['subtitulo_portada']),
        Spacer(1, 1.5 * cm),
    ]
    for etiqueta, valor in metadatos:
        elementos.append(
            Paragraph('<b>%s:</b> %s' % (etiqueta, valor), estilos['dato_portada'])
        )

    elementos.append(Spacer(1, 0.9 * cm))
    elementos.append(Paragraph('<b>Integrantes:</b>', estilos['dato_portada']))
    for nombre in integrantes:
        elementos.append(Paragraph(nombre, estilos['integrante_portada']))

    elementos.append(PageBreak())
    return elementos


def pie_de_pagina(canvas, doc):
    """Numera las paginas del cuerpo; la portada queda sin numerar."""
    numero = doc.page - 1
    if numero < 1:
        return
    canvas.saveState()
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(GRIS_TEXTO)
    canvas.drawString(2.2 * cm, 1.3 * cm, 'Sistema de Matrícula — APF1')
    canvas.drawRightString(A4[0] - 2.2 * cm, 1.3 * cm, 'Página %d' % numero)
    canvas.setStrokeColor(GRIS_BORDE)
    canvas.line(2.2 * cm, 1.65 * cm, A4[0] - 2.2 * cm, 1.65 * cm)
    canvas.restoreState()


# --------------------------------------------------------------------------

def main():
    if not os.path.exists(ORIGEN):
        sys.exit('No se encontro el informe en %s' % ORIGEN)

    markdown = io.open(ORIGEN, encoding='utf-8').read()
    estilos = construir_estilos()

    metadatos = [
        ('Curso', 'Herramientas de Desarrollo (100000S66T)'),
        ('Periodo', '2026-II'),
        ('Semana', '6'),
        ('Proyecto', 'Sistema de Matr&iacute;cula'),
        ('Repositorio', 'github.com/Rodrigo2326/sistema-matricula'),
    ]

    integrantes = [
        'Ccahuana Huillca Giancarlo',
        'Aparcana Mamani Rodrigo Alonso',
        'Arnold Jhuncor Díaz Silva',
    ]

    documento = BaseDocTemplate(
        DESTINO, pagesize=A4,
        leftMargin=2.2 * cm, rightMargin=2.2 * cm,
        topMargin=2.0 * cm, bottomMargin=2.2 * cm,
        title='Informe APF1 - Sistema de Matricula',
        author='Rodrigo Aparcana',
    )
    marco = Frame(
        documento.leftMargin, documento.bottomMargin,
        documento.width, documento.height, id='cuerpo',
    )
    documento.addPageTemplates([
        PageTemplate(id='principal', frames=[marco], onPage=pie_de_pagina)
    ])

    historia = portada(estilos, metadatos, integrantes) + convertir(markdown, estilos)
    documento.build(historia)

    print('PDF generado: %s' % DESTINO)
    print('Paginas: %d (portada incluida)' % documento.page)


if __name__ == '__main__':
    main()
