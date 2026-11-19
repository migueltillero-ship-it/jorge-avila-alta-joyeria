## Versión 3 · Nueva colección "Vetas del Sur" y experiencia 3D (noviembre de 2026)
- Trece obras nuevas (X a XXII): ocho colgantes y cinco pares de aros, con nombre, historia en español, francés e inglés y precio PROVISORIO (revisar en js/catalog.js).
- Portada: anuncio de la nueva colección bajo el video principal. Nueva sección "Lo nuevo" (#nuevo) y filtro por colección en el catálogo.
- Cada una de las 22 obras tiene ahora:
  · un modelo 3D (assets/3d/NN.glb) que se gira, acerca y aleja en su ficha;
  · una presentación en video sobre fondo negro (assets/3d/NN.mp4), obligatoria la primera vez que se abre la obra; después aparece "Saltar". Se desvanece y deja la ficha con la historia y el modelo 3D;
  · las obras nuevas, además, su imagen de campaña sobre terciopelo azul (renderizada desde el modelo, por eso respeta la forma exacta).
- Cómo se hizo el 3D (fiel por construcción): el contorno de cada piedra sale de la foto real y conserva su textura real; la plata se reconstruye desde el eje medio de la foto; el engaste sigue el contorno exacto. El programa compara la silueta 3D con la foto (informe.json, campo iou_contorno) y corrige el grosor de la plata hasta que coinciden. Lo único aproximado es la profundidad, que una foto frontal no muestra.
- Medidas usadas (aproximadas, cambiar en herramientas si Jorge da las reales): colgantes 38 a 45 mm de alto con argolla; aros 40 mm con gancho.
- Herramientas locales: INSTALAR.ps1 (diagnóstico, instalación, verificación y vista previa) y herramientas/NUEVA_PIEZA.ps1 (agrega una joya nueva desde una foto, con su 3D, video e imagen de campaña).
- Las fotos de las piezas nuevas son capturas de WhatsApp de baja resolución: con fotos originales del teléfono (o mejor, con luz difusa y fondo blanco) la textura de las piedras será más nítida.

# Sitio v2 · Jorge Ávila · Hecha de Tiempo

## Qué se corrigió
- Cada ficha muestra ahora la imagen de su propia pieza. Antes, las fichas II, III, IV, V, VIII y IX mezclaban la foto de una pieza con el nombre y el probador de otra.
- Se eliminó la "Constelación del Sur": su foto era un colgante de tres rombos que no existe en la colección.
- Se añadió la Órbita Interior (VIII), que faltaba. Se muestra con su fotografía real hasta que exista su imagen de campaña.
- Cada ficha incluye la fotografía real de la pieza (en tono plata corregido) junto a la imagen de campaña.
- Se retiraron los datos no confirmados: pesos, medidas, "plata ley 950", "sin soldaduras" y "cabujón" (las piedras son planas).
- La foto de "las manos del maestro" era una imagen generada por IA (marca de agua "pollinations"); se reemplazó por una foto de la colección.
- css/styles.css estaba vacío (3 bytes) y orfebre.html tenía los enlaces rotos (formato de chat dentro de href). Ambos rehechos.
- El sitio ya no depende de archivos sueltos de versiones anteriores: todo vive en index.html, css/styles.css, js/catalog.js y js/app.js.
- Las páginas antiguas (coleccion.html, joya.html?id=…, etc.) redirigen a la nueva para no romper enlaces.
- Probador: funciona con cámara o con una foto subida, con recortes de fondo transparente hechos desde las fotos reales.
- Tasa del dólar actualizada a ~970 CLP (noviembre de 2026) y marcada como referencial.
- supabase/schema.sql alineado con los precios del sitio (antes había 4 precios distintos).

## Videos (assets/video)
- Presentación inicial: joya.mp4 completo (15 s) con la narración "Cada veta rosa guarda millones de años. Plata tallada a mano que abraza la piedra. Una joya única, como tú." Se abre al entrar por la portada, una vez por sesión, con el botón "Entrar con sonido" (los navegadores no permiten sonido sin un clic). La primera visita la ve entera; desde la segunda aparece "Saltar". Se puede desactivar la obligación con `introObligatoria: false` en js/catalog.js.
- Cada sección abre con su propio video vertical, en silencio, en bucle y con botón de sonido: Portada (joya), Catálogo (joyas_3, 2,6 a 9,3 s), Probador (joyas_2, 2,0 a 6,8 s), Adquisición (joyas_2, 7,0 a 8,8 s, el juego completo) y El orfebre (joyas_2, 11 a 13 s, manos con guantes).
- Los recortes evitan los tramos donde los videos muestran joyas que no existen en la colección. Ojo: joya.mp4 completo sí incluye algunos (7 a 8 s un colgante triangular con piedra roja que no existe; 11 a 14 s piezas mezcladas). Se dejó entero porque así se pidió.
- Se descartaron: Alto_impacto (marca de agua "Dola AI", estilo neón y un colgante cuadrado que no existe), Video_Publicitario (igual a joya.mp4, con marca de agua) y Video_de_Joyas_de_Lujo_4K1 (igual a joyas_3, con marca de agua y en realidad 720p).
- Todos los videos son verticales: se recortaron las franjas negras laterales y se recodificaron en H.264 para que funcionen en cualquier navegador (5,4 MB en total).
- Con "reducir movimiento" activado en el sistema, los videos no se reproducen solos: se ven como imagen y se activan con un clic.
- La Órbita Interior (VIII) ya no aparece en el friso de la portada (su foto no comparte el fondo azul). Sigue a la venta en el Catálogo. Para mostrarla de nuevo: quitar `portada: false` en js/catalog.js.

## Pendiente de confirmar con Jorge (no publicar sin revisar)
1. Ley de la plata. Si está certificada como 950, cambiar `metal` en js/catalog.js.
2. Medidas y peso reales de cada pieza (campos `medidas` y `peso`).
3. Biografía: año y lugar de nacimiento, oficio del padre y del abuelo, fechas de la trayectoria (objeto `ORFEBRE`). Para ocultar la cronología: `mostrarCronologia: false`.
4. Una fotografía real de Jorge o de su taller (campo `ORFEBRE.foto`).
5. Precios y bonificaciones (10 % y 18 %).

## Diferencias menores entre imágenes de campaña y piezas reales
Las imágenes de campaña fueron generadas por IA y conservan bien la forma general, pero hay detalles distintos:
VII Voluta (el asa real es una argolla acanalada, no triangular), IV Campana (marco algo inclinado) y III Vértice Andino (unión del rombo superior).
Por eso cada ficha muestra también la fotografía real. Para reemplazarlas por las imágenes de terciopelo:
`.\ACTUALIZAR.ps1 -UsarTerciopelo` (después de revisarlas una por una).

## Archivos que ya no se usan
js/i18n.js, js/bg3d.js, assets/macro, assets/fondos y assets/joyas. Pueden borrarse cuando quieras; el sitio nuevo no los necesita.
