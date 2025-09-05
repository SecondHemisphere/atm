/* ================= Datos simulados ================= */
const usuarios = [
  { cuenta: "1001", nombre: "Valentina Rojas", pin: "1234", saldo: 1200 },
  { cuenta: "2002", nombre: "Mateo Fernández", pin: "4321", saldo: 540 },
  { cuenta: "3003", nombre: "Camila Herrera", pin: "1111", saldo: 800 },
  { cuenta: "4004", nombre: "Julián Méndez", pin: "2222", saldo: 1500 },
  { cuenta: "5005", nombre: "Isabella Cruz", pin: "3333", saldo: 950 },
];

document.addEventListener("DOMContentLoaded", () => {
  /* ================= Estado del sistema ================= */
  let paso = "cuenta"; // flujo: "cuenta" → "pin"
  let cuentaActual = "";
  let pinActual = "";
  let usuarioActivo = null;

  /* ================= Elementos del DOM ================= */
  const display = document.getElementById("display");
  const btnBorrar = document.getElementById("btn-borrar");
  const btnLimpiar = document.getElementById("btn-limpiar");
  const btnOk = document.getElementById("btn-ok");

  const estadoInicio = document.getElementById("estado-inicio");
  const pantallaInicio = document.getElementById("pantalla-inicio");
  const cajeroApp = document.getElementById("cajero-app");

  // botones del teclado
  const botonesNumericos = document.querySelectorAll(
    ".teclado button[data-num]"
  );

  /* ================= Funciones auxiliares ================= */
  function resetearInicio(
    mensaje = "Ingrese su número de cuenta",
    tipo = "ok"
  ) {
    paso = "cuenta";
    cuentaActual = "";
    pinActual = "";
    usuarioActivo = null;
    display.value = "";
    display.placeholder = "Ingrese su número de cuenta";
    mostrarEstado(mensaje, tipo);
  }

  function mostrarEstado(texto, tipo) {
    estadoInicio.textContent = texto;
    estadoInicio.className = `estado estado-${tipo}`;
    estadoInicio.classList.remove("oculto");
    setTimeout(() => estadoInicio.classList.add("oculto"), 2500);
  }

  function actualizarSaldo() {
    document.getElementById(
      "saldo-valor"
    ).textContent = `$${usuarioActivo.saldo.toFixed(2)}`;
  }

  /* ================= Manejo del teclado ================= */
  botonesNumericos.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (paso === "cuenta" && cuentaActual.length < 10) {
        cuentaActual += btn.dataset.num;
        display.value = cuentaActual;
      } else if (paso === "pin" && pinActual.length < 4) {
        pinActual += btn.dataset.num;
        display.value = "*".repeat(pinActual.length);
      }
    });
  });

  btnBorrar.addEventListener("click", () => {
    if (paso === "cuenta") {
      cuentaActual = cuentaActual.slice(0, -1);
      display.value = cuentaActual;
    } else {
      pinActual = pinActual.slice(0, -1);
      display.value = "*".repeat(pinActual.length);
    }
  });

  btnLimpiar.addEventListener("click", () => {
    if (paso === "cuenta") {
      cuentaActual = "";
    } else {
      pinActual = "";
    }
    display.value = "";
  });

  /* ================= Botón OK ================= */
  btnOk.addEventListener("click", () => {
    if (paso === "cuenta") {
      if (cuentaActual.length < 4) {
        mostrarEstado("Ingrese una cuenta válida", "alerta");
        return;
      }

      usuarioActivo = usuarios.find((u) => u.cuenta === cuentaActual);
      if (!usuarioActivo) {
        resetearInicio("Cuenta no encontrada", "error");
        return;
      }

      paso = "pin";
      display.value = "";
      display.placeholder = "Ingrese su PIN";
      mostrarEstado("Ingrese su PIN", "ok");
    } else if (paso === "pin") {
      if (pinActual.length < 4) {
        mostrarEstado("Ingrese un PIN válido", "alerta");
        return;
      }

      if (usuarioActivo.pin === pinActual) {
        // login correcto
        pantallaInicio.classList.add("oculto");
        cajeroApp.classList.remove("oculto");
        mostrarEstado(`Bienvenido ${usuarioActivo.nombre}`, "ok");
        actualizarSaldo();
      } else {
        resetearInicio("PIN incorrecto. Vuelva a ingresar su cuenta.", "error");
      }
    }
  });

  /* ================= Navegación del menú ================= */
  const enlacesMenu = document.querySelectorAll(".enlace-menu");
  const secciones = document.querySelectorAll("main .tarjeta");

  enlacesMenu.forEach((enlace) => {
    enlace.addEventListener("click", (e) => {
      e.preventDefault();
      const seccion = enlace.dataset.seccion;

      secciones.forEach((s) => s.classList.add("oculto"));
      if (seccion) {
        document
          .getElementById(`seccion-${seccion}`)
          .classList.remove("oculto");
      }

      enlacesMenu.forEach((a) => a.classList.remove("enlace-activo"));
      enlace.classList.add("enlace-activo");
    });
  });

  // botón salir
  document.getElementById("btn-salir").addEventListener("click", () => {
    cajeroApp.classList.add("oculto");
    pantallaInicio.classList.remove("oculto");
    resetearInicio("Sesión cerrada", "ok");
  });

  /* ================= Operaciones del cajero ================= */
  function mostrarEstadoSeccion(id, texto, tipo) {
    const estado = document.getElementById(id);
    estado.textContent = texto;
    estado.className = `estado estado-${tipo}`;
    estado.classList.remove("oculto");
    setTimeout(() => estado.classList.add("oculto"), 2500);
  }

  // Retiro
  document.getElementById("btn-retirar").addEventListener("click", () => {
    const monto = parseFloat(document.getElementById("monto-retiro").value);
    if (isNaN(monto) || monto <= 0) {
      return mostrarEstadoSeccion(
        "estado-retiro",
        "Ingrese un monto válido",
        "alerta"
      );
    }
    if (monto > usuarioActivo.saldo) {
      return mostrarEstadoSeccion(
        "estado-retiro",
        "Saldo insuficiente",
        "error"
      );
    }

    usuarioActivo.saldo -= monto;
    actualizarSaldo();
    mostrarEstadoSeccion(
      "estado-retiro",
      `Retiro exitoso: $${monto.toFixed(2)}`,
      "ok"
    );
    document.getElementById("monto-retiro").value = "";
    agregarHistorial("Retiro", "Retiro de efectivo", monto);
  });

  // Depósito
  document.getElementById("btn-depositar").addEventListener("click", () => {
    const monto = parseFloat(document.getElementById("monto-deposito").value);
    if (isNaN(monto) || monto <= 0) {
      return mostrarEstadoSeccion(
        "estado-deposito",
        "Ingrese un monto válido",
        "alerta"
      );
    }

    usuarioActivo.saldo += monto;
    actualizarSaldo();
    mostrarEstadoSeccion(
      "estado-deposito",
      `Depósito exitoso: $${monto.toFixed(2)}`,
      "ok"
    );
    document.getElementById("monto-deposito").value = "";
    agregarHistorial("Depósito", "Depósito de efectivo", monto);
  });

  // Transferencia
  document.getElementById("btn-transferir").addEventListener("click", () => {
    const cuentaDestino = document
      .getElementById("cuenta-destino")
      .value.trim();
    const monto = parseFloat(
      document.getElementById("monto-transferencia").value
    );

    if (!cuentaDestino || isNaN(monto) || monto <= 0) {
      return mostrarEstadoSeccion(
        "estado-transferencia",
        "Ingrese datos válidos",
        "alerta"
      );
    }
    if (monto > usuarioActivo.saldo) {
      return mostrarEstadoSeccion(
        "estado-transferencia",
        "Saldo insuficiente",
        "error"
      );
    }

    const usuarioDestino = usuarios.find((u) => u.cuenta === cuentaDestino);
    if (!usuarioDestino) {
      return mostrarEstadoSeccion(
        "estado-transferencia",
        "Cuenta destino no encontrada",
        "error"
      );
    }

    usuarioActivo.saldo -= monto;
    usuarioDestino.saldo += monto;
    actualizarSaldo();
    mostrarEstadoSeccion(
      "estado-transferencia",
      `Transferencia de $${monto.toFixed(2)} exitosa`,
      "ok"
    );

    document.getElementById("cuenta-destino").value = "";
    document.getElementById("monto-transferencia").value = "";
    agregarHistorial(
      "Transferencia",
      `Transferido a ${usuarioDestino.nombre}`,
      monto
    );
  });

  // Cambiar PIN
  document.getElementById("btn-guardar-pin").addEventListener("click", () => {
    const nuevo = document.getElementById("pin-nuevo").value;
    const repite = document.getElementById("pin-repite").value;

    if (nuevo.length !== 4 || repite.length !== 4) {
      return mostrarEstadoSeccion(
        "estado-pin",
        "El PIN debe tener 4 dígitos",
        "alerta"
      );
    }
    if (nuevo !== repite) {
      return mostrarEstadoSeccion(
        "estado-pin",
        "Los PIN no coinciden",
        "error"
      );
    }

    usuarioActivo.pin = nuevo;
    mostrarEstadoSeccion("estado-pin", "PIN cambiado exitosamente", "ok");
    document.getElementById("pin-nuevo").value = "";
    document.getElementById("pin-repite").value = "";
  });

  /* ================= Historial ================= */
  function agregarHistorial(tipo, detalle, monto) {
    const tbody = document.querySelector("#tabla-historial tbody");
    const fila = document.createElement("tr");
    const fecha = new Date().toLocaleString();

    fila.innerHTML = `
      <td>${fecha}</td>
      <td>${tipo}</td>
      <td>${detalle}</td>
      <td>$${monto.toFixed(2)}</td>
    `;

    if (
      tbody.children.length === 1 &&
      tbody.children[0].children[0].colSpan === 4
    ) {
      tbody.innerHTML = "";
    }

    tbody.prepend(fila);
  }
});
