// The texts of the home screen. DailyAches is a humor app, so they joke, but
// about the situation (the notebook, the tea, the tablero) and never at the
// expense of someone who is in pain. They change with the time of day and with
// what was recorded today, and each situation has several versions that rotate
// day by day, so it does not repeat the same line forever.

export const EVENING_FROM_HOUR = 19;
const HIGH_INTENSITY = 8;

// The same day always gives the same number, the next day the next one.
export const daySeed = (now = new Date()) =>
  now.getFullYear() * 400 + now.getMonth() * 31 + now.getDate();

const pick = (list, seed, salt = 0) => list[(seed + salt) % list.length];

export const getGreeting = (now = new Date(), name = "") => {
  const hour = now.getHours();
  const base =
    hour >= 6 && hour < 12
      ? "Buenos días"
      : hour >= 12 && hour < 20
        ? "Buenas tardes"
        : "Buenas noches";
  const first = String(name || "").trim().split(/\s+/)[0];
  return first ? `${base}, ${first}` : base;
};

const CALM_MORNING = [
  { title: "Buen día, y sin achaques", description: "Café en mano y el tablero en blanco. Que siga así hasta la hora de cenar." },
  { title: "Mañana sin novedades", description: "Ningún achaque ha pedido audiencia todavía. Este tablero hace guardia con su mejor cara de seriedad." },
  { title: "Hoy empezamos limpios", description: "Cero dolores anotados. Si alguno se anima a aparecer, aquí hay libreta, hora y expediente." },
  { title: "El día arrancó en paz", description: "Ni un achaque a la vista. Sospechosamente tranquilo, pero tampoco vamos a quejarnos." },
];

const CALM_AFTERNOON = [
  { title: "La tarde va sin achaques", description: "Tablero limpio a esta hora: o es un buen día, o los achaques siguen en la sobremesa." },
  { title: "Hoy manda la paz", description: "Todavía no hay achaques anotados. Si todo sigue en calma, este tablero queda listo para cuando toque registrar alguno." },
  { title: "Cero achaques, cero dramas", description: "El tablero está más vacío que la nevera un lunes. Disfrútalo mientras dure." },
  { title: "Día de brazos cruzados", description: "Los achaques tomaron el día libre. Que alguien les mande saludos." },
];

const CALM_EVENING = [
  { title: "¿Ni un achaque hoy?", description: "O fue un día de campeonato, o alguien olvidó anotar. Sea como sea, aquí estamos." },
  { title: "Cierre de día sin novedades", description: "Nada anotado hoy. Si fue por buena salud, ¡aplausos! Si fue por olvido, todavía hay tiempo." },
  { title: "La noche llega sin achaques", description: "El tablero cierra limpio. Si algo se quedó sin apuntar, aún hay tinta en la libreta." },
  { title: "Sin novedades en el frente", description: "Un día sin achaques anotados merece su minuto de gloria. ¿Lo compartimos?" },
];

const CALM_NIGHT = [
  { title: "Madrugada de guardia", description: "Nada anotado y ya es de noche cerrada. Los únicos achaques posibles: el sueño atrasado y el celular." },
  { title: "¿Y tú sin dormir?", description: "El tablero está limpio y la almohada te espera. Los achaques pueden esperar a mañana." },
];

const ONE_RECORD = [
  { title: "Un achaque en la libreta", description: "Ya tiene expediente: quién fue, qué dolió y a qué hora. Detective de dolores, nivel aprendiz." },
  { title: "Primer achaque del día, anotado", description: "Cronista oficial en servicio: todo apuntado con letra clara y cero chismes." },
  { title: "El achaque ya tiene papeles", description: "Nombre, hora y motivo. Ni el registro civil lo haría mejor." },
];

const TWO_RECORDS = [
  { title: "Dos achaques, doble expediente", description: "Dos episodios en la libreta, anotados con el rigor de un notario." },
  { title: "Dos y contando", description: "Vamos por dos episodios. Ojalá el tercero se quede sin invitación." },
];

const MANY_RECORDS = [
  { title: "Hoy el cuerpo tenía cosas que decir", description: (n) => `${n} episodios anotados. Toca té, manta y cero reproches.` },
  { title: "Día de muchos achaques", description: (n) => `${n} anotados. Ni el mejor guion tendría tantos giros.` },
  { title: "Jornada intensa en la bitácora", description: (n) => `${n} episodios registrados. Alguien se ganó un descanso… y quien anota, también.` },
];

// Strong pain: the joke stays small, care comes first, and it always points
// to a professional if it does not pass.
const INTENSE = [
  { title: "Hoy el dolor vino con ganas", description: "Queda anotado. Hoy toca mimos, agüita y cero heroicidades: lo de superhéroe, otro día. Si no cede, mejor consulta médica." },
  { title: "Un achaque de los serios", description: "Ya está en la libreta. Manta, descanso y paciencia; la bitácora hace guardia. Si no mejora, consulta con un profesional." },
  { title: "Día para consentirse", description: "Dolor intenso anotado. Hoy el plan es sofá, calor humano y cero reuniones. Si persiste, conviene consultarlo." },
];

const MOOD_CALM = ["Día en calma", "Tregua oficial", "Modo zen"];
const FORECAST_CALM = ["Pronóstico: sin novedad", "Pronóstico: cielo despejado", "Pronóstico: calma chicha"];
const MOOD_RECORD = ["Hoy hubo registro", "Bitácora en marcha", "Expediente abierto"];
const FORECAST_RECORD = ["Pronóstico: seguimiento y cuidado", "Pronóstico: té y mantita", "Pronóstico: probabilidad de mimos"];
const FORECAST_INTENSE = ["Pronóstico: mimos y descanso", "Pronóstico: cero heroicidades"];

const NOTE_CALM = [
  "Aquí no ha pasado nada… por ahora.",
  "Libreta lista, bolígrafo con ganas.",
  "El tablero espera su primer achaque (sin prisa).",
];
const NOTE_RECORD = [
  "Cada anotación suma puntos y logros. Anotar también es cuidar.",
  "Los achaques anotados aquí suman puntos. Qué bien se ve la contabilidad.",
  "Si aparece otro, aquí se registra rapidito.",
];

const EMPTY_STATE = [
  { title: "Cero registros, cero caos", text: "Cuando aparezca el primer dolor, este espacio se convierte en tu tablero de seguimiento con un poco menos de drama y bastante más claridad." },
  { title: "Aquí no hay nada que ver", text: "Circulen, circulen. Cuando aparezca un achaque, este espacio cobrará vida (y expediente)." },
  { title: "Libreta en blanco", text: "El primer achaque estrena la bitácora. Mientras tanto, nadie se queja." },
];

const CTA = ["Anotar un achaque", "Abrir expediente", "Ir a Registro"];

const LOG_HEADER = [
  { title: "Bitácora del día", subtitle: "Primero aparece la persona y luego cada achaque registrado." },
  { title: "La libreta de hoy", subtitle: "Cada quien con su achaque y su hora, como manda el protocolo." },
];

const CALM_DAY_SHARE = [
  "Hoy fue un día sin achaques anotados en DailyAches. 🌿 #DailyAches",
  "Hoy los achaques tomaron el día libre. 🌴 #DailyAches",
  "Cero achaques anotados hoy: tablero limpio, ánimo arriba. ✨ #DailyAches",
];

export const getCalmDayShareText = (now = new Date()) =>
  pick(CALM_DAY_SHARE, daySeed(now));

const calmPool = (hour) => {
  if (hour < 6) return CALM_NIGHT;
  if (hour < 12) return CALM_MORNING;
  if (hour < EVENING_FROM_HOUR) return CALM_AFTERNOON;
  return CALM_EVENING;
};

// `todayRecords`: today's records (any person). `celebrate` is true when it is
// evening and nothing was recorded: that is when "share a calm day" appears.
export const getHomeMessages = ({ todayRecords = [], now = new Date(), name = "" } = {}) => {
  const count = todayRecords.length;
  const seed = daySeed(now);
  const hour = now.getHours();
  const common = {
    greeting: getGreeting(now, name),
    cta: pick(CTA, seed, 1),
    ...(() => {
      const log = pick(LOG_HEADER, seed);
      return { logTitle: log.title, logSubtitle: log.subtitle };
    })(),
  };

  if (count === 0) {
    const text = pick(calmPool(hour), seed);
    const empty = pick(EMPTY_STATE, seed, 2);
    return {
      ...common,
      title: text.title,
      description: text.description,
      moodChip: pick(MOOD_CALM, seed),
      forecastChip: pick(FORECAST_CALM, seed, 1),
      note: pick(NOTE_CALM, seed, 2),
      emptyTitle: empty.title,
      emptyText: empty.text,
      celebrate: hour >= EVENING_FROM_HOUR,
    };
  }

  const strongest = Math.max(
    0,
    ...todayRecords.map((record) => Number(record.painLevel) || 0),
  );
  const base = {
    ...common,
    moodChip: pick(MOOD_RECORD, seed),
    note: pick(NOTE_RECORD, seed, 2),
    emptyTitle: "",
    emptyText: "",
    celebrate: false,
  };

  if (strongest >= HIGH_INTENSITY) {
    const text = pick(INTENSE, seed);
    return { ...base, title: text.title, description: text.description, forecastChip: pick(FORECAST_INTENSE, seed, 1) };
  }

  const forecastChip = pick(FORECAST_RECORD, seed, 1);
  if (count >= 3) {
    const text = pick(MANY_RECORDS, seed);
    return { ...base, title: text.title, description: text.description(count), forecastChip };
  }
  const text = pick(count === 1 ? ONE_RECORD : TWO_RECORDS, seed);
  return { ...base, title: text.title, description: text.description, forecastChip };
};
