'use strict';

/* ==========================================================
   GUÍA DE EXAMEN · 1er TRIMESTRE · 3°B
   Página interactiva: tarjetas, quiz, verdadero/falso,
   sonidos, lectura en voz alta, estrellas y confeti.
   ========================================================== */

/* ===================== UTILIDADES ===================== */
const $  = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

function mezclar(arr){
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ===================== SONIDO (sintetizado, sin archivos) ===================== */
const SONIDO = { on: true };
let audioCtx = null;

function ctxAudio(){
  if (!SONIDO.on) return null;
  try{
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }catch(e){ return null; }
}

function nota(freq, retardo, duracion, tipo, volumen){
  const c = ctxAudio(); if (!c) return;
  const t = c.currentTime + retardo;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = tipo || 'triangle';
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(volumen || 0.18, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duracion);
  o.connect(g); g.connect(c.destination);
  o.start(t); o.stop(t + duracion + 0.06);
}

const sonidos = {
  click(){ nota(760, 0, .07, 'square', .05); },
  correcto(){ nota(523.25, 0, .12); nota(659.25, .09, .12); nota(783.99, .18, .2); nota(1046.5, .27, .28); },
  incorrecto(){ nota(233, 0, .22, 'sawtooth', .09); nota(164, .14, .3, 'sawtooth', .09); },
  racha(){ nota(880, 0, .07, 'square', .07); nota(1174.66, .08, .12, 'square', .07); },
  estrella(i){ nota([523.25, 659.25, 783.99][i] || 1046.5, 0, .3, 'triangle', .16); },
  fanfarria(){
    const mel = [[523.25,0],[523.25,.13],[523.25,.26],[659.25,.4],[783.99,.58],[1046.5,.78],[783.99,.98],[1046.5,1.14]];
    mel.forEach(([f, t]) => nota(f, t, .16, 'triangle', .15));
  }
};

/* ===================== VOZ (leer en voz alta) ===================== */
function puedeHablar(){ return 'speechSynthesis' in window; }
if (puedeHablar()){
  try{ speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices(); }catch(e){}
}
function leer(texto){
  if (!SONIDO.on || !puedeHablar()) return;
  try{
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = 'es-MX'; u.rate = .92; u.pitch = 1.05;
    const vs = speechSynthesis.getVoices();
    const v = vs.find(x => /es[-_]MX/i.test(x.lang)) || vs.find(x => /^es/i.test(x.lang));
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  }catch(e){}
}
function detenerVoz(){ try{ speechSynthesis.cancel(); }catch(e){} }

/* ===================== GUARDADO ===================== */
const store = (() => {
  try{
    const k = '__prueba3b';
    localStorage.setItem(k, '1'); localStorage.removeItem(k);
    return localStorage;
  }catch(e){ return null; }
})();
const KEY_ESTRELLAS = 'g3b_estrellas_v1';
const KEY_SONIDO = 'g3b_sonido_v1';

let estrellasMap = {};
try{ estrellasMap = JSON.parse(store.getItem(KEY_ESTRELLAS)) || {}; }catch(e){ estrellasMap = {}; }
try{ SONIDO.on = store ? store.getItem(KEY_SONIDO) !== '0' : true; }catch(e){}

function estrellasDe(clave){ return estrellasMap[clave] || 0; }
function guardarEstrellas(clave, n){
  if (n > (estrellasMap[clave] || 0)){
    estrellasMap[clave] = n;
    try{ store && store.setItem(KEY_ESTRELLAS, JSON.stringify(estrellasMap)); }catch(e){}
    renderInicio();
  }
}
function guardarSonido(){ try{ store && store.setItem(KEY_SONIDO, SONIDO.on ? '1' : '0'); }catch(e){} }

/* ==========================================================
   DATOS DE LA GUÍA (tomados de las fotos del cuadernillo)
   En las preguntas, la PRIMERA opción siempre es la correcta
   (luego se revuelven automáticamente).
   ========================================================== */
const MATERIAS = [
  {
    id: 'len', nombre: 'Lenguajes', icono: '📚', c1: '#ff4d6d', c2: '#c9184a',
    temas: [
      {
        nombre: 'El diálogo y los acuerdos', icono: '🤝',
        tarjetas: [
          ['🤝', 'Los acuerdos son decisiones que tomamos entre varias personas para resolver problemas o mejorar la convivencia.'],
          ['👂', 'Para tomar buenos acuerdos debemos dialogar, escuchar a todos y decidir juntos.'],
          ['💬', 'El diálogo es una conversación oral o escrita entre dos o más personas.'],
          ['🤔', 'Antes de presentar un argumento debemos pensar qué vamos a decir, a quién y cómo lo diremos.'],
          ['💡', 'Un argumento es una razón que utilizamos para explicar o defender una idea. Por ejemplo: debemos cuidar el agua porque es necesaria para la vida.'],
          ['🪧', 'Un cartel combina imágenes y textos breves para comunicar un mensaje.']
        ],
        preguntas: [
          { p: '¿Qué son los acuerdos?', e: '🤝', ok: 'Los acuerdos son decisiones que tomamos entre varias personas para resolver problemas o mejorar la convivencia.',
            ops: ['Decisiones que tomamos entre varias personas', 'Juegos que hacemos solitos', 'Reglas que solo hace el más grande', 'Cuentos que leemos en voz alta'] },
          { p: 'Para tomar buenos acuerdos debemos…', e: '👂', ok: 'Para tomar buenos acuerdos debemos dialogar, escuchar a todos y decidir juntos.',
            ops: ['Dialogar, escuchar a todos y decidir juntos', 'Gritar más fuerte que los demás', 'Decidir sin preguntar a nadie', 'Dejar que decida uno solito'] },
          { p: '¿Qué es el diálogo?', e: '💬', ok: 'El diálogo es una conversación oral o escrita entre dos o más personas.',
            ops: ['Una conversación oral o escrita entre dos o más personas', 'Un dibujo con muchos colores', 'Un juego de correr muy rápido', 'Una canción para cantar juntos'] },
          { p: 'Antes de presentar un argumento debemos pensar…', e: '🤔', ok: 'Antes de presentar un argumento debemos pensar qué vamos a decir, a quién y cómo lo diremos.',
            ops: ['Qué vamos a decir, a quién y cómo lo diremos', 'Solo en qué vamos a comer', 'En no decir nada nunca', 'En ganar sin escuchar'] },
          { p: '¿Qué es un argumento?', e: '💡', ok: 'Un argumento es una razón que utilizamos para explicar o defender una idea.',
            ops: ['Una razón para explicar o defender una idea', 'Un tipo de pastel', 'Un baile muy famoso', 'Un dibujo sin colores'] },
          { p: '¿Qué combina un cartel para comunicar un mensaje?', e: '🪧', ok: 'Un cartel combina imágenes y textos breves para comunicar un mensaje.',
            ops: ['Imágenes y textos breves', 'Sal y azúcar', 'Números telefónicos', 'Piedras y palos'] }
        ]
      },
      {
        nombre: 'La descripción', icono: '🎨',
        tarjetas: [
          ['🏷️', 'Los adjetivos son palabras que describen las características de personas, animales, objetos y lugares.'],
          ['🌟', 'Algunos ejemplos de adjetivos son: grande, pequeño, alegre, rojo y hermoso.'],
          ['🔍', 'Describir consiste en explicar cómo es una persona, animal, objeto o lugar, mencionando sus características.'],
          ['📖', 'Una biblioteca es un lugar donde se organizan libros para leer, investigar o pedirlos prestados.']
        ],
        preguntas: [
          { p: '¿Qué son los adjetivos?', e: '🏷️', ok: 'Los adjetivos son palabras que describen las características de personas, animales, objetos y lugares.',
            ops: ['Palabras que describen características', 'Palabras que vuelan', 'Números muy grandes', 'Canciones infantiles'] },
          { p: '¿Cuál de estas palabras es un adjetivo?', e: '🌟', ok: '“Hermoso” es un adjetivo: describe cómo es algo o alguien. Otros: grande, alegre, rojo.',
            ops: ['Hermoso', 'Correr', 'Comer', 'Saltar'] },
          { p: '¿Qué significa describir?', e: '🔍', ok: 'Describir es explicar cómo es una persona, animal, objeto o lugar, mencionando sus características.',
            ops: ['Explicar cómo es algo mencionando sus características', 'Esconder un objeto', 'Romper un papel', 'Contar hasta cien'] },
          { p: 'En la biblioteca se organizan…', e: '📖', ok: 'Una biblioteca es un lugar donde se organizan libros para leer, investigar o pedirlos prestados.',
            ops: ['Libros para leer, investigar o pedirlos prestados', 'Juguetes para vender', 'Ropa para lavar', 'Animales para alimentar'] }
        ]
      },
      {
        nombre: 'Manifestaciones artísticas y culturales', icono: '🎭',
        tarjetas: [
          ['🎨', 'Las manifestaciones artísticas permiten expresar ideas, sentimientos y emociones mediante el arte.'],
          ['🗿', 'La escultura consiste en crear figuras utilizando materiales como barro, madera o piedra.'],
          ['🎵', 'La música es una manifestación artística que combina sonidos, silencios, ritmos y melodías.'],
          ['🌼', 'Los altares de muertos se elaboran para recordar y honrar a las personas fallecidas.'],
          ['✂️', 'El papel picado se elabora recortando figuras y diseños en papel.'],
          ['🎉', 'Los elementos artísticos de las celebraciones ayudan a expresar y conservar las tradiciones culturales.'],
          ['💃', 'La danza utiliza movimientos, música y vestuario para expresar ideas y emociones.']
        ],
        preguntas: [
          { p: '¿Qué permiten las manifestaciones artísticas?', e: '🎨', ok: 'Las manifestaciones artísticas permiten expresar ideas, sentimientos y emociones mediante el arte.',
            ops: ['Expresar ideas, sentimientos y emociones', 'Dormir más rápido', 'Correr más veloz', 'Cocinar rico'] },
          { p: '¿Con qué materiales se crea una escultura?', e: '🗿', ok: 'La escultura crea figuras con materiales como barro, madera o piedra.',
            ops: ['Barro, madera o piedra', 'Agua y sal', 'Hielo y fuego', 'Plástico y aire'] },
          { p: '¿Qué combina la música?', e: '🎵', ok: 'La música combina sonidos, silencios, ritmos y melodías.',
            ops: ['Sonidos, silencios, ritmos y melodías', 'Piedras y palos', 'Letras y números', 'Nubes y lluvia'] },
          { p: '¿Para qué se elaboran los altares de muertos?', e: '🌼', ok: 'Los altares de muertos se elaboran para recordar y honrar a las personas fallecidas.',
            ops: ['Para recordar y honrar a las personas fallecidas', 'Para guardar juguetes', 'Para decorar la cocina', 'Para esconder la tarea'] },
          { p: '¿Cómo se elabora el papel picado?', e: '✂️', ok: 'El papel picado se elabora recortando figuras y diseños en papel.',
            ops: ['Recortando figuras y diseños en papel', 'Pintando la pared', 'Tejiendo lana', 'Cocinando masa'] },
          { p: '¿Qué utiliza la danza para expresar ideas y emociones?', e: '💃', ok: 'La danza utiliza movimientos, música y vestuario para expresar ideas y emociones.',
            ops: ['Movimientos, música y vestuario', 'Solo palabras escritas', 'Máquinas y robots', 'Piedras y arena'] }
        ]
      }
    ]
  },
  {
    id: 'sab', nombre: 'Saberes y Pensamiento Científico', icono: '🔬', c1: '#06d6a0', c2: '#048f6b',
    temas: [
      {
        nombre: 'El sistema locomotor', icono: '🦴',
        tarjetas: [
          ['🚶', 'El sistema locomotor está formado por huesos, músculos y articulaciones, y permite mover nuestro cuerpo.'],
          ['🦴', 'Los huesos son la parte rígida del cuerpo: le dan forma y lo sostienen.'],
          ['💪', 'Los músculos son tejidos elásticos que permiten realizar movimientos.'],
          ['🦵', 'Las articulaciones son donde se unen dos o más huesos: es la parte que podemos doblar o flexionar.']
        ],
        preguntas: [
          { p: '¿De qué está formado el sistema locomotor?', e: '🚶', ok: 'El sistema locomotor está formado por huesos, músculos y articulaciones, y permite mover nuestro cuerpo.',
            ops: ['Huesos, músculos y articulaciones', 'Agua, aire y tierra', 'Papel, plástico y vidrio', 'Flores y árboles'] },
          { p: '¿Cuál es la parte rígida del cuerpo que le da forma y lo sostiene?', e: '🦴', ok: 'Los huesos son la parte rígida del cuerpo: le dan forma y lo sostienen.',
            ops: ['Los huesos', 'El cabello', 'Las uñas', 'La sangre'] },
          { p: '¿Qué son los músculos?', e: '💪', ok: 'Los músculos son tejidos elásticos que permiten realizar movimientos.',
            ops: ['Tejidos elásticos que permiten moverte', 'Piedras del cuerpo', 'Trocitos de madera', 'Bolitas de cristal'] },
          { p: '¿Dónde se unen dos o más huesos y puedes doblar o flexionar?', e: '🦵', ok: 'Las articulaciones son donde se unen dos o más huesos: la parte que podemos doblar o flexionar.',
            ops: ['En las articulaciones', 'En el pelo', 'En las orejas', 'En las cejas'] }
        ]
      },
      {
        nombre: 'Figuras geométricas y patrones de la naturaleza', icono: '🔺',
        tarjetas: [
          ['🐝', 'Los patrones de la naturaleza son formas que se repiten, como los hexágonos de los panales de abejas.'],
          ['📐', 'Las figuras geométricas planas tienen dos dimensiones: largo y ancho. Ejemplos: círculos, triángulos, rectángulos y cuadrados.'],
          ['📌', 'Un vértice es el punto de unión o la esquina donde se juntan dos o más lados de una figura.']
        ],
        preguntas: [
          { p: '¿Qué son los patrones de la naturaleza?', e: '🐝', ok: 'Los patrones de la naturaleza son formas que se repiten, como los hexágonos de los panales de abejas.',
            ops: ['Formas que se repiten, como los hexágonos del panal', 'Colores que desaparecen', 'Ruidos muy fuertes', 'Juegos de mesa'] },
          { p: '¿Cuántas dimensiones tienen las figuras planas?', e: '📐', ok: 'Las figuras planas tienen dos dimensiones: largo y ancho.',
            ops: ['Dos: largo y ancho', 'Cinco', 'Una sola', 'Diez'] },
          { p: '¿Cuál es una figura geométrica plana?', e: '🔺', ok: 'El triángulo es una figura plana. También el círculo, el rectángulo y el cuadrado.',
            ops: ['El triángulo', 'La pelota', 'El cubo de juguete', 'La caja grande'] },
          { p: '¿Qué es un vértice?', e: '📌', ok: 'Un vértice es el punto de unión o la esquina donde se juntan dos o más lados de una figura.',
            ops: ['El punto donde se juntan dos o más lados', 'El centro del círculo', 'Un tipo de insecto', 'Una fruta roja'] }
        ]
      },
      {
        nombre: 'La alimentación saludable', icono: '🍎',
        tarjetas: [
          ['🍎', 'Los alimentos saludables, como las frutas y verduras, ayudan a mantener nuestro cuerpo sano.'],
          ['🥤', 'Consumir demasiados refrescos y dulces aumenta el riesgo de obesidad y caries.'],
          ['🍗', 'El pollo, el huevo y la leche son alimentos de origen animal.'],
          ['🍽️', 'El Plato del Bien Comer muestra los grupos de alimentos que debemos consumir.'],
          ['💪', 'Cada grupo de alimentos aporta diferentes nutrientes que nuestro cuerpo necesita.'],
          ['🥗', 'Una alimentación saludable consiste en consumir alimentos variados en cantidades adecuadas.'],
          ['📊', 'Una gráfica es una forma de organizar datos usando colores, barras u otros símbolos para resaltar relaciones entre los datos.'],
          ['➕', 'Practica también problemas de suma o resta.']
        ],
        preguntas: [
          { p: '¿Qué alimentos ayudan a mantener tu cuerpo sano?', e: '🍎', ok: 'Los alimentos saludables, como las frutas y verduras, ayudan a mantener nuestro cuerpo sano.',
            ops: ['Las frutas y verduras', 'Los caramelos', 'Los refrescos', 'Las papitas'] },
          { p: 'Consumir demasiados refrescos y dulces…', e: '🥤', ok: 'Consumir demasiados refrescos y dulces aumenta el riesgo de obesidad y caries.',
            ops: ['Aumenta el riesgo de obesidad y caries', 'Te hace correr más rápido', 'Es lo mejor para tus dientes', 'No afecta tu cuerpo'] },
          { p: '¿Cuál es un alimento de origen animal?', e: '🥚', ok: 'El pollo, el huevo y la leche son alimentos de origen animal.',
            ops: ['El huevo', 'La naranja', 'El brócoli', 'El jitomate'] },
          { p: '¿Qué muestra el Plato del Bien Comer?', e: '🍽️', ok: 'El Plato del Bien Comer muestra los grupos de alimentos que debemos consumir.',
            ops: ['Los grupos de alimentos que debemos consumir', 'Los dibujos animados', 'El clima del día', 'Los cumpleaños del año'] },
          { p: '¿Qué es una alimentación saludable?', e: '🥗', ok: 'Una alimentación saludable consiste en consumir alimentos variados en cantidades adecuadas.',
            ops: ['Consumir alimentos variados en cantidades adecuadas', 'Comer solo dulces todo el día', 'Saltarse todas las comidas', 'Tomar solamente refresco'] },
          { p: '¿Qué es una gráfica?', e: '📊', ok: 'Una gráfica organiza datos con recursos visuales como colores, barras u otros símbolos.',
            ops: ['Una forma de organizar datos con colores y barras', 'Un postre muy rico', 'Un animal pequeño', 'Un juego de escondidas'] },
          { p: 'Ana tiene 12 dulces 🍬 y regala 5. ¿Cuántos dulces le quedan?', e: '🍬', ok: 'Es una resta: 12 − 5 = 7. ¡Muy bien!',
            ops: ['7', '17', '6', '8'] },
          { p: 'En el árbol hay 6 manzanas 🍎 y el papá trae 4 más. ¿Cuántas hay en total?', e: '🍎', ok: 'Es una suma: 6 + 4 = 10. ¡Excelente!',
            ops: ['10', '2', '24', '9'] }
        ]
      }
    ]
  },
  {
    id: 'eti', nombre: 'Ética, Naturaleza y Sociedades', icono: '🌋', c1: '#ff9f1c', c2: '#d9640a',
    temas: [
      {
        nombre: 'Los desastres y la prevención de riesgos', icono: '⚠️',
        tarjetas: [
          ['🌪️', 'Los desastres naturales ocurren cuando fenómenos como huracanes o terremotos causan daños.'],
          ['☀️', 'Las sequías ocurren cuando pasa mucho tiempo sin llover y comienza a faltar agua.'],
          ['🌍', 'Los terremotos son movimientos fuertes del suelo provocados por la liberación de energía del interior de la Tierra.'],
          ['🏚️', 'Las zonas de riesgo son lugares donde pueden ocurrir accidentes o desastres, como casas construidas en terrenos inestables.'],
          ['⚠️', 'El riesgo es la posibilidad de sufrir daños ante un fenómeno peligroso.'],
          ['🔪', 'En el hogar existen riesgos como cortaduras con cuchillos y otros objetos filosos.'],
          ['🌀', 'Ante un huracán, debemos guardar agua y alimentos, y seguir las indicaciones de los adultos.'],
          ['🚯', 'Tirar basura en las alcantarillas aumenta el riesgo de inundaciones.'],
          ['🌋', 'Ante una erupción volcánica, debemos alejarnos de la zona de peligro y seguir las indicaciones de las autoridades.'],
          ['🌊', 'Los tsunamis son grandes olas que pueden producirse por terremotos debajo del mar.']
        ],
        preguntas: [
          { p: 'Los desastres naturales ocurren cuando fenómenos como… causan daños.', e: '🌪️', ok: 'Los desastres naturales ocurren cuando fenómenos como huracanes o terremotos causan daños.',
            ops: ['Huracanes o terremotos', 'El arcoíris o las nubes', 'Las mariposas o las abejas', 'Las flores o los árboles'] },
          { p: '¿Cuándo ocurre una sequía?', e: '☀️', ok: 'Las sequías ocurren cuando pasa mucho tiempo sin llover y comienza a faltar agua.',
            ops: ['Cuando pasa mucho tiempo sin llover', 'Cuando llueve muchísimo', 'Cuando nieva en invierno', 'Cuando sopla un viento suave'] },
          { p: '¿Qué son los terremotos?', e: '🌍', ok: 'Los terremotos son movimientos fuertes del suelo provocados por la liberación de energía del interior de la Tierra.',
            ops: ['Movimientos fuertes del suelo por energía de dentro de la Tierra', 'Olas gigantes del mar', 'Lluvias de estrellas', 'Vientos muy fríos'] },
          { p: '¿Qué son las zonas de riesgo?', e: '🏚️', ok: 'Las zonas de riesgo son lugares donde pueden ocurrir accidentes o desastres, como casas en terrenos inestables.',
            ops: ['Lugares donde pueden ocurrir accidentes o desastres', 'Parques para jugar', 'Piscinas de hotel', 'Tiendas de juguetes'] },
          { p: '¿Qué es el riesgo?', e: '⚠️', ok: 'El riesgo es la posibilidad de sufrir daños ante un fenómeno peligroso.',
            ops: ['La posibilidad de sufrir daños ante un fenómeno peligroso', 'Un premio por correr', 'Un juego divertido', 'Un tipo de nube'] },
          { p: '¿Cuál es un riesgo que existe en el hogar?', e: '🔪', ok: 'En el hogar existen riesgos como cortaduras con cuchillos y otros objetos filosos.',
            ops: ['Cortaduras con cuchillos y objetos filosos', 'Ver la televisión', 'Leer un cuento', 'Dibujar con colores'] },
          { p: 'Ante un huracán debemos…', e: '🌀', ok: 'Ante un huracán, debemos guardar agua y alimentos, y seguir las indicaciones de los adultos.',
            ops: ['Guardar agua y alimentos y hacer caso a los adultos', 'Salir a jugar a la calle', 'Abrir todas las ventanas', 'Subirnos a los árboles'] },
          { p: 'Tirar basura en las alcantarillas…', e: '🚯', ok: 'Tirar basura en las alcantarillas aumenta el riesgo de inundaciones.',
            ops: ['Aumenta el riesgo de inundaciones', 'Ayuda a las plantas a crecer', 'Limpia las calles', 'Hace que llueva menos'] },
          { p: 'Ante una erupción volcánica debemos…', e: '🌋', ok: 'Ante una erupción volcánica, debemos alejarnos de la zona de peligro y seguir las indicaciones de las autoridades.',
            ops: ['Alejarnos del peligro y hacer caso a las autoridades', 'Subirnos al volcán a ver', 'Acercarnos a tocar la lava', 'Quedarnos dormidos'] },
          { p: '¿Qué son los tsunamis?', e: '🌊', ok: 'Los tsunamis son grandes olas que pueden producirse por terremotos debajo del mar.',
            ops: ['Grandes olas por terremotos debajo del mar', 'Vientos fríos del norte', 'Lluvias de verano', 'Ríos pequeños'] }
        ]
      }
    ]
  },
  {
    id: 'hum', nombre: 'De Lo Humano y Lo Comunitario', icono: '💜', c1: '#9b5de5', c2: '#6a2ca0',
    temas: [
      {
        nombre: 'La higiene y la prevención de enfermedades', icono: '🧼',
        tarjetas: [
          ['🧽', 'Limpiar los objetos que usamos diariamente ayuda a prevenir enfermedades.'],
          ['🧼', 'Lavarse las manos antes de comer ayuda a prevenir enfermedades del estómago.'],
          ['🩹', 'Cuando tenemos una cortada, debemos lavar la herida para evitar infecciones.'],
          ['🦷', 'Debemos cepillarnos los dientes al levantarnos y después de cada comida para mantener una buena higiene bucal.'],
          ['🎮', 'Pasar muchas horas jugando videojuegos es un hábito poco saludable.'],
          ['🤧', 'Alimentarnos sanamente y lavarnos las manos ayuda a prevenir enfermedades como la gripa.'],
          ['🛁', 'Bañarnos y mantener limpio nuestro cuerpo ayuda a evitar malos olores y problemas en la piel.']
        ],
        preguntas: [
          { p: '¿Cuándo debemos lavarnos las manos?', e: '🧼', ok: 'Lavarse las manos antes de comer ayuda a prevenir enfermedades del estómago.',
            ops: ['Antes de comer', 'Nunca', 'Solo los domingos', 'Después de dormir'] },
          { p: '¿Qué ayuda a prevenir enfermedades del estómago?', e: '🧼', ok: 'Lavarse las manos antes de comer ayuda a prevenir enfermedades del estómago.',
            ops: ['Lavarse las manos antes de comer', 'Comer con las manos sucias', 'No usar jabón', 'Morderse las uñas'] },
          { p: 'Si tenemos una cortada, debemos…', e: '🩹', ok: 'Cuando tenemos una cortada, debemos lavar la herida para evitar infecciones.',
            ops: ['Lavar la herida para evitar infecciones', 'Taparla con tierra', 'Dejarla sin limpiar', 'Rascárla mucho'] },
          { p: '¿Cuándo debemos cepillarnos los dientes?', e: '🦷', ok: 'Debemos cepillarnos los dientes al levantarnos y después de cada comida.',
            ops: ['Al levantarnos y después de cada comida', 'Solo una vez al mes', 'Nunca', 'Solo cuando salimos'] },
          { p: 'Pasar muchas horas jugando videojuegos es…', e: '🎮', ok: 'Pasar muchas horas jugando videojuegos es un hábito poco saludable.',
            ops: ['Un hábito poco saludable', 'Lo mejor para tu vista', 'Un deporte', 'Una fruta'] },
          { p: 'Bañarnos y mantener limpio nuestro cuerpo ayuda a…', e: '🛁', ok: 'Bañarnos y mantener limpio nuestro cuerpo ayuda a evitar malos olores y problemas en la piel.',
            ops: ['Evitar malos olores y problemas en la piel', 'Perder los dientes', 'Pintar la piel de azul', 'Crecer más lento'] }
        ]
      },
      {
        nombre: 'Las emociones y su manejo', icono: '😊',
        tarjetas: [
          ['❤️', 'Reconocer nuestras emociones nos ayuda a comprender cómo nos sentimos y actuar adecuadamente.'],
          ['😄', 'La alegría es una emoción que sentimos cuando vivimos experiencias agradables.'],
          ['😠', 'El enojo es una emoción que sentimos cuando algo no sale como esperábamos.'],
          ['😨', 'El miedo es una emoción que podemos sentir ante situaciones que nos parecen peligrosas.'],
          ['🎨', 'Cuando sentimos tristeza, podemos realizar actividades que disfrutamos para sentirnos mejor.']
        ],
        preguntas: [
          { p: '¿Para qué nos sirve reconocer nuestras emociones?', e: '❤️', ok: 'Reconocer nuestras emociones nos ayuda a comprender cómo nos sentimos y actuar adecuadamente.',
            ops: ['Para comprender cómo nos sentimos y actuar bien', 'Para poder volar', 'Para no dormir nunca', 'Para ganar siempre'] },
          { p: '¿Cuándo sentimos alegría?', e: '😄', ok: 'La alegría es una emoción que sentimos cuando vivimos experiencias agradables.',
            ops: ['Cuando vivimos experiencias agradables', 'Cuando algo sale mal', 'Cuando vemos algo peligroso', 'Cuando perdemos un juguete'] },
          { p: 'El enojo es una emoción que sentimos cuando…', e: '😠', ok: 'El enojo es una emoción que sentimos cuando algo no sale como esperábamos.',
            ops: ['Algo no sale como esperábamos', 'Nos regalan un cachorro', 'Comemos nuestro postre favorito', 'Vamos de paseo'] },
          { p: 'El miedo es una emoción que sentimos ante…', e: '😨', ok: 'El miedo es una emoción que podemos sentir ante situaciones que nos parecen peligrosas.',
            ops: ['Situaciones que nos parecen peligrosas', 'Nuestras comidas favoritas', 'Los cumpleaños', 'Los juegos divertidos'] },
          { p: 'Si sentimos tristeza, podemos…', e: '🎨', ok: 'Cuando sentimos tristeza, podemos realizar actividades que disfrutamos para sentirnos mejor.',
            ops: ['Hacer actividades que disfrutamos para sentirnos mejor', 'Guardarnos solos para siempre', 'Romper nuestros juguetes', 'Gritarle a nuestros amigos'] }
        ]
      }
    ]
  }
];

/* ---------- Verdadero o Falso (afirmaciones de la guía) ---------- */
const VF = [
  { m: '📚', t: 'El diálogo es una conversación oral o escrita entre dos o más personas.', v: true,
    ayuda: '¡Verdadero! El diálogo puede ser hablado o escrito. 💬' },
  { m: '📚', t: 'Para tomar buenos acuerdos debemos gritar y no escuchar a los demás.', v: false,
    ayuda: 'Falso: debemos dialogar, escuchar a todos y decidir juntos. 👂' },
  { m: '📚', t: 'Un cartel combina imágenes y textos breves para comunicar un mensaje.', v: true,
    ayuda: '¡Verdadero! Por eso los carteles se entienden rápido. 🪧' },
  { m: '📚', t: 'Los adjetivos describen cómo son las personas, animales, objetos y lugares.', v: true,
    ayuda: '¡Verdadero! Como grande, pequeño, alegre o hermoso. 🌟' },
  { m: '📚', t: 'En la biblioteca se reparan los libros rotos.', v: false,
    ayuda: 'Falso: en la biblioteca se organizan libros para leer, investigar o pedirlos prestados. 📖' },
  { m: '📚', t: 'La escultura se crea con materiales como barro, madera o piedra.', v: true,
    ayuda: '¡Verdadero! Ese es el material de las esculturas. 🗿' },
  { m: '📚', t: 'Los altares de muertos se elaboran para asustar a la gente.', v: false,
    ayuda: 'Falso: se elaboran para recordar y honrar a las personas fallecidas. 🌼' },
  { m: '📚', t: 'El papel picado se elabora recortando figuras y diseños en papel.', v: true,
    ayuda: '¡Verdadero! Con tijeras y mucho talento. ✂️' },
  { m: '🔬', t: 'El sistema locomotor está formado por huesos, músculos y articulaciones.', v: true,
    ayuda: '¡Verdadero! Y nos permite mover nuestro cuerpo. 🚶' },
  { m: '🔬', t: 'Los músculos son la parte rígida del cuerpo.', v: false,
    ayuda: 'Falso: los huesos son rígidos; los músculos son tejidos elásticos. 💪' },
  { m: '🔬', t: 'Las articulaciones son donde se unen dos o más huesos.', v: true,
    ayuda: '¡Verdadero! Ahí podemos doblar o flexionar, como el codo. 🦵' },
  { m: '🔬', t: 'Las figuras geométricas planas tienen tres dimensiones.', v: false,
    ayuda: 'Falso: tienen dos dimensiones: largo y ancho. 📐' },
  { m: '🔬', t: 'Un vértice es la esquina donde se juntan dos o más lados de una figura.', v: true,
    ayuda: '¡Verdadero! Como las puntas del triángulo. 📌' },
  { m: '🔬', t: 'El pollo, el huevo y la leche son alimentos de origen vegetal.', v: false,
    ayuda: 'Falso: son alimentos de origen animal. 🥚' },
  { m: '🔬', t: 'Las frutas y verduras ayudan a mantener nuestro cuerpo sano.', v: true,
    ayuda: '¡Verdadero! Son alimentos saludables. 🍎' },
  { m: '🌋', t: 'Los tsunamis son grandes olas que pueden producirse por terremotos debajo del mar.', v: true,
    ayuda: '¡Verdadero! Por eso hay que alejarse de la playa. 🌊' },
  { m: '🌋', t: 'Las sequías ocurren cuando llueve mucho, mucho tiempo.', v: false,
    ayuda: 'Falso: las sequías ocurren cuando pasa mucho tiempo SIN llover y falta agua. ☀️' },
  { m: '🌋', t: 'Tirar basura en las alcantarillas ayuda a prevenir inundaciones.', v: false,
    ayuda: 'Falso: la basura en las alcantarillas AUMENTA el riesgo de inundaciones. 🚯' },
  { m: '🌋', t: 'Ante un huracán debemos guardar agua y alimentos.', v: true,
    ayuda: '¡Verdadero! Y seguir las indicaciones de los adultos. 🌀' },
  { m: '💜', t: 'Lavarse las manos antes de comer ayuda a prevenir enfermedades del estómago.', v: true,
    ayuda: '¡Verdadero! Por eso siempre nos lavamos con jabón. 🧼' },
  { m: '💜', t: 'Pasar muchas horas jugando videojuegos es un hábito muy saludable.', v: false,
    ayuda: 'Falso: es un hábito poco saludable. Mejor sal a jugar un rato. ⚽' },
  { m: '💜', t: 'El enojo es la emoción que sentimos cuando vivimos experiencias agradables.', v: false,
    ayuda: 'Falso: esa es la alegría. El enojo llega cuando algo no sale como esperábamos. 😠' },
  { m: '💜', t: 'El miedo podemos sentirlo ante situaciones que nos parecen peligrosas.', v: true,
    ayuda: '¡Verdadero! El miedo nos avisa del peligro. 😨' },
  { m: '💜', t: 'Cuando sentimos tristeza, hacer actividades que disfrutamos nos ayuda a sentirnos mejor.', v: true,
    ayuda: '¡Verdadero! Dibujar, jugar o platicar con tu familia ayuda mucho. 🎨' }
];

/* ===================== NAVEGACIÓN DE PANTALLAS ===================== */
function mostrarPantalla(id){
  $$('.pantalla').forEach(p => p.classList.add('oculta'));
  $('#' + id).classList.remove('oculta');
  try{ window.scrollTo({ top: 0, behavior: 'smooth' }); }catch(e){ window.scrollTo(0, 0); }
  detenerVoz();
}
$$('.btn-volver').forEach(b => b.addEventListener('click', () => {
  sonidos.click(); mostrarPantalla('pantalla-inicio');
}));

/* ===================== INICIO ===================== */
const COLORES_TITULO = ['#ff4d6d', '#ff9f1c', '#f4c430', '#06d6a0', '#4d96ff', '#9b5de5'];

function animarTitulo(){
  const txt = '¡Guía de Examen!';
  $('#titulo-principal').innerHTML = [...txt].map((c, i) =>
    `<span style="animation-delay:${(i * 0.09).toFixed(2)}s;color:${COLORES_TITULO[i % COLORES_TITULO.length]}">${c === ' ' ? '&nbsp;' : c}</span>`
  ).join('');
}

function renderInicio(){
  const cont = $('#rejilla-materias');
  cont.innerHTML = '';
  MATERIAS.forEach(m => {
    const card = document.createElement('div');
    card.className = 'tarjeta-materia';
    card.style.setProperty('--c1', m.c1);
    card.style.setProperty('--c2', m.c2);
    const est = estrellasDe(m.id);
    card.innerHTML = `
      <div class="icono-materia">${m.icono}</div>
      <h3 class="nombre-materia">${m.nombre}</h3>
      <div class="estrellas-mini">${'⭐'.repeat(est)}${'☆'.repeat(Math.max(0, 3 - est))}</div>
      <div class="fila-botones">
        <button class="btn btn-estudiar">📖 Estudiar</button>
        <button class="btn btn-jugar">🎮 Jugar</button>
      </div>`;
    card.querySelector('.btn-estudiar').addEventListener('click', () => { sonidos.click(); abrirEstudio(m.id); });
    card.querySelector('.btn-jugar').addEventListener('click', () => { sonidos.click(); iniciarQuiz('materia', m.id); });
    cont.appendChild(card);
  });

  const ex = estrellasDe('examen'), vf = estrellasDe('vf');
  const total = Object.values(estrellasMap).reduce((a, b) => a + b, 0);
  $('#panel-estrellas').innerHTML =
    `🏅 Tus medallas: ⭐ ${total} &nbsp;·&nbsp; 🏆 Examen: ${ex ? '⭐'.repeat(ex) : '—'} &nbsp;·&nbsp; ⚡ V o F: ${vf ? '⭐'.repeat(vf) : '—'}`;
}

/* ===================== ESTUDIAR (TARJETAS) ===================== */
const estudio = { materia: null, tema: 0, tarjeta: 0 };

function abrirEstudio(id){
  estudio.materia = MATERIAS.find(m => m.id === id);
  estudio.tema = 0; estudio.tarjeta = 0;
  const m = estudio.materia;
  $('#estudio-titulo').textContent = m.icono + ' ' + m.nombre;
  $('#estudio-titulo').style.color = m.c2;
  renderChips();
  renderTarjeta();
  mostrarPantalla('pantalla-estudiar');
}

function renderChips(){
  const cont = $('#chips-temas');
  cont.innerHTML = '';
  estudio.materia.temas.forEach((t, i) => {
    const c = document.createElement('button');
    c.className = 'chip' + (i === estudio.tema ? ' activa' : '');
    c.style.setProperty('--c1', estudio.materia.c1);
    c.textContent = t.icono + ' ' + t.nombre;
    c.addEventListener('click', () => {
      sonidos.click(); estudio.tema = i; estudio.tarjeta = 0;
      renderChips(); renderTarjeta();
    });
    cont.appendChild(c);
  });
}

function temaActual(){ return estudio.materia.temas[estudio.tema]; }

function renderTarjeta(){
  const m = estudio.materia, t = temaActual();
  const [emoji, texto] = t.tarjetas[estudio.tarjeta];
  const caja = $('#tarjeta-flash');
  caja.style.setProperty('--c1', m.c1);
  caja.style.setProperty('--c2', m.c2);
  $('#tarjeta-emoji').textContent = emoji;
  $('#tarjeta-texto').textContent = texto;
  $('#tarjeta-contador').textContent = (estudio.tarjeta + 1) + ' / ' + t.tarjetas.length;

  const puntos = $('#puntos-tarjetas');
  puntos.innerHTML = '';
  puntos.style.setProperty('--c1', m.c1);
  t.tarjetas.forEach((_, i) => {
    const p = document.createElement('button');
    p.className = 'punto' + (i === estudio.tarjeta ? ' activa' : '');
    p.title = 'Tarjeta ' + (i + 1);
    p.addEventListener('click', () => { sonidos.click(); estudio.tarjeta = i; renderTarjeta(); });
    puntos.appendChild(p);
  });
}

function moverTarjeta(paso){
  sonidos.click();
  const n = temaActual().tarjetas.length;
  estudio.tarjeta = (estudio.tarjeta + paso + n) % n;
  renderTarjeta();
}
$('#btn-anterior').addEventListener('click', () => moverTarjeta(-1));
$('#btn-siguiente-tarjeta').addEventListener('click', () => moverTarjeta(1));

$('#tarjeta-emoji').addEventListener('click', function(){
  sonidos.click();
  this.classList.remove('saltar');
  void this.offsetWidth; /* reinicia la animación */
  this.classList.add('saltar');
});

$('#btn-escuchar').addEventListener('click', () => {
  if (!puedeHablar()){ avisoSinVoz($('#btn-escuchar')); return; }
  sonidos.click();
  leer(temaActual().tarjetas[estudio.tarjeta][1]);
});

function avisoSinVoz(boton){
  const antes = boton.textContent;
  boton.textContent = '🚫';
  setTimeout(() => { boton.textContent = antes; }, 900);
}

/* ===================== QUIZ (PREGUNTAS) ===================== */
let sesion = null;

function poolDeMateria(id){
  const m = MATERIAS.find(x => x.id === id);
  return m.temas.flatMap(t => t.preguntas);
}

function iniciarQuiz(modo, idMateria){
  let pool, titulo, clave;
  if (modo === 'materia'){
    const m = MATERIAS.find(x => x.id === idMateria);
    pool = poolDeMateria(idMateria);
    titulo = m.icono + ' ' + m.nombre;
    clave = m.id;
  } else {
    pool = MATERIAS.flatMap(m => m.temas.flatMap(t => t.preguntas));
    titulo = '🏆 ¡Examen grande!';
    clave = 'examen';
  }
  const cuantas = Math.min(modo === 'examen' ? 15 : 10, pool.length);
  sesion = {
    modo, idMateria, clave, titulo,
    preguntas: mezclar(pool).slice(0, cuantas),
    idx: 0, puntos: 0, racha: 0
  };
  $('#quiz-titulo').textContent = titulo;
  $('#quiz-puntos').textContent = '0';
  mostrarPantalla('pantalla-quiz');
  mostrarPregunta();
}

function mostrarPregunta(){
  const q = sesion.preguntas[sesion.idx];
  $('#quiz-emoji').textContent = q.e;
  $('#quiz-pregunta').textContent = q.p;
  $('#progreso-relleno').style.width = (sesion.idx / sesion.preguntas.length * 100) + '%';

  const fb = $('#quiz-feedback');
  fb.classList.add('oculta');
  $('#btn-siguiente').classList.add('oculta');

  const cont = $('#quiz-opciones');
  cont.innerHTML = '';
  const LETRAS = ['A', 'B', 'C', 'D'];
  mezclar(q.ops.map((texto, i) => ({ texto, ok: i === 0 }))).forEach((op, i) => {
    const b = document.createElement('button');
    b.className = 'opcion';
    b.dataset.ok = op.ok ? 'true' : 'false';
    b.innerHTML = `<span class="letra">${LETRAS[i]}</span><span>${op.texto}</span>`;
    b.addEventListener('click', () => responderQuiz(b, q));
    cont.appendChild(b);
  });
}

$('#btn-leer-pregunta').addEventListener('click', () => {
  if (!puedeHablar()){ avisoSinVoz($('#btn-leer-pregunta')); return; }
  sonidos.click();
  const q = sesion.preguntas[sesion.idx];
  const opciones = $$('#quiz-opciones .opcion span:last-child').map((s, i) => `Opción ${'ABCD'[i]}: ${s.textContent}`).join('. ');
  leer(q.p + ' ' + opciones);
});

function responderQuiz(botonElegido, q){
  const botones = $$('#quiz-opciones .opcion');
  botones.forEach(b => { b.disabled = true; });

  const bien = botonElegido.dataset.ok === 'true';
  const buena = botones.find(b => b.dataset.ok === 'true');

  if (bien){
    botonElegido.classList.add('correcta');
    sesion.puntos++; sesion.racha++;
    if (sesion.racha >= 3) sonidos.racha(); else sonidos.correcto();
    $('#quiz-puntos').textContent = sesion.puntos;
    mostrarFeedbackQuiz(true, q, sesion.racha);
  } else {
    sesion.racha = 0;
    botonElegido.classList.add('incorrecta');
    if (buena) buena.classList.add('correcta');
    sonidos.incorrecto();
    mostrarFeedbackQuiz(false, q, 0, botonElegido.textContent.replace(/^[A-D]\s*/, ''));
  }
  botones.forEach(b => { if (b !== botonElegido && b !== buena) b.classList.add('desactivada'); });
  $('#progreso-relleno').style.width = ((sesion.idx + 1) / sesion.preguntas.length * 100) + '%';
  const btn = $('#btn-siguiente');
  btn.textContent = sesion.idx + 1 >= sesion.preguntas.length ? '🏁 Ver resultados' : 'Siguiente ➡️';
  btn.classList.remove('oculta');
}

function mostrarFeedbackQuiz(bien, q, racha, textoElegido){
  const fb = $('#quiz-feedback');
  fb.classList.remove('oculta', 'bien', 'mal');
  fb.classList.add(bien ? 'bien' : 'mal');
  const carasBien = ['🎉', '🤩', '🌟', '🥳', '😸'];
  const carasMal = ['🤔', '😅', '🙈'];
  $('#feedback-cara').textContent = bien ? carasBien[Math.floor(Math.random() * carasBien.length)] : carasMal[Math.floor(Math.random() * carasMal.length)];
  const elogios = ['¡Correcto!', '¡Muy bien!', '¡Excelente!', '¡Genial!', '¡Brillante!'];
  $('#feedback-titulo').innerHTML =
    (bien ? elogios[Math.floor(Math.random() * elogios.length)] : '¡Casi! La respuesta era: <u>' + q.ops[0] + '</u>') +
    (racha >= 3 ? '<span class="racha">🔥 Racha x' + racha + '</span>' : '');
  $('#feedback-texto').textContent = '💡 ' + q.ok + (bien ? '' : ' (Elegiste: ' + textoElegido + ')');
}

$('#btn-siguiente').addEventListener('click', () => {
  sonidos.click();
  sesion.idx++;
  if (sesion.idx >= sesion.preguntas.length) terminarSesion();
  else mostrarPregunta();
});

$('#btn-salir-quiz').addEventListener('click', () => {
  sonidos.click();
  mostrarPantalla('pantalla-inicio');
});

/* ===================== VERDADERO O FALSO ===================== */
let vfSesion = null;

function iniciarVF(){
  vfSesion = {
    items: mezclar(VF).slice(0, 10),
    idx: 0, puntos: 0, racha: 0
  };
  $('#vf-puntos').textContent = '0';
  mostrarPantalla('pantalla-vf');
  mostrarVf();
}

function mostrarVf(){
  const item = vfSesion.items[vfSesion.idx];
  $('#vf-progreso').style.width = (vfSesion.idx / vfSesion.items.length * 100) + '%';
  $('#vf-materia').textContent = item.m;
  const caja = $('#vf-texto').parentElement;
  caja.classList.remove('bien', 'mal');
  $('#vf-texto').textContent = item.t;
  $('#vf-feedback').classList.add('oculta');
  $('#btn-siguiente-vf').classList.add('oculta');
  $('#btn-verdadero').disabled = false;
  $('#btn-falso').disabled = false;
}

function responderVF(dijoVerdadero){
  const item = vfSesion.items[vfSesion.idx];
  const bien = (dijoVerdadero === item.v);
  $('#btn-verdadero').disabled = true;
  $('#btn-falso').disabled = true;

  const caja = $('#vf-texto').parentElement;
  if (bien){
    vfSesion.puntos++; vfSesion.racha++;
    if (vfSesion.racha >= 3) sonidos.racha(); else sonidos.correcto();
    caja.classList.add('bien');
  } else {
    vfSesion.racha = 0;
    sonidos.incorrecto();
    caja.classList.add('mal');
  }
  $('#vf-puntos').textContent = vfSesion.puntos;

  const fb = $('#vf-feedback');
  fb.classList.remove('oculta', 'bien', 'mal');
  fb.classList.add(bien ? 'bien' : 'mal');
  $('#vf-cara').textContent = bien ? ['🎉', '🤩', '🌟'][Math.floor(Math.random() * 3)] : ['🤔', '😅'][Math.floor(Math.random() * 2)];
  $('#vf-feedback-titulo').textContent = bien ? '¡Correcto!' : ('¡Casi! Era ' + (item.v ? 'VERDADERO ✅' : 'FALSO ❌'));
  $('#vf-feedback-texto').textContent = '💡 ' + item.ayuda;

  $('#vf-progreso').style.width = ((vfSesion.idx + 1) / vfSesion.items.length * 100) + '%';
  const btn = $('#btn-siguiente-vf');
  btn.textContent = vfSesion.idx + 1 >= vfSesion.items.length ? '🏁 Ver resultados' : 'Siguiente ➡️';
  btn.classList.remove('oculta');
}

$('#btn-verdadero').addEventListener('click', () => responderVF(true));
$('#btn-falso').addEventListener('click', () => responderVF(false));
$('#btn-leer-vf').addEventListener('click', () => {
  if (!puedeHablar()){ avisoSinVoz($('#btn-leer-vf')); return; }
  sonidos.click();
  leer(vfSesion.items[vfSesion.idx].t);
});
$('#btn-siguiente-vf').addEventListener('click', () => {
  sonidos.click();
  vfSesion.idx++;
  if (vfSesion.idx >= vfSesion.items.length) terminarVF();
  else mostrarVf();
});
$('#btn-salir-vf').addEventListener('click', () => {
  sonidos.click();
  mostrarPantalla('pantalla-inicio');
});

/* ===================== RESULTADOS ===================== */
let repetirActual = null;

function terminarSesion(){
  mostrarResultados(sesion.puntos, sesion.preguntas.length, sesion.clave,
    () => iniciarQuiz(sesion.modo, sesion.idMateria));
}
function terminarVF(){
  mostrarResultados(vfSesion.puntos, vfSesion.items.length, 'vf', iniciarVF);
}

function mostrarResultados(puntos, total, clave, repetir){
  repetirActual = repetir;
  const pct = puntos / total;
  const estrellas = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : pct >= 0.5 ? 1 : 0;
  guardarEstrellas(clave, estrellas);

  const datos = {
    3: { emoji: '🏆', titulo: '¡EXCELENTE!', msg: '¡Eres una estrella de 3°B! ✨' },
    2: { emoji: '🎉', titulo: '¡Muy bien!', msg: '¡Sigue así, campeón/a! 🚀' },
    1: { emoji: '👍', titulo: '¡Bien hecho!', msg: 'Un poquito más de práctica y lo logras. 💪' },
    0: { emoji: '💪', titulo: '¡Casi lo logras!', msg: 'Estudia las tarjetas 📖 y vuelve a intentarlo. ¡Tú puedes!' }
  }[estrellas];

  $('#resultado-emoji').textContent = datos.emoji;
  $('#resultado-titulo').textContent = datos.titulo;
  $('#resultado-marcador').textContent = `Acertaste ${puntos} de ${total} (${Math.round(pct * 100)}%)`;
  $('#resultado-mensaje').textContent = datos.msg;

  const cont = $('#resultado-estrellas');
  cont.innerHTML = '';
  for (let i = 0; i < 3; i++){
    const s = document.createElement('span');
    s.className = 'estrella-final ' + (i < estrellas ? 'por-ganar' : 'apagada');
    s.textContent = i < estrellas ? '⭐' : '☆';
    cont.appendChild(s);
    if (i < estrellas){
      setTimeout(() => {
        s.classList.add('ganada');
        sonidos.estrella(i);
      }, 600 + i * 500);
    }
  }

  mostrarPantalla('pantalla-resultados');
  setTimeout(() => sonidos.fanfarria(), 250);
  if (estrellas >= 2) confeti();
}

$('#btn-repetir').addEventListener('click', () => {
  sonidos.click();
  if (typeof repetirActual === 'function') repetirActual();
});

$('#btn-inicio').addEventListener('click', () => {
  sonidos.click();
  mostrarPantalla('pantalla-inicio');
});

/* ===================== EXTRAS: CONFETI, FLOTANTES, SONIDO ===================== */
function confeti(){
  const colores = ['#ff4d6d', '#ffd93d', '#06d6a0', '#4d96ff', '#9b5de5', '#ff9f1c'];
  for (let i = 0; i < 110; i++){
    const d = document.createElement('div');
    d.className = 'confeti';
    const t = 8 + Math.random() * 8;
    d.style.width = t + 'px';
    d.style.height = t + 'px';
    d.style.left = Math.random() * 100 + 'vw';
    d.style.background = colores[i % colores.length];
    d.style.animationDelay = (Math.random() * 0.7) + 's';
    d.style.animationDuration = (2.2 + Math.random() * 2) + 's';
    d.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 5200);
  }
}

function crearFlotantes(){
  const em = ['☁️', '⭐', '✏️', '🎈', '📗', '🧮', '🌈', '🌟', '📕', '☀️', '🎨', '🍎'];
  const cont = $('#flotantes');
  for (let i = 0; i < em.length; i++){
    const s = document.createElement('span');
    s.className = 'flotante';
    s.textContent = em[i];
    s.style.left = (4 + Math.random() * 92) + 'vw';
    s.style.top = (4 + Math.random() * 88) + 'vh';
    s.style.fontSize = (1.4 + Math.random() * 1.6) + 'rem';
    s.style.animationDelay = (Math.random() * 4) + 's';
    s.style.animationDuration = (5.5 + Math.random() * 4) + 's';
    cont.appendChild(s);
  }
}

function actualizarBotonSonido(){
  $('#btn-sonido').textContent = SONIDO.on ? '🔊' : '🔇';
}
$('#btn-sonido').addEventListener('click', () => {
  SONIDO.on = !SONIDO.on;
  guardarSonido();
  if (!SONIDO.on) detenerVoz(); else sonidos.correcto();
  actualizarBotonSonido();
});

/* ===================== BOTONES DE INICIO ===================== */
$('#btn-examen').addEventListener('click', () => { sonidos.click(); iniciarQuiz('examen'); });
$('#btn-vf').addEventListener('click', () => { sonidos.click(); iniciarVF(); });
$('#mascota-inicio').addEventListener('click', function(){
  sonidos.click();
  this.style.transform = 'scale(1.3) rotate(360deg)';
  setTimeout(() => { this.style.transform = ''; }, 600);
});

/* ===================== ARRANQUE ===================== */
animarTitulo();
crearFlotantes();
actualizarBotonSonido();
renderInicio();
