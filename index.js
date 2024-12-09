const urlApi = "https://raw.githubusercontent.com/cesarmcuellar/CuestionarioWeb/refs/heads/main/cuestionario.json";

document.addEventListener("DOMContentLoaded", async () => {
    const contenedorPreguntas = document.getElementById("contenedor-preguntas");
    const botonEnviar = document.getElementById("boton-enviar");
    const seccionResultado = document.getElementById("resultado");
    const mostrarPorcentaje = document.getElementById("porcentaje");

    let preguntasTotales = [];

    try {
        const datos = await obtenerPreguntas(urlApi);

        preguntasTotales = mezclarPreguntas(datos);
        mostrarPreguntas(preguntasTotales, contenedorPreguntas);

    } catch (error) {
        console.error("Error al cargar preguntas:", error);
        contenedorPreguntas.innerHTML = "<p>Error cargando el cuestionario. Intenta más tarde.</p>";
    }

    botonEnviar.addEventListener("click", () => {
        const respuestasCorrectas = calcularRespuestasCorrectas(preguntasTotales);
        const porcentaje = ((respuestasCorrectas / preguntasTotales.length) * 100).toFixed(2);

        mostrarPorcentaje.textContent = `Tu porcentaje de aciertos es del ${porcentaje}%.`;
        seccionResultado.classList.remove("oculto");
    });
});

async function obtenerPreguntas(url) {
    const respuesta = await fetch(url);
    if (!respuesta.ok) throw new Error(`Error al obtener datos: ${respuesta.status}`);
    const datos = await respuesta.json();

    return [
        ...datos.multiple_choice_questions.map((pregunta, indice) => ({
            ...pregunta,
            tipo: "seleccion",
            id: `sel${indice}`
        })),
        ...datos.true_false_questions.map((pregunta, indice) => ({
            ...pregunta,
            tipo: "verdadero_falso",
            id: `vf${indice}`
        }))
    ];
}

function mostrarPreguntas(preguntas, contenedor) {
    contenedor.innerHTML = preguntas.map((pregunta) => `
        <div class="pregunta">
            <h3>${pregunta.question}</h3>
            ${
                pregunta.tipo === "seleccion"
                    ? pregunta.options.map(opcion => `
                        <label>
                            <input type="radio" name="${pregunta.id}" value="${opcion}"> ${opcion}
                        </label>
                    `).join("")
                    : `
                        <label>
                            <input type="radio" name="${pregunta.id}" value="true"> Verdadero
                        </label>
                        <label>
                            <input type="radio" name="${pregunta.id}" value="false"> Falso
                        </label>
                    `
            }
        </div>
    `).join("");
}

function calcularRespuestasCorrectas(preguntas) {
    return preguntas.reduce((contador, pregunta) => {
        const respuestaUsuario = document.querySelector(`input[name="${pregunta.id}"]:checked`);
        const respuestaCorrecta = pregunta.tipo === "seleccion" 
            ? pregunta.correct_answer 
            : (pregunta.correct_answer ? "true" : "false");

        return contador + (respuestaUsuario && respuestaUsuario.value === respuestaCorrecta ? 1 : 0);
    }, 0);
}

function mezclarPreguntas(preguntas) {
    return preguntas.sort(() => Math.random() - 0.5);
}
