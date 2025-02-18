const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const {onRequest} = require("firebase-functions/v2/https");
const cors = require("cors")({origin: true});
admin.initializeApp();


// eslint-disable-next-line max-len
exports.assignCitaToAgent = onDocumentCreated("citas/{citaId}", async (event) => {
  const snap = event.data;
  const citaId = event.params?.citaId;

  if (!snap) {
    console.error("Documento de cita sin datos");
    return;
  }

  const citaData = snap.data();
  if (!citaData) {
    console.error("No se pudo extraer la información de la cita");
    return;
  }

  // --- Paso 1: Actualizar contador de citas en "counters/citas" ---
  const counterRef = admin.firestore().doc("counters/citas");
  let newCount = 0;

  try {
    await admin.firestore().runTransaction(async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      if (!counterDoc.exists) {
        newCount = 1;
        transaction.set(counterRef, {count: newCount});
      } else {
        const currentCount = (counterDoc.data().count) || 0;
        newCount = currentCount + 1;
        transaction.update(counterRef, {count: newCount});
      }
    });
  } catch (error) {
    console.error("Error al actualizar el contador:", error);
    return;
  }

  // eslint-disable-next-line max-len
  // --- Paso 2: Obtener la lista de agentes ordenada por "idAgente" ascendente ---
  let agentsSnapshot;
  try {
    agentsSnapshot = await admin.firestore()
        .collection("agentes")
        .orderBy("idAgente", "asc")
        .get();
  } catch (error) {
    console.error("Error al obtener agentes:", error);
    return;
  }

  if (agentsSnapshot.empty) {
    console.error("No hay agentes disponibles para asignar la cita.");
    return;
  }

  const agents = agentsSnapshot.docs;
  const numberOfAgents = agents.length;
  // eslint-disable-next-line max-len
  // Round-robin: (newCount - 1) para que la primera cita (count = 1) se asigne al agente 0
  const agentIndex = (newCount - 1) % numberOfAgents;
  const selectedAgentDoc = agents[agentIndex];
  const selectedAgentId = selectedAgentDoc.id;

  // eslint-disable-next-line max-len
  // --- Paso 3: Agregar la cita en la subcolección "citasRecibidas" del agente seleccionado ---
  const citaAsignada = {
    citaId: citaId,
    estado: "En Proceso",
    asignadoEn: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    await admin.firestore()
        .collection("agentes")
        .doc(selectedAgentId)
        .collection("citasRecibidas")
        .doc(citaId)
        .set(citaAsignada);

    console.log(`Cita ${citaId} asignada al agente ${selectedAgentId}`);
  } catch (error) {
    console.error("Error al asignar la cita al agente:", error);
  }
});

exports.getCrmStatistics = onRequest((req, res) => {
  // Usa cors para manejar la petición
  cors(req, res, async () => {
    try {
      const db = admin.firestore();

      // Obtén la cantidad de pacientes
      const pacientesSnap = await db.collection("pacientes").get();
      const numberOfPacientes = pacientesSnap.size;

      // Obtén la cantidad de agentes
      const agentesSnap = await db.collection("agentes").get();
      const numberOfAgentes = agentesSnap.size;

      // Obtén la cantidad de citas en proceso (ejemplo: estado "En Proceso")
      const citasInProcessSnap = await db
          .collection("citas")
          .where("estado", "==", "En Proceso")
          .get();
      const numberOfCitasInProcess = citasInProcessSnap.size;

      // Obtén la cantidad de citas finalizadas (ejemplo: estado "Finalizada")
      const citasCompletedSnap = await db
          .collection("citas")
          .where("estado", "==", "Finalizada")
          .get();
      const numberOfCitasCompleted = citasCompletedSnap.size;

      res.json({
        numberOfPacientes,
        numberOfAgentes,
        numberOfCitasInProcess,
        numberOfCitasCompleted,
      });
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      res.status(500).send("Error al obtener estadísticas");
    }
  });
});

