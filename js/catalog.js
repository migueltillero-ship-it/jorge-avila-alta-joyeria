/* =============================================================================
   JORGE ÁVILA · ALTA JOYERÍA · DATOS DEL SITIO
   Este es el único archivo que hay que editar para cambiar textos, precios,
   medidas o datos de contacto. Todo el sitio se construye a partir de él.
   ============================================================================= */

const CONFIG = {
    marca: "JORGE ÁVILA",               // como aparece en la cabecera
    nombre: "Jorge Ávila",              // como aparece en textos y fichas
    whatsapp: "56956258569",            // sin "+", sin espacios
    whatsappVisible: "+56 9 5625 8569",

    // METAL: si la plata está certificada como ley 950, escribe aquí "Plata ley 950"
    // (y "Argent 950" / "950 silver"). Mientras no esté confirmado, se muestra "Plata".
    metal: { es: "Plata", fr: "Argent", en: "Silver" },
    piedra: { es: "Rodocrosita", fr: "Rhodochrosite", en: "Rhodochrosite" },

    // Tasas de referencia (1 CLP = x). Revisar periódicamente.
    tasas: { CLP: 1, USD: 1 / 970, EUR: 0.00097 },
    tasasFecha: { es: "noviembre de 2026", fr: "novembre 2026", en: "November 2026" },

    // Bonificación por número de piezas elegidas
    bonificaciones: [ { desde: 3, porcentaje: 0.18 }, { desde: 2, porcentaje: 0.10 } ]
};

/*  VIDEOS
    Todos son verticales (9:16). Fuente y recorte:
      intro          joya.mp4 completo (15 s, con la narración)
      catalogo       joyas_3.mp4, de 2,6 s a 9,3 s
      probador       joyas_2.mp4, de 2,0 s a 6,8 s
      coleccionistas joyas_2.mp4, de 7,0 s a 8,8 s (el juego completo)
      orfebre        joyas_2.mp4, de 11,0 s a 13,0 s (manos con guantes)
    Los recortes evitan los tramos donde aparecen joyas que no existen en la colección.
    introObligatoria: true  la primera visita debe ver la presentación completa;
                            en visitas posteriores aparece el botón "Saltar".            */
const VIDEOS = {
    introObligatoria: true,
    intro:          { src: "assets/video/intro.mp4",          poster: "assets/video/intro.jpg",          sonido: true },
    coleccion:      { src: "assets/video/catalogo.mp4",       poster: "assets/video/catalogo.jpg",       sonido: true },
    probador:       { src: "assets/video/probador.mp4",       poster: "assets/video/probador.jpg",       sonido: true },
    coleccionistas: { src: "assets/video/coleccionistas.mp4", poster: "assets/video/coleccionistas.jpg", sonido: false },
    orfebre:        { src: "assets/video/orfebre.mp4",        poster: "assets/video/orfebre.jpg",        sonido: false },
    nuevo:          { src: "assets/video/nuevo.mp4",          poster: "assets/video/nuevo.jpg",          sonido: false }
};
/*  Presentación de cada obra (fondo negro, 3D): assets/3d/NN.mp4. Obligatoria la primera vez
    que se abre cada obra; después aparece "Saltar". Con presentacionObligatoria: false siempre se puede saltar. */
const PRESENTACION = { obligatoria: true, carpeta: "assets/3d/" };

/*  CAMPOS POR PIEZA
    ambiente : imagen de campaña (generada a partir de la foto real). null si aún no existe.
    real     : fotografía real de la pieza, con el tono plata corregido. Siempre presente.
    probador : recorte con fondo transparente para el probador virtual.
    medidas / peso : vacíos hasta que se confirmen midiendo la pieza. Si están vacíos,
                     la fila no se muestra.
    portada        : false para que la pieza no aparezca en el friso de la portada.   */

/*  COLECCIONES
    hecha : Hecha de Tiempo (obras I a IX)
    vetas : Vetas del Sur, la nueva colección (obras X a XXII). Textos y precios provisorios: revisar.
    Cada obra tiene además, en assets/3d/: NN.glb (modelo 3D), NN.mp4 (presentación) y NN.jpg (portada del video). */
const COLECCIONES = {
    hecha: { nombre: { es: "Hecha de Tiempo", fr: "Hecha de Tiempo", en: "Hecha de Tiempo" } },
    vetas: { nombre: { es: "Vetas del Sur", fr: "Veines du Sud", en: "Southern Veins" }, nueva: true }
};

const JEWELS = [
    {
        id: "01", code: "I", categoria: "orbital", precioCLP: 540000,
        medidas: "", peso: "",
        img: { ambiente: "assets/piezas/01_ambiente.jpg", real: "assets/piezas/01_real.jpg", probador: "assets/piezas/probador/01.png" },
        titulo: { es: "Rosa de los Vientos", fr: "Rose des Vents", en: "Compass Rose" },
        forma: { es: "Redonda, plana y pulida", fr: "Ronde, plate et polie", en: "Round, flat and polished" },
        resumen: {
            es: "Cuatro lazos de plata en forma de almendra se cruzan sobre un círculo y señalan los puntos cardinales. En el centro, una rodocrosita redonda de rosa coral.",
            fr: "Quatre boucles d'argent en amande croisent un cercle et désignent les points cardinaux. Au centre, une rhodochrosite ronde d'un rose corail.",
            en: "Four almond shaped silver loops cross a circle and point to the cardinal directions. At the center, a round coral pink rhodochrosite."
        },
        historia1: {
            es: "Nacida frente a las cartas de navegación de Valparaíso, esta pieza traduce la rosa náutica en una escultura aérea: cuatro pétalos abiertos de hilo de plata entrelazados con un círculo.",
            fr: "Née devant les cartes marines de Valparaíso, cette pièce traduit la rose nautique en une sculpture aérienne : quatre pétales ouverts de fil d'argent entrelacés avec un cercle.",
            en: "Born before the navigation charts of Valparaíso, this piece turns the compass rose into an aerial sculpture: four open petals of silver wire interlaced with a circle."
        },
        historia2: {
            es: "En el centro reposa una rodocrosita redonda cuyas vetas coral y marfil dibujan un mapa que no se repite en ninguna otra piedra.",
            fr: "Au centre repose une rhodochrosite ronde dont les veines corail et ivoire dessinent une carte qu'aucune autre pierre ne répète.",
            en: "At its center rests a round rhodochrosite whose coral and ivory veins draw a map no other stone repeats."
        }
    },
    {
        id: "02", code: "II", categoria: "organica", precioCLP: 490000,
        medidas: "", peso: "",
        img: { ambiente: "assets/piezas/02_ambiente.jpg", real: "assets/piezas/02_real.jpg", probador: "assets/piezas/probador/02.png" },
        titulo: { es: "Gota Austral", fr: "Goutte Australe", en: "Southern Drop" },
        forma: { es: "Gota irregular, plana y pulida", fr: "Goutte irrégulière, plate et polie", en: "Irregular teardrop, flat and polished" },
        resumen: {
            es: "Una rodocrosita en forma de gota, de vetas rosas, blancas y grises, abrazada por un trazo de plata que nace y termina en espiral.",
            fr: "Une rhodochrosite en forme de goutte, aux veines roses, blanches et grises, enlacée par un trait d'argent qui naît et s'achève en spirale.",
            en: "A teardrop rhodochrosite with pink, white and grey veins, embraced by a silver line that begins and ends in a spiral."
        },
        historia1: {
            es: "Las formaciones internas de este ejemplar dibujan cordilleras rosadas y senderos minerales. Para acompañar ese movimiento, el hilo de plata sube por el costado derecho y se riza en ambos extremos.",
            fr: "Les formations internes de cet exemplaire dessinent des cordillères rosées et des sentiers minéraux. Pour accompagner ce mouvement, le fil d'argent longe le flanc droit et s'enroule à ses deux extrémités.",
            en: "The inner formations of this specimen draw rose mountain ranges and mineral paths. To follow that movement, the silver wire climbs the right side and curls at both ends."
        },
        historia2: {
            es: "Su forma irregular y su dibujo libre la convierten en una joya orgánica que dialoga con la curva natural del cuello.",
            fr: "Sa forme irrégulière et son dessin libre en font un bijou organique qui dialogue avec la courbe naturelle du cou.",
            en: "Its irregular shape and free pattern make it an organic jewel that converses with the natural curve of the neck."
        }
    },
    {
        id: "03", code: "III", categoria: "geometrica", precioCLP: 510000,
        medidas: "", peso: "",
        img: { ambiente: "assets/piezas/03_ambiente.jpg", real: "assets/piezas/03_real.jpg", probador: "assets/piezas/probador/03.png" },
        titulo: { es: "Vértice Andino", fr: "Sommet Andin", en: "Andean Vertex" },
        forma: { es: "Estrella de cuatro puntas, plana y pulida", fr: "Étoile à quatre branches, plate et polie", en: "Four pointed star, flat and polished" },
        resumen: {
            es: "Un rombo abierto de plata conduce, punta con punta, hacia una rodocrosita en forma de estrella de cuatro puntas.",
            fr: "Un losange ouvert en argent mène, pointe contre pointe, vers une rhodochrosite en étoile à quatre branches.",
            en: "An open silver rhombus leads, point to point, to a four pointed star of rhodochrosite."
        },
        historia1: {
            es: "Dos cuerpos geométricos unidos en un vértice: el superior dibuja el aire con un trazo limpio de plata; el inferior guarda una piedra de lados suavemente curvados hacia dentro.",
            fr: "Deux corps géométriques unis par un sommet : le premier dessine l'air d'un trait d'argent net ; le second abrite une pierre aux côtés doucement incurvés vers l'intérieur.",
            en: "Two geometric bodies joined at a vertex: the upper one draws the air with a clean silver line; the lower one holds a stone whose sides curve gently inward."
        },
        historia2: {
            es: "Sus nubes blancas sobre fondo coral convierten la piedra en una pintura abstracta natural.",
            fr: "Ses nuages blancs sur fond corail font de la pierre une peinture abstraite naturelle.",
            en: "Its white clouds over a coral ground turn the stone into a natural abstract painting."
        }
    },
    {
        id: "04", code: "IV", categoria: "organica", precioCLP: 525000,
        medidas: "", peso: "",
        img: { ambiente: "assets/piezas/04_ambiente.jpg", real: "assets/piezas/04_real.jpg", probador: "assets/piezas/probador/04.png" },
        titulo: { es: "Campana Austral", fr: "Cloche Australe", en: "Southern Bell" },
        forma: { es: "Ovalada, plana y pulida", fr: "Ovale, plate et polie", en: "Oval, flat and polished" },
        resumen: {
            es: "Un arco de plata en forma de campana guarda una rodocrosita ovalada, coronada por un anillo y una pequeña esfera.",
            fr: "Une arche d'argent en forme de cloche abrite une rhodochrosite ovale, couronnée d'un anneau et d'une petite sphère.",
            en: "A bell shaped silver arch shelters an oval rhodochrosite, crowned by a ring and a small sphere."
        },
        historia1: {
            es: "En las cumbres australes, el agua pule la roca durante milenios. Esta pieza suspende una rodocrosita ovalada de intensa floración rosada bajo un anillo de plata coronado por una esfera.",
            fr: "Sur les sommets austraux, l'eau polit la roche durant des millénaires. Cette pièce suspend une rhodochrosite ovale d'une floraison rose intense sous un anneau d'argent couronné d'une sphère.",
            en: "In the southern peaks, water polishes rock for millennia. This piece suspends an oval rhodochrosite of intense pink bloom beneath a silver ring crowned by a sphere."
        },
        historia2: {
            es: "El espacio abierto entre la piedra y el marco deja pasar la luz y perfila la silueta del metal sobre la piel.",
            fr: "L'espace ouvert entre la pierre et le cadre laisse passer la lumière et dessine la silhouette du métal sur la peau.",
            en: "The open space between stone and frame lets light through and outlines the silver silhouette against the skin."
        }
    },
    {
        id: "05", code: "V", categoria: "geometrica", precioCLP: 560000,
        medidas: "", peso: "",
        img: { ambiente: "assets/piezas/05_ambiente.jpg", real: "assets/piezas/05_real.jpg", probador: "assets/piezas/probador/05.png" },
        titulo: { es: "Horizonte Mineral", fr: "Horizon Minéral", en: "Mineral Horizon" },
        forma: { es: "Barra rectangular bandeada, plana y pulida", fr: "Barre rectangulaire rubanée, plate et polie", en: "Banded rectangular bar, flat and polished" },
        resumen: {
            es: "Un marco cuadrado de plata, girado en rombo, atravesado por una barra de rodocrosita de bandas finas como una línea de horizonte.",
            fr: "Un cadre carré en argent, posé en losange, traversé par une barre de rhodochrosite aux fines bandes, comme une ligne d'horizon.",
            en: "A square silver frame set as a diamond, crossed by a finely banded rhodochrosite bar like a horizon line."
        },
        historia1: {
            es: "Un homenaje al constructivismo. La piedra, tallada en rectángulo, muestra estratos paralelos que parecen pinceladas, sostenidos dentro de un marco de plata de aristas suaves.",
            fr: "Un hommage au constructivisme. La pierre, taillée en rectangle, révèle des strates parallèles semblables à des coups de pinceau, tenues dans un cadre d'argent aux arêtes douces.",
            en: "A tribute to constructivism. The stone, cut as a rectangle, reveals parallel strata like brushstrokes, held within a softly edged silver frame."
        },
        historia2: {
            es: "Las dos ventanas vacías a cada lado de la barra le dan una ligereza visual extraordinaria sobre cualquier prenda.",
            fr: "Les deux fenêtres vides de part et d'autre de la barre lui donnent une légèreté visuelle remarquable sur tout vêtement.",
            en: "The two open windows on either side of the bar give it remarkable visual lightness over any garment."
        }
    },
    {
        id: "06", code: "VI", categoria: "geometrica", precioCLP: 680000,
        medidas: "", peso: "",
        img: { ambiente: "assets/piezas/06_ambiente.jpg", real: "assets/piezas/06_real.jpg", probador: "assets/piezas/probador/06.png" },
        titulo: { es: "Tríptico del Tiempo", fr: "Triptyque du Temps", en: "Triptych of Time" },
        forma: { es: "Cuadrados y rombos, planos y pulidos", fr: "Carrés et losanges, plats et polis", en: "Squares and diamonds, flat and polished" },
        juego: { es: "Juego de colgante y dos aretes", fr: "Parure : pendentif et deux boucles d'oreilles", en: "Set: pendant and two earrings" },
        resumen: {
            es: "El único juego de la colección: un colgante y dos aretes articulados, con cabezales cuadrados y cuerpos en rombo.",
            fr: "La seule parure de la collection : un pendentif et deux boucles d'oreilles articulés, aux têtes carrées et aux corps en losange.",
            en: "The only set in the collection: a pendant and two articulated earrings with square heads and diamond bodies."
        },
        historia1: {
            es: "Las tres piezas comparten los mismos tonos de rodocrosita, marfil, arena y rosa pálido. Cada una tiene una bisagra de plata que da movimiento propio al rombo inferior.",
            fr: "Les trois pièces partagent les mêmes tons de rhodochrosite, ivoire, sable et rose pâle. Chacune possède une charnière d'argent qui donne au losange inférieur son propre mouvement.",
            en: "The three pieces share the same rhodochrosite tones of ivory, sand and pale rose. Each has a silver hinge that gives the lower diamond its own movement."
        },
        historia2: {
            es: "Representa el pasado, el presente y el porvenir reunidos en una sola obra.",
            fr: "Il représente le passé, le présent et l'avenir réunis en une seule œuvre.",
            en: "It represents past, present and future gathered in a single work."
        }
    },
    {
        id: "07", code: "VII", categoria: "organica", precioCLP: 550000,
        medidas: "", peso: "",
        img: { ambiente: "assets/piezas/07_ambiente.jpg", real: "assets/piezas/07_real.jpg", probador: "assets/piezas/probador/07.png" },
        titulo: { es: "Voluta Barroca", fr: "Volute Baroque", en: "Baroque Volute" },
        forma: { es: "Cojín horizontal bandeado, plano y pulido", fr: "Coussin horizontal rubané, plat et poli", en: "Banded horizontal cushion, flat and polished" },
        resumen: {
            es: "Una rodocrosita horizontal de ondas muy marcadas, en un bisel ancho de plata y coronada por volutas libres.",
            fr: "Une rhodochrosite horizontale aux ondes très marquées, dans un large serti d'argent et couronnée de volutes libres.",
            en: "A horizontal rhodochrosite with strongly marked waves, set in a wide silver bezel and crowned by free volutes."
        },
        historia1: {
            es: "El bisel ancho de plata enmarca una piedra cuyas bandas horizontales parecen olas marinas petrificadas.",
            fr: "Le large serti d'argent encadre une pierre dont les bandes horizontales évoquent des vagues pétrifiées.",
            en: "The wide silver bezel frames a stone whose horizontal bands evoke petrified ocean waves."
        },
        historia2: {
            es: "Sobre la piedra se eleva una danza de espirales de hilo de plata que sostiene el pasacadena.",
            fr: "Au dessus de la pierre s'élève une danse de spirales en fil d'argent qui porte la bélière.",
            en: "Above the stone rises a dance of silver wire spirals that holds the bail."
        }
    },
    {
        id: "08", code: "VIII", categoria: "orbital", precioCLP: 530000,
        medidas: "", peso: "",
        portada: false,   // no aparece en el friso de la portada (su foto no comparte el fondo azul de las demás)
        // Sin imagen de campaña todavía: se muestra la fotografía real.
        // Cuando exista, ACTUALIZAR.ps1 la copia como assets/piezas/08_ambiente.jpg y basta cambiar null por esa ruta.
        img: { ambiente: null, real: "assets/piezas/08_real.jpg", probador: "assets/piezas/probador/08.png" },
        titulo: { es: "Órbita Interior", fr: "Orbite Intérieure", en: "Inner Orbit" },
        forma: { es: "Redonda, plana y pulida", fr: "Ronde, plate et polie", en: "Round, flat and polished" },
        resumen: {
            es: "Dos círculos de plata en órbita que se tocan en lo alto. La rodocrosita, de vetas blancas, descansa en la parte superior del círculo interior.",
            fr: "Deux cercles d'argent en orbite qui se touchent au sommet. La rhodochrosite, veinée de blanc, repose dans le haut du cercle intérieur.",
            en: "Two silver circles in orbit, touching at the top. The rhodochrosite, veined with white, rests in the upper part of the inner circle."
        },
        historia1: {
            es: "Inspirada en los astrolabios antiguos y en el movimiento de los planetas, esta pieza desplaza sus círculos del centro para que el vacío también forme parte del diseño.",
            fr: "Inspirée des astrolabes anciens et du mouvement des planètes, cette pièce décentre ses cercles pour que le vide fasse aussi partie du dessin.",
            en: "Inspired by ancient astrolabes and planetary motion, this piece shifts its circles off center so that empty space becomes part of the design."
        },
        historia2: {
            es: "La piedra, de rosa intenso con nubes blancas, parece un pequeño planeta suspendido dentro de su propia órbita.",
            fr: "La pierre, d'un rose intense aux nuages blancs, semble une petite planète suspendue dans sa propre orbite.",
            en: "The stone, intense pink with white clouds, looks like a small planet suspended in its own orbit."
        }
    },
    {
        id: "09", code: "IX", categoria: "geometrica", precioCLP: 590000,
        medidas: "", peso: "",
        img: { ambiente: "assets/piezas/09_ambiente.jpg", real: "assets/piezas/09_real.jpg", probador: "assets/piezas/probador/09.png" },
        titulo: { es: "Nudo Marinero", fr: "Nœud Marin", en: "Sailor's Knot" },
        forma: { es: "Ovalada, plana y pulida", fr: "Ovale, plate et polie", en: "Oval, flat and polished" },
        resumen: {
            es: "Dos lazos de plata se cruzan como un nudo y sostienen una rodocrosita ovalada de rojo intenso con bandas blancas.",
            fr: "Deux boucles d'argent se croisent comme un nœud et retiennent une rhodochrosite ovale d'un rouge intense aux bandes blanches.",
            en: "Two silver loops cross like a knot and hold an oval rhodochrosite of intense red with white bands."
        },
        historia1: {
            es: "Inspirada en los nudos de los puertos y en la ingeniería de los puentes colgantes: dos varillas descienden desde la cúspide formando una V y abrazan la piedra central.",
            fr: "Inspirée des nœuds des ports et de l'ingénierie des ponts suspendus : deux tiges descendent du sommet en formant un V et enlacent la pierre centrale.",
            en: "Inspired by harbor knots and suspension bridge engineering: two rods descend from the apex in a V and embrace the central stone."
        },
        historia2: {
            es: "Su equilibrio simétrico transmite firmeza, modernidad y carácter escultórico.",
            fr: "Son équilibre symétrique exprime fermeté, modernité et caractère sculptural.",
            en: "Its symmetrical balance conveys strength, modernity and sculptural poise."
        }
    },
    {
        id: "10", code: "X", coleccion: "vetas", tipo: "colgante", categoria: "geometrica", precioCLP: 480000,
        medidas: "", peso: "",
        img: { ambiente: "assets/piezas/10_ambiente.jpg", real: "assets/piezas/10_real.jpg", probador: "assets/piezas/probador/10.png" },
        titulo: { es: "Doble Cuadrante", fr: "Double Cadran", en: "Double Quadrant" },
        forma: { es: "Dos cuadrados de esquinas suaves, unidos por una bisagra", fr: "Deux carrés aux angles doux, reliés par une charnière", en: "Two soft cornered squares joined by a hinge" },
        resumen: { es: "Dos rodocrositas cuadradas de esquinas redondeadas, la menor sobre la mayor, unidas por una pequeña bisagra de plata que las deja moverse.", fr: "Deux rhodochrosites carrées aux angles arrondis, la petite au dessus de la grande, reliées par une petite charnière d'argent qui les laisse bouger.", en: "Two square rhodochrosites with rounded corners, the smaller above the larger, joined by a small silver hinge that lets them move." },
        historia1: { es: "La pieza dialoga consigo misma: un cuadrado pequeño anuncia al grande, como una ventana que se abre a otra en las casas de los cerros.", fr: "La pièce dialogue avec elle même : un petit carré annonce le grand, comme une fenêtre qui s'ouvre sur une autre dans les maisons des collines.", en: "The piece speaks to itself: a small square announces the larger one, like one window opening onto another in the hillside houses." },
        historia2: { es: "La bisagra le da movimiento al cuello. Cada piedra fue cortada de la misma veta rosa, por eso sus tonos conversan.", fr: "La charnière donne du mouvement au cou. Chaque pierre fut taillée dans la même veine rose, c'est pourquoi leurs tons se répondent.", en: "The hinge gives it movement at the neck. Each stone was cut from the same pink vein, which is why their tones converse." }
    },
    {
        id: "11", code: "XI", coleccion: "vetas", tipo: "aros", categoria: "geometrica", precioCLP: 320000,
        medidas: "", peso: "",
        img: { ambiente: "assets/piezas/11_ambiente.jpg", real: "assets/piezas/11_real.jpg", probador: "assets/piezas/probador/11.png" },
        titulo: { es: "Velas del Pacífico", fr: "Voiles du Pacifique", en: "Pacific Sails" },
        forma: { es: "Par de aros en forma de vela, de lados curvos", fr: "Paire de boucles en forme de voile, aux côtés courbes", en: "Pair of sail shaped earrings with curved sides" },
        resumen: { es: "Un par de aros con rodocrosita en forma de vela: lados curvos que se cierran en punta, con bandas de tonos tierra, crema y rosa.", fr: "Une paire de boucles en rhodochrosite en forme de voile : des côtés courbes qui se referment en pointe, aux bandes terre, crème et rose.", en: "A pair of rhodochrosite earrings shaped like sails: curved sides closing to a point, with bands of earth, cream and pink." },
        historia1: { es: "Las bandas horizontales de la piedra recuerdan el horizonte del Pacífico al atardecer, visto desde los miradores del puerto.", fr: "Les bandes horizontales de la pierre rappellent l'horizon du Pacifique au couchant, vu depuis les belvédères du port.", en: "The stone's horizontal bands recall the Pacific horizon at dusk, seen from the harbor's lookouts." },
        historia2: { es: "Cuelgan de un gancho largo de plata que las deja balancearse con cada gesto.", fr: "Elles pendent d'un long crochet d'argent qui les laisse se balancer à chaque geste.", en: "They hang from a long silver hook that lets them sway with every gesture." }
    },
    {
        id: "12", code: "XII", coleccion: "vetas", tipo: "colgante", categoria: "organica", precioCLP: 470000,
        medidas: "", peso: "",
        img: { ambiente: "assets/piezas/12_ambiente.jpg", real: "assets/piezas/12_real.jpg", probador: "assets/piezas/probador/12.png" },
        titulo: { es: "Ánfora", fr: "Amphore", en: "Amphora" },
        forma: { es: "Un círculo sobre una forma de ánfora", fr: "Un cercle au dessus d'une forme d'amphore", en: "A circle above an amphora shape" },
        resumen: { es: "Una rodocrosita redonda corona una segunda piedra que se ensancha hacia abajo como un ánfora, unidas por una bisagra de plata.", fr: "Une rhodochrosite ronde couronne une seconde pierre qui s'élargit vers le bas comme une amphore, reliées par une charnière d'argent.", en: "A round rhodochrosite crowns a second stone that widens downward like an amphora, joined by a silver hinge." },
        historia1: { es: "Su silueta evoca las vasijas que guardaban el vino y el aceite en los barcos que llegaban a Valparaíso.", fr: "Sa silhouette évoque les jarres qui gardaient le vin et l'huile dans les navires arrivant à Valparaíso.", en: "Its silhouette evokes the vessels that held wine and oil aboard the ships arriving in Valparaíso." },
        historia2: { es: "Las vetas finas y paralelas recorren la piedra mayor como el agua dentro de un recipiente.", fr: "Les veines fines et parallèles parcourent la grande pierre comme l'eau dans un récipient.", en: "Fine parallel veins run through the larger stone like water inside a vessel." }
    },
    {
        id: "13", code: "XIII", coleccion: "vetas", tipo: "aros", categoria: "organica", precioCLP: 330000,
        medidas: "", peso: "",
        img: { ambiente: "assets/piezas/13_ambiente.jpg", real: "assets/piezas/13_real.jpg", probador: "assets/piezas/probador/13.png" },
        titulo: { es: "Mirada de Almendra", fr: "Regard d'Amande", en: "Almond Gaze" },
        forma: { es: "Par de aros: almendra de piedra dentro de un marco abierto", fr: "Paire de boucles : amande de pierre dans un cadre ouvert", en: "Pair of earrings: a stone almond inside an open frame" },
        resumen: { es: "Un marco de plata en forma de almendra encierra, en su parte baja, una piedra con la misma forma y bandas en tonos miel, crema y malva.", fr: "Un cadre d'argent en forme d'amande enferme, dans sa partie basse, une pierre de même forme aux bandes miel, crème et mauve.", en: "An almond shaped silver frame holds, in its lower part, a stone of the same shape with bands of honey, cream and mauve." },
        historia1: { es: "El espacio vacío dentro del marco es parte del diseño: deja pasar la luz y hace que la piedra parezca flotar.", fr: "L'espace vide dans le cadre fait partie du dessin : il laisse passer la lumière et la pierre semble flotter.", en: "The empty space inside the frame is part of the design: it lets light through and makes the stone seem to float." },
        historia2: { es: "Una forma que se repite dentro de sí misma, como una mirada que se devuelve.", fr: "Une forme qui se répète en elle même, comme un regard qui se retourne.", en: "A shape repeated within itself, like a gaze returned." }
    },
    {
        id: "14", code: "XIV", coleccion: "vetas", tipo: "colgante", categoria: "orbital", precioCLP: 480000,
        medidas: "", peso: "",
        img: { ambiente: "assets/piezas/14_ambiente.jpg", real: "assets/piezas/14_real.jpg", probador: "assets/piezas/probador/14.png" },
        titulo: { es: "Eclipse", fr: "Éclipse", en: "Eclipse" },
        forma: { es: "Dos óvalos, el menor sobre el mayor", fr: "Deux ovales, le petit au dessus du grand", en: "Two ovals, the smaller above the larger" },
        resumen: { es: "Dos rodocrositas ovaladas de un rosa intenso, la menor sobre la mayor, unidas por una bisagra de plata.", fr: "Deux rhodochrosites ovales d'un rose intense, la petite au dessus de la grande, reliées par une charnière d'argent.", en: "Two oval rhodochrosites of intense pink, the smaller above the larger, joined by a silver hinge." },
        historia1: { es: "Como dos astros que se alinean un instante, el óvalo pequeño parece a punto de cubrir al grande.", fr: "Comme deux astres qui s'alignent un instant, le petit ovale semble sur le point de couvrir le grand.", en: "Like two celestial bodies aligning for an instant, the small oval seems about to cover the large one." },
        historia2: { es: "Es la pieza de color más encendido de la colección: un rosa coral casi rojo, con nubes más claras.", fr: "C'est la pièce à la couleur la plus vive de la collection : un rose corail presque rouge, avec des nuages plus clairs.", en: "It is the most vivid piece in the collection: a coral pink almost red, with lighter clouds." }
    },
    {
        id: "15", code: "XV", coleccion: "vetas", tipo: "colgante", categoria: "orbital", precioCLP: 470000,
        medidas: "", peso: "",
        img: { ambiente: "assets/piezas/15_ambiente.jpg", real: "assets/piezas/15_real.jpg", probador: "assets/piezas/probador/15.png" },
        titulo: { es: "Lunas Gemelas", fr: "Lunes Jumelles", en: "Twin Moons" },
        forma: { es: "Dos círculos, el menor sobre el mayor", fr: "Deux cercles, le petit au dessus du grand", en: "Two circles, the smaller above the larger" },
        resumen: { es: "Dos rodocrositas redondas con ondas rosa y blancas, unidas por una bisagra de plata.", fr: "Deux rhodochrosites rondes aux ondes roses et blanches, reliées par une charnière d'argent.", en: "Two round rhodochrosites with pink and white waves, joined by a silver hinge." },
        historia1: { es: "Las ondas de la piedra mayor parecen la superficie del mar vista de noche bajo dos lunas.", fr: "Les ondes de la grande pierre ressemblent à la surface de la mer, la nuit, sous deux lunes.", en: "The waves in the larger stone resemble the sea at night beneath two moons." },
        historia2: { es: "La forma más pura de la colección: dos círculos que no necesitan nada más.", fr: "La forme la plus pure de la collection : deux cercles qui n'ont besoin de rien d'autre.", en: "The purest form in the collection: two circles that need nothing more." }
    },
    {
        id: "16", code: "XVI", coleccion: "vetas", tipo: "colgante", categoria: "geometrica", precioCLP: 490000,
        medidas: "", peso: "",
        img: { ambiente: "assets/piezas/16_ambiente.jpg", real: "assets/piezas/16_real.jpg", probador: "assets/piezas/probador/16.png" },
        titulo: { es: "Estandarte", fr: "Étendard", en: "Standard" },
        forma: { es: "Trapecio sobre una forma de estandarte en punta", fr: "Trapèze au dessus d'une forme d'étendard en pointe", en: "Trapezoid above a pointed banner shape" },
        resumen: { es: "Una piedra en forma de trapecio sobre otra que se alarga y termina en punta, como un estandarte, con vetas rosa y blancas.", fr: "Une pierre en forme de trapèze au dessus d'une autre qui s'allonge et finit en pointe, comme un étendard, aux veines roses et blanches.", en: "A trapezoid stone above another that lengthens to a point, like a banner, with pink and white veins." },
        historia1: { es: "Su silueta alargada estiliza el cuello y acompaña escotes en V con elegancia.", fr: "Sa silhouette allongée affine le cou et accompagne avec élégance les décolletés en V.", en: "Its elongated silhouette lengthens the neck and elegantly accompanies V necklines." },
        historia2: { es: "Las vetas en zigzag recorren la piedra de arriba abajo, como un mensaje bordado.", fr: "Les veines en zigzag parcourent la pierre de haut en bas, comme un message brodé.", en: "Zigzag veins run down the stone like an embroidered message." }
    },
    {
        id: "17", code: "XVII", coleccion: "vetas", tipo: "aros", categoria: "organica", precioCLP: 330000,
        medidas: "", peso: "",
        img: { ambiente: "assets/piezas/17_ambiente.jpg", real: "assets/piezas/17_real.jpg", probador: "assets/piezas/probador/17.png" },
        titulo: { es: "Lágrima Suspendida", fr: "Larme Suspendue", en: "Suspended Tear" },
        forma: { es: "Par de aros: gota de piedra dentro de un marco de gota", fr: "Paire de boucles : goutte de pierre dans un cadre en goutte", en: "Pair of earrings: a stone drop inside a drop frame" },
        resumen: { es: "Un marco de plata en forma de gota sostiene en su base una piedra con la misma forma, de bandas miel y rosa pálido.", fr: "Un cadre d'argent en forme de goutte porte à sa base une pierre de même forme, aux bandes miel et rose pâle.", en: "A drop shaped silver frame holds at its base a stone of the same shape, with honey and pale pink bands." },
        historia1: { es: "La gota de piedra parece detenida justo antes de caer.", fr: "La goutte de pierre semble arrêtée juste avant de tomber.", en: "The stone drop seems held just before it falls." },
        historia2: { es: "Ligeros y luminosos, son aros para llevar todos los días con distinción.", fr: "Légères et lumineuses, ce sont des boucles à porter chaque jour avec distinction.", en: "Light and luminous, earrings to wear every day with distinction." }
    },
    {
        id: "18", code: "XVIII", coleccion: "vetas", tipo: "colgante", categoria: "organica", precioCLP: 480000,
        medidas: "", peso: "",
        img: { ambiente: "assets/piezas/18_ambiente.jpg", real: "assets/piezas/18_real.jpg", probador: "assets/piezas/probador/18.png" },
        titulo: { es: "Rocío", fr: "Rosée", en: "Dew" },
        forma: { es: "Dos gotas, la menor sobre la mayor", fr: "Deux gouttes, la petite au dessus de la grande", en: "Two drops, the smaller above the larger" },
        resumen: { es: "Dos rodocrositas en forma de gota, rosa con ondas claras, unidas por una pequeña bisagra de plata.", fr: "Deux rhodochrosites en forme de goutte, roses aux ondes claires, reliées par une petite charnière d'argent.", en: "Two drop shaped rhodochrosites, pink with light waves, joined by a small silver hinge." },
        historia1: { es: "Como dos gotas de rocío que resbalan por una hoja al amanecer en los cerros.", fr: "Comme deux gouttes de rosée glissant sur une feuille à l'aube sur les collines.", en: "Like two dewdrops sliding down a leaf at dawn on the hills." },
        historia2: { es: "Las ondas de la piedra mayor siguen la curva de la gota, como si el agua aún se moviera.", fr: "Les ondes de la grande pierre suivent la courbe de la goutte, comme si l'eau bougeait encore.", en: "The waves in the larger stone follow the drop's curve, as if the water were still moving." }
    },
    {
        id: "19", code: "XIX", coleccion: "vetas", tipo: "colgante", categoria: "geometrica", precioCLP: 490000,
        medidas: "", peso: "",
        img: { ambiente: "assets/piezas/19_ambiente.jpg", real: "assets/piezas/19_real.jpg", probador: "assets/piezas/probador/19.png" },
        titulo: { es: "Escudo Andino", fr: "Bouclier Andin", en: "Andean Shield" },
        forma: { es: "Cuadrado sobre un escudo que termina en punta", fr: "Carré au dessus d'un bouclier en pointe", en: "Square above a pointed shield" },
        resumen: { es: "Un cuadrado de rodocrosita sobre una piedra que se abre hacia abajo y termina en punta, como un escudo, con vetas rosa y blancas.", fr: "Un carré de rhodochrosite au dessus d'une pierre qui s'ouvre vers le bas et finit en pointe, comme un bouclier, aux veines roses et blanches.", en: "A square of rhodochrosite above a stone that opens downward to a point, like a shield, with pink and white veins." },
        historia1: { es: "La rodocrosita es la piedra nacional de Argentina y se extrae en los Andes: esta pieza le rinde homenaje a la cordillera.", fr: "La rhodochrosite est la pierre nationale de l'Argentine et provient des Andes : cette pièce rend hommage à la cordillère.", en: "Rhodochrosite is Argentina's national stone and is mined in the Andes: this piece pays tribute to the mountains." },
        historia2: { es: "Fuerte y protectora, es una pieza con presencia.", fr: "Forte et protectrice, c'est une pièce qui a de la présence.", en: "Strong and protective, it is a piece with presence." }
    },
    {
        id: "20", code: "XX", coleccion: "vetas", tipo: "aros", categoria: "geometrica", precioCLP: 310000,
        medidas: "", peso: "",
        img: { ambiente: "assets/piezas/20_ambiente.jpg", real: "assets/piezas/20_real.jpg", probador: "assets/piezas/probador/20.png" },
        titulo: { es: "Rombos del Sur", fr: "Losanges du Sud", en: "Southern Diamonds" },
        forma: { es: "Par de aros en forma de rombo", fr: "Paire de boucles en forme de losange", en: "Pair of diamond shaped earrings" },
        resumen: { es: "Un par de aros con rodocrosita en forma de rombo de lados levemente curvos, en tonos rosa viejo y tierra.", fr: "Une paire de boucles en rhodochrosite en forme de losange aux côtés légèrement courbes, en tons vieux rose et terre.", en: "A pair of rhodochrosite earrings shaped as diamonds with slightly curved sides, in dusty rose and earth tones." },
        historia1: { es: "El rombo es la forma de las cartas de navegación y de los tejidos andinos: una geometría antigua y precisa.", fr: "Le losange est la forme des cartes marines et des tissages andins : une géométrie ancienne et précise.", en: "The diamond is the shape of navigation charts and Andean weaving: an ancient, precise geometry." },
        historia2: { es: "Cuelgan de una argolla y un gancho largo que acompañan el movimiento.", fr: "Elles pendent d'un anneau et d'un long crochet qui accompagnent le mouvement.", en: "They hang from a ring and a long hook that follow every movement." }
    },
    {
        id: "21", code: "XXI", coleccion: "vetas", tipo: "aros", categoria: "orbital", precioCLP: 330000,
        medidas: "", peso: "",
        img: { ambiente: "assets/piezas/21_ambiente.jpg", real: "assets/piezas/21_real.jpg", probador: "assets/piezas/probador/21.png" },
        titulo: { es: "Péndulo de Luna", fr: "Pendule de Lune", en: "Moon Pendulum" },
        forma: { es: "Par de aros: círculo de piedra en un marco de gota", fr: "Paire de boucles : cercle de pierre dans un cadre en goutte", en: "Pair of earrings: a stone circle in a drop frame" },
        resumen: { es: "Un marco de plata en forma de gota sostiene en su base una rodocrosita redonda de rosa profundo.", fr: "Un cadre d'argent en forme de goutte porte à sa base une rhodochrosite ronde d'un rose profond.", en: "A drop shaped silver frame holds at its base a round rhodochrosite of deep pink." },
        historia1: { es: "La piedra descansa como un péndulo detenido en su punto más bajo, el instante de calma de cada oscilación.", fr: "La pierre repose comme un pendule arrêté à son point le plus bas, l'instant de calme de chaque oscillation.", en: "The stone rests like a pendulum stopped at its lowest point, the calm instant of every swing." },
        historia2: { es: "Acompañan con armonía a los colgantes circulares de la colección.", fr: "Elles accompagnent harmonieusement les pendentifs circulaires de la collection.", en: "They harmonize with the collection's circular pendants." }
    },
    {
        id: "22", code: "XXII", coleccion: "vetas", tipo: "colgante", categoria: "geometrica", precioCLP: 500000,
        medidas: "", peso: "",
        img: { ambiente: "assets/piezas/22_ambiente.jpg", real: "assets/piezas/22_real.jpg", probador: "assets/piezas/probador/22.png" },
        titulo: { es: "Tumi", fr: "Tumi", en: "Tumi" },
        forma: { es: "Cuadrado sobre una hoja que se abre en abanico", fr: "Carré au dessus d'une lame qui s'ouvre en éventail", en: "Square above a blade opening like a fan" },
        resumen: { es: "Un cuadrado de rodocrosita sobre una piedra que se abre en abanico, con la silueta del tumi, el cuchillo ceremonial andino.", fr: "Un carré de rhodochrosite au dessus d'une pierre qui s'ouvre en éventail, à la silhouette du tumi, le couteau cérémoniel andin.", en: "A square of rhodochrosite above a stone that fans open, in the silhouette of the tumi, the Andean ceremonial knife." },
        historia1: { es: "El tumi fue un símbolo de ceremonia y protección en los pueblos andinos. Aquí se vuelve joya, en plata y piedra rosa.", fr: "Le tumi fut un symbole de cérémonie et de protection chez les peuples andins. Ici il devient bijou, en argent et pierre rose.", en: "The tumi was a symbol of ceremony and protection among Andean peoples. Here it becomes jewelry, in silver and pink stone." },
        historia2: { es: "Sus vetas onduladas se abren con la forma, como si la piedra hubiera crecido para llenarla.", fr: "Ses veines ondulées s'ouvrent avec la forme, comme si la pierre avait poussé pour la remplir.", en: "Its wavy veins open with the shape, as if the stone had grown to fill it." }
    }
];

/* =============================================================================
   PÁGINA DEL ORFEBRE
   IMPORTANTE: estos datos biográficos vienen de la versión anterior del sitio y
   NO han sido verificados. Confírmalos con Jorge Ávila antes de publicar
   (año y lugar de nacimiento, oficio familiar, fechas de la trayectoria).
   Para ocultar la cronología mientras tanto: mostrarCronologia: false
   ============================================================================= */
const ORFEBRE = {
    mostrarCronologia: true,
    // La imagen anterior (assets/orfebre/manos_maestro_principal.jpg) es una imagen generada por IA
    // (lleva la marca de agua "pollinations"); no debe presentarse como las manos de Jorge.
    // Reemplazar por una fotografía real del taller o de Jorge cuando exista.
    foto: "assets/piezas/07_ambiente.jpg",
    lugar: { es: "Valparaíso, Chile", fr: "Valparaíso, Chili", en: "Valparaíso, Chile" },
    titulo: { es: "Jorge Ávila: el pulso de la plata", fr: "Jorge Ávila : le pouls de l'argent", en: "Jorge Ávila: the pulse of silver" },
    entrada: {
        es: "Décadas dedicadas al banco de orfebrería, donde el fuego del soplete y la paciencia del buril transforman la plata en arquitectura íntima.",
        fr: "Des décennies consacrées à l'établi d'orfèvre, où le feu du chalumeau et la patience du burin transforment l'argent en architecture intime.",
        en: "Decades devoted to the goldsmith's bench, where the torch's fire and the burin's patience turn silver into intimate architecture."
    },
    origenTitulo: { es: "Hijo de relojero, nieto de canteros", fr: "Fils d'horloger, petit fils de tailleurs de pierre", en: "A watchmaker's son, a stonecutter's grandson" },
    origen: [
        {
            es: "Nacido en el Cerro Alegre de Valparaíso, Jorge Ávila aprendió desde niño que la belleza duradera exige exactitud. En el taller de relojería de su padre conoció el temple del acero y el equilibrio de los péndulos; de su abuelo materno, antiguo cantero, heredó la capacidad de leer la veta interna de cada roca.",
            fr: "Né sur le Cerro Alegre de Valparaíso, Jorge Ávila a appris dès l'enfance que la beauté durable exige l'exactitude. Dans l'atelier d'horlogerie de son père, il a découvert la trempe de l'acier et l'équilibre des pendules ; de son grand père maternel, ancien tailleur de pierre, il a hérité l'art de lire la veine intérieure de chaque roche.",
            en: "Born on Cerro Alegre in Valparaíso, Jorge Ávila learned as a child that lasting beauty demands precision. In his father's watchmaking workshop he discovered tempered steel and the balance of pendulums; from his maternal grandfather, a former stonecutter, he inherited the ability to read the inner vein of every rock."
        },
        {
            es: "En su taller no hay producción en serie. Cada fragmento de rodocrosita reposa sobre su mesa hasta que sus bandas de color sugieren qué estructura de plata debe sostenerlo en el aire.",
            fr: "Dans son atelier, rien n'est produit en série. Chaque fragment de rhodochrosite repose sur sa table jusqu'à ce que ses bandes de couleur suggèrent la structure d'argent qui doit le porter dans l'air.",
            en: "Nothing in his workshop is mass produced. Each fragment of rhodochrosite rests on his table until its bands of color suggest which silver structure should hold it in the air."
        }
    ],
    cronologia: [
        { anos: "1968 · 1986", titulo: { es: "Infancia en Valparaíso", fr: "Enfance à Valparaíso", en: "Childhood in Valparaíso" },
          texto: { es: "Aprendizaje temprano entre limas de aguja y mecanismos de relojería en el taller familiar.", fr: "Apprentissage précoce entre limes aiguilles et mécanismes d'horlogerie dans l'atelier familial.", en: "Early learning among needle files and watch mechanisms in the family workshop." } },
        { anos: "1991 · 2004", titulo: { es: "Rutas mineralógicas", fr: "Routes minéralogiques", en: "Mineral routes" },
          texto: { es: "Viajes de estudio por el norte de Chile y los yacimientos trasandinos, perfeccionando el corte y pulido de la rodocrosita.", fr: "Voyages d'étude dans le nord du Chili et les gisements transandins, pour perfectionner la taille et le polissage de la rhodochrosite.", en: "Study journeys through northern Chile and the trans Andean deposits, refining the cutting and polishing of rhodochrosite." } },
        { anos: "2005 · 2019", titulo: { es: "Construcción directa", fr: "Construction directe", en: "Direct construction" },
          texto: { es: "Trabajo directo con hilo y lámina de plata, pieza por pieza.", fr: "Travail direct du fil et de la feuille d'argent, pièce par pièce.", en: "Direct work with silver wire and sheet, one piece at a time." } },
        { anos: "2026", titulo: { es: "Colección Hecha de Tiempo", fr: "Collection Hecha de Tiempo", en: "Hecha de Tiempo collection" },
          texto: { es: "Presentación de nueve obras únicas (I a IX) en plata y rodocrosita.", fr: "Présentation de neuf œuvres uniques (I à IX) en argent et rhodochrosite.", en: "Presentation of nine unique works (I to IX) in silver and rhodochrosite." } }
    ],
    pilares: [
        { etapa: { es: "Etapa I · Lapidación", fr: "Étape I · Lapidairerie", en: "Stage I · Lapidary" }, titulo: { es: "Lectura de la veta", fr: "Lecture de la veine", en: "Reading the vein" },
          texto: { es: "Se elige la zona del mineral donde las bandas blancas y rosadas presentan mayor contraste.", fr: "On choisit la zone du minéral où les bandes blanches et roses offrent le plus fort contraste.", en: "The area of the mineral with the strongest contrast between white and pink bands is chosen." } },
        { etapa: { es: "Etapa II · Fuego", fr: "Étape II · Feu", en: "Stage II · Fire" }, titulo: { es: "Plata trabajada a mano", fr: "Argent travaillé à la main", en: "Hand worked silver" },
          texto: { es: "El hilo y la lámina de plata se curvan, ajustan y sueldan a mano alrededor de cada piedra.", fr: "Le fil et la feuille d'argent sont courbés, ajustés et soudés à la main autour de chaque pierre.", en: "Silver wire and sheet are bent, fitted and soldered by hand around each stone." } },
        { etapa: { es: "Etapa III · Bruñido", fr: "Étape III · Brunissage", en: "Stage III · Burnishing" }, titulo: { es: "Acabado de galería", fr: "Finition de galerie", en: "Gallery finish" },
          texto: { es: "Cada bisel se cierra a pulso alrededor de la piedra y la plata se pule hasta el brillo espejo.", fr: "Chaque serti est refermé à la main autour de la pierre et l'argent est poli jusqu'au brillant miroir.", en: "Each bezel is closed by hand around the stone and the silver is polished to a mirror shine." } }
    ]
};

/* valores por defecto para las obras de la primera colección */
JEWELS.forEach(j => { j.coleccion = j.coleccion || "hecha"; j.tipo = j.tipo || "colgante"; });
