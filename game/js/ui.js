// obtención de elementos del DOM para interactuar con la interfaz
let sceneImg     = document.getElementById("sceneBg");
let enemyImg     = document.getElementById("enemyImg");
let professorrImg= document.getElementById("professorrImg");
let divRoomName  = document.getElementById("nameRoom");
let divStats     = document.getElementById("divStacs");
let divMessages  = document.getElementById("log");
let messagesContainer = document.getElementById("divMessages");


// obtención de los botones para asignarles eventos
let btnNorth  = document.getElementById("btnNorth");
let btnSouth  = document.getElementById("btnSouth");
let btnEast   = document.getElementById("btnEast");
let btnWest   = document.getElementById("btnWest");
let btnSearch = document.getElementById("btnSearchGold");
let btnPotion = document.getElementById("btnPotion");
let btnBuyPotion = document.getElementById("btnBuyPotion");
let btnBuyShield = document.getElementById("btnBuyShield");
let btnAttack = document.getElementById("btnAttack");
let btnHelp = document.getElementById("btnHelp");


let divMap = document.getElementById("divMap");
let mapGrid = document.getElementById("mapGrid");
let btnMap = document.getElementById("btnMap");



// escribe un mensaje en el registro de eventos del juego
function writeLog(text) {
    let p = document.createElement("p");
    p.textContent = text;
    divMessages.appendChild(p);
    // hace scroll automáticamente para mostrar el último mensaje
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// actualiza la imagen y el nombre de la habitación en la interfaz
function renderRoom(room) {
    sceneImg.src = room.img;
    sceneImg.alt = room.name;

    divRoomName.innerHTML = `<h2>${room.name}</h2>`;

    writeLog(room.description);
    renderExits(room);
}

// muestra las estadísticas actuales del jugador
// muestra las estadísticas actuales del jugador incluyendo los bonus de equipo
function renderStats() {
    let p = gameState.player;

    divStats.innerHTML = `
        <h2>Estadísticas</h2>
        <p><strong>Fuerza:</strong> ${p.strength} <span style="color: #00ff00;">(+${p.strengthBonus})</span></p>
        <p><strong>Defensa:</strong> ${p.defense} <span style="color: #00ff00;">(+${p.defenseBonus})</span></p>
        <p><strong>Vida:</strong> ${p.health}</p>
        <p><strong>Oro:</strong> ${p.gold}</p>
        <p><strong>Pociones:</strong> ${p.potions}</p>
    `;
}

// indica al jugador las salidas disponibles en la habitación actual
function renderExits(room) {
    let exits = [];

    // comprueba cada dirección y la añade si existe una salida
    if (room.north !== null) exits.push("Norte");
    if (room.south !== null) exits.push("Sur");
    if (room.east  !== null) exits.push("Este");
    if (room.west  !== null) exits.push("Oeste");

    writeLog(`Salidas disponibles: ${exits.join(", ")}`);
}

// muestra la imagen del enemigo en la escena
function renderEnemy(enemy) {
    enemyImg.src = enemy.img;
    enemyImg.alt = enemy.name;
    enemyImg.style.display = "block";
}

// oculta la imagen del enemigo
function clearEnemy() {
    enemyImg.style.display = "none";
    enemyImg.src = "";
}

function showHelp() {
    writeLog("--- GUÍA DE JUEGO ---");
    writeLog("> EXPLORACIÓN: Usa Norte/Sur/Este/Oeste para moverte.");
    writeLog("> COMBATE: Pulsa 'Atacar' para golpear. El combate es por turnos.");
    writeLog("> SUPERVIVENCIA: 'Buscar' para encontrar oro en cada habitación. Y con este te permite 'Comprar' pociones y mejoras en la tienda.");
    writeLog("> ¡Cuidado! Si tu vida llega a 0, perderás todo.");
}

function toggleControls(enCombate) {
    btnAttack.disabled = !enCombate;
    btnNorth.disabled = enCombate;
    btnSouth.disabled = enCombate;
    btnEast.disabled = enCombate;
    btnWest.disabled = enCombate;
    btnSearch.disabled = enCombate; // Te faltaba bloquear este
}


/**
 * Alterna la visibilidad entre la ficha de estadísticas y el mapa de la mansión.
 * Funciona como un interruptor (ON/OFF).
 */
function toggleMap() {
    // Verificamos si el contenedor del mapa está oculto actualmente
    if (divMap.style.display === "none") {
        // Si está oculto: escondemos las estadísticas y mostramos el mapa
        divStats.style.display = "none";
        divMap.style.display = "flex"; // Usamos flex para mantener la alineación interna
        
        // Llamamos a la función que dibuja el mapa actualizado
        renderMap();
    } else {
        // Si ya era visible: hacemos el proceso inverso para volver a la ficha del personaje
        divStats.style.display = "block";
        divMap.style.display = "none";
    }
}

/**
 * Genera y dibuja visualmente el mapa en el DOM basándose en la posición actual del jugador.
 */
function renderMap() {
    // 1. Obtenemos la información de la sala donde está Luigi actualmente
    const currentRoom = getCurrentRoom();
    const currentRoomId = currentRoom.id;
    
    // 2. Creamos una lista de IDs de las salas que están conectadas directamente (Norte, Sur, Este, Oeste)
    // Usamos .filter para eliminar los valores 'null' (direcciones sin salida)
    const salasAccesibles = [
        currentRoom.north, 
        currentRoom.south, 
        currentRoom.east, 
        currentRoom.west
    ].filter(id => id !== null);

    // 3. Definimos la estructura física de la mansión en una matriz (3x3)
    // Esto determina qué sala va en cada posición visual de la cuadrícula
    const layout = [
        [null, 4, null], // Fila superior
        [7, 3, 6],       // Fila central (6 es Este de 3, 7 es Oeste de 3)
        [5, 2, 1]        // Fila inferior (1 es Oeste de 2, 5 es Este de 2)
    ];

    // 4. Limpiamos el contenido anterior del mapa para dibujarlo desde cero
    mapGrid.innerHTML = "";
    
    // 5. Convertimos la matriz en una lista plana (.flat) y la recorremos para crear cada celda
    layout.flat().forEach(roomId => {
        // Creamos un nuevo elemento div para representar la celda en el HTML
        const cell = document.createElement("div");
        
        // Si el valor en el layout es null, creamos un espacio vacío decorativo
        if (roomId === null) {
            cell.className = "map-cell empty";
        } else {
            // Buscamos los datos de la sala correspondiente en el archivo map.js
            const room = gameState.map.rooms.find(r => r.id === roomId);
            
            // Aplicamos la clase base y le asignamos el nombre de la sala como texto
            cell.className = "map-cell";
            cell.textContent = room.name;

            // 6. Lógica de colores (clases CSS) según el estado de la sala:
            if (roomId === currentRoomId) {
                // Si es la sala actual del jugador, la resaltamos (ej: color neón sólido)
                cell.classList.add("current");
            } else if (salasAccesibles.includes(roomId)) {
                // Si es una sala vecina a la que podemos ir, le damos un estilo de "disponible"
                cell.classList.add("available");
            } else {
                // Si la sala existe pero no podemos llegar a ella desde aquí, se muestra "apagada"
                cell.classList.add("inaccessible");
            }
        }
        
        // 7. Finalmente, añadimos la celda terminada al contenedor del grid en el HTML
        mapGrid.appendChild(cell);
    });
}