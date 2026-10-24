/** 
 * Cuenta cuántos matriculados hay en un curso específico.
 * Reutiliza la lista global 'matriculas' definida en app.js.
 */
function contarOcupacion(nombreCurso) {
    if (!Array.isArray(matriculas)) return 0;
    return matriculas.filter(m => m.curso.toLowerCase() === nombreCurso.toLowerCase()).length;
}

/** 
 * Calcula las vacantes libres basándose en un límite máximo por curso (ej. 30 vacantes).
 */
function vacantesLibres(nombreCurso, maxVacantes = 30) {
    const ocupados = contarOcupacion(nombreCurso);
    return Math.max(0, maxVacantes - ocupados);
}

/** 
 * Renderiza las barras de progreso de ocupación en el panel correspondiente.
 */
function renderizarBarrasOcupacion() {
    const contenedorOcupacion = document.getElementById('panel-ocupacion');
    if (!contenedorOcupacion) return;

    contenedorOcupacion.innerHTML = '';

    // Lista de cursos predefinidos del sistema
    const listaCursos = [
        "Matemática I",
        "Algoritmos",
        "Introducción a la Ingeniería",
        "Física I",
        "Comunicación"
    ];

    const maxVacantesPorCurso = 30; // Límite estándar de vacantes

    listaCursos.forEach(nombreCurso => {
        const ocupados = contarOcupacion(nombreCurso);
        const total = maxVacantesPorCurso;
        const porcentaje = Math.round((ocupados / total) * 100);

        // Determinación del color según los rangos requeridos:
        // Verde < 70%, Ámbar 70–99%, Rojo 100%
        let claseColor = 'bg-success'; 
        if (porcentaje >= 100) {
            claseColor = 'bg-danger';  
        } else if (porcentaje >= 70) {
            claseColor = 'bg-warning'; 
        }

        const itemHTML = `
            <div class="mb-3 p-2 border rounded">
                <div class="d-flex justify-content-between mb-1">
                    <strong>${nombreCurso}</strong>
                    <span>${porcentaje}% (${ocupados}/${total} ocupados)</span>
                </div>
                <div class="progress" style="height: 20px; background-color: #e9ecef;">
                    <div class="progress-bar ${claseColor}" role="progressbar" 
                         style="width: ${porcentaje}%;" 
                         aria-valuenow="${porcentaje}" aria-valuemin="0" aria-valuemax="100">
                    </div>
                </div>
            </div>
        `;
        contenedorOcupacion.innerHTML += itemHTML;
    });
}

/** Configura el evento del botón "Ver ocupación" */
document.addEventListener('DOMContentLoaded', () => {
    // CORRECCIÓN: Se cambió 'btn-ocupacion' por 'btn-ver-ocupacion' para hacer match con el HTML
    const btnOcupacion = document.getElementById('btn-ver-ocupacion');
    const panelOcupacion = document.getElementById('panel-ocupacion');

    if (btnOcupacion && panelOcupacion) {
        btnOcupacion.addEventListener('click', () => {
            renderizarBarrasOcupacion();
            panelOcupacion.classList.toggle('oculto');
        });
    }
});