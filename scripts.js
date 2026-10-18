
/* ---------- UTILIDADES ---------- */

function mezclar(array) {
    const resultado = [...array];

    for (let i = resultado.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
    }

    return resultado;
}

function obtenerElemento(id) {
    return document.getElementById(id);
}

document.addEventListener("DOMContentLoaded", function () {

    /* ---------- MINIJUEGO 1: MEMORIA DE PUSHEEN ---------- */

    const tablero = obtenerElemento("tablero");
    const movimientosTexto = obtenerElemento("movs");
    const parejasTexto = obtenerElemento("parejas");
    const botonReiniciar = obtenerElemento("reiniciarMemoria");

    const imagenesMemoria = [
        "imagenes/p2.jpg",
        "imagenes/p3.jpg",
        "imagenes/p4.jpg",
        "imagenes/p5.jpg",
        "imagenes/p6.jpg"
    ];

    let primeraCarta = null;
    let segundaCarta = null;
    let bloqueado = false;
    let movimientos = 0;
    let parejasEncontradas = 0;
    let rondaMemoria = 0;

    function actualizarMemoria() {
        if (movimientosTexto) {
            movimientosTexto.textContent = movimientos;
        }

        if (parejasTexto) {
            parejasTexto.textContent = parejasEncontradas;
        }
    }

    function voltearCarta(carta) {
        if (
            bloqueado ||
            carta === primeraCarta ||
            carta.classList.contains("encontrada") ||
            carta.classList.contains("volteada") ||
            carta.disabled
        ) {
            return;
        }

        carta.classList.add("volteada");

        const imagen = carta.querySelector("img");

        if (imagen) {
            imagen.style.visibility = "visible";
        }

        if (!primeraCarta) {
            primeraCarta = carta;
            return;
        }

        segundaCarta = carta;
        movimientos++;

        actualizarMemoria();

        if (
            primeraCarta.dataset.imagen ===
            segundaCarta.dataset.imagen
        ) {
            primeraCarta.classList.add("encontrada");
            segundaCarta.classList.add("encontrada");

            parejasEncontradas++;
            actualizarMemoria();

            primeraCarta = null;
            segundaCarta = null;

            if (parejasEncontradas === imagenesMemoria.length) {
                const rondaActual = rondaMemoria;

                setTimeout(function () {
                    if (rondaActual !== rondaMemoria) return;

                    alert(
                        "¡Felicidades! 🐱💗 Encontraste todas las parejas en " +
                        movimientos + " movimientos."
                    );
                }, 300);
            }

        } else {
            bloqueado = true;

            const rondaActual = rondaMemoria;

            setTimeout(function () {
                if (rondaActual !== rondaMemoria) return;

                [primeraCarta, segundaCarta].forEach(function (cartaActual) {
                    if (!cartaActual) return;

                    cartaActual.classList.remove("volteada");

                    const imagenActual = cartaActual.querySelector("img");

                    if (imagenActual) {
                        imagenActual.style.visibility = "hidden";
                    }
                });

                primeraCarta = null;
                segundaCarta = null;
                bloqueado = false;
            }, 900);
        }
    }

    function iniciarMemoria() {
        if (!tablero) return;

        rondaMemoria++;

        tablero.innerHTML = "";

        primeraCarta = null;
        segundaCarta = null;
        bloqueado = false;
        movimientos = 0;
        parejasEncontradas = 0;

        const pares = [];

        imagenesMemoria.forEach(function (ruta, indice) {
            pares.push({
                ruta: ruta,
                pareja: indice
            });

            pares.push({
                ruta: ruta,
                pareja: indice
            });
        });

        const cartasMezcladas = mezclar(pares);

        cartasMezcladas.forEach(function (datos) {
            const carta = document.createElement("button");

            carta.type = "button";
            carta.className = "carta-memoria";
            carta.dataset.imagen = String(datos.pareja);
            carta.setAttribute("aria-label", "Carta de memoria");

            const reverso = document.createElement("span");

            reverso.className = "reverso-memoria";
            reverso.textContent = "🐱";

            const imagen = document.createElement("img");

            imagen.src = datos.ruta;
            imagen.alt = "Pusheen";
            imagen.draggable = false;
            imagen.style.visibility = "hidden";

            imagen.addEventListener("error", function () {
                carta.disabled = true;
                reverso.textContent = "❔";
                imagen.style.display = "none";
            });

            carta.appendChild(reverso);
            carta.appendChild(imagen);

            carta.addEventListener("click", function () {
                voltearCarta(carta);
            });

            tablero.appendChild(carta);
        });

        actualizarMemoria();
    }

    if (tablero) {
        iniciarMemoria();
    }

    if (botonReiniciar) {
        botonReiniciar.addEventListener("click", iniciarMemoria);
    }


    /* ---------- MINIJUEGO 2: ATRAPA LOS CORAZONES ---------- */

    const campo = obtenerElemento("campo");
    const aviso = obtenerElemento("aviso");
    const puntosTexto = obtenerElemento("puntos");
    const tiempoTexto = obtenerElemento("tiempo");
    const recordTexto = obtenerElemento("record");
    const botonCorazones = obtenerElemento("jugarCorazones");

    let puntos = 0;
    let tiempoRestante = 20;
    let intervaloCorazones = null;
    let intervaloTiempo = null;
    let juegoActivo = false;
    let record = 0;

    try {
        record =
            Number(localStorage.getItem("recordCorazonesPusheen")) || 0;
    } catch (error) {
        record = 0;
    }

    function actualizarPuntuacion() {
        if (puntosTexto) {
            puntosTexto.textContent = puntos;
        }

        if (tiempoTexto) {
            tiempoTexto.textContent = tiempoRestante;
        }

        if (recordTexto) {
            recordTexto.textContent = record;
        }
    }

    function crearCorazon() {
        if (!campo || !juegoActivo) return;

        const corazon = document.createElement("button");
        const dorado = Math.random() < 0.15;

        corazon.type = "button";
        corazon.className = dorado
            ? "corazon-juego dorado"
            : "corazon-juego";

        corazon.textContent = dorado ? "💛" : "💗";

        corazon.setAttribute(
            "aria-label",
            dorado
                ? "Corazón dorado: cinco puntos"
                : "Corazón rosa: un punto"
        );

        const anchoDisponible = Math.max(
            0,
            campo.clientWidth - 45
        );

        const altoDisponible = Math.max(
            0,
            campo.clientHeight - 45
        );

        corazon.style.position = "absolute";
        corazon.style.left =
            Math.random() * anchoDisponible + "px";

        corazon.style.top =
            Math.random() * altoDisponible + "px";

        corazon.addEventListener("click", function () {
            if (!juegoActivo) return;

            puntos += dorado ? 5 : 1;

            actualizarPuntuacion();
            corazon.remove();
        });

        campo.appendChild(corazon);

        setTimeout(function () {
            if (corazon.isConnected) {
                corazon.remove();
            }
        }, 1600);
    }

    function terminarCorazones() {
        juegoActivo = false;

        clearInterval(intervaloCorazones);
        clearInterval(intervaloTiempo);

        intervaloCorazones = null;
        intervaloTiempo = null;

        if (campo) {
            campo.innerHTML = "";
        }

        if (puntos > record) {
            record = puntos;

            try {
                localStorage.setItem(
                    "recordCorazonesPusheen",
                    String(record)
                );
            } catch (error) {
                // El juego funciona aunque no se pueda guardar el récord.
            }

            if (aviso) {
                aviso.textContent =
                    "¡Nuevo récord! 🏆 Lograste " +
                    puntos + " puntos.";
            }

        } else if (aviso) {
            aviso.textContent =
                "¡Se acabó el tiempo! 💗 Conseguíste " +
                puntos + " puntos.";
        }

        if (botonCorazones) {
            botonCorazones.disabled = false;
            botonCorazones.textContent = "Jugar otra vez 💗";
        }

        actualizarPuntuacion();
    }

    function iniciarCorazones() {
        if (!campo || juegoActivo) return;

        clearInterval(intervaloCorazones);
        clearInterval(intervaloTiempo);

        campo.innerHTML = "";

        puntos = 0;
        tiempoRestante = 20;
        juegoActivo = true;

        if (aviso) {
            aviso.textContent =
                "¡Atrapa los corazones! Los dorados valen 5 puntos.";
        }

        if (botonCorazones) {
            botonCorazones.disabled = true;
            botonCorazones.textContent = "¡Jugando! 💗";
        }

        actualizarPuntuacion();

        crearCorazon();

        intervaloCorazones = setInterval(function () {
            crearCorazon();
        }, 600);

        intervaloTiempo = setInterval(function () {
            tiempoRestante--;
            actualizarPuntuacion();

            if (tiempoRestante <= 0) {
                terminarCorazones();
            }
        }, 1000);
    }

    if (botonCorazones) {
        botonCorazones.addEventListener(
            "click",
            iniciarCorazones
        );
    }

    actualizarPuntuacion();


    /* ---------- CARTAS DE AMOR AMPLIADAS ---------- */

    const visorCarta = obtenerElemento("visorCarta");
    const cartaAmpliada = obtenerElemento("cartaAmpliada");
    const cerrarCarta = obtenerElemento("cerrarCarta");

    const cartasAmor = document.querySelectorAll(
        "#cartas-amor .carta-amor img"
    );

    function abrirCarta(imagen) {
        if (!visorCarta || !cartaAmpliada) return;

        cartaAmpliada.src = imagen.src;
        cartaAmpliada.alt = imagen.alt;

        visorCarta.classList.add("activo");
        visorCarta.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";
    }

    function cerrarCartaAmpliada() {
        if (!visorCarta || !cartaAmpliada) return;

        visorCarta.classList.remove("activo");
        visorCarta.setAttribute("aria-hidden", "true");

        cartaAmpliada.src = "";

        document.body.style.overflow = "";
    }

    cartasAmor.forEach(function (imagen) {
        imagen.addEventListener("click", function () {
            abrirCarta(imagen);
        });
    });

    if (cerrarCarta) {
        cerrarCarta.addEventListener(
            "click",
            cerrarCartaAmpliada
        );
    }

    if (visorCarta) {
        visorCarta.addEventListener("click", function (evento) {
            if (evento.target === visorCarta) {
                cerrarCartaAmpliada();
            }
        });
    }

    document.addEventListener("keydown", function (evento) {
        if (evento.key === "Escape") {
            cerrarCartaAmpliada();
        }
    });


    /* ---------- ANIMACIÓN DE TARJETAS PUSHEEN ---------- */

    const tarjetasGiratorias = document.querySelectorAll(
        ".tarjeta-giratoria"
    );

    tarjetasGiratorias.forEach(function (tarjeta) {
        tarjeta.addEventListener("click", function () {
            const girada = tarjeta.classList.toggle("girada");

            tarjeta.setAttribute(
                "aria-pressed",
                String(girada)
            );
        });
    });

    console.log("¡Bienvenido a Pusheen World! 🐱💗");
});
