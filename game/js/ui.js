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
function renderStats() {
    let p = gameState.player;

    divStats.innerHTML = `
        <h2>Estadísticas</h2>
        <p><strong>Fuerza:</strong> ${p.strength}</p>
        <p><strong>Defensa:</strong> ${p.defense}</p>
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


function toggleMap() {
    if (divMap.style.display === "none") {
        divStats.style.display = "none";
        divMap.style.display = "flex";
        renderMap();
    } else {
        divStats.style.display = "block";
        divMap.style.display = "none";
    }
}

function renderMap() {
    const currentRoom = getCurrentRoom();
    const currentRoomId = currentRoom.id;
    
    // Extraemos los IDs de las salas conectadas a la actual
    const salasAccesibles = [
        currentRoom.north, 
        currentRoom.south, 
        currentRoom.east, 
        currentRoom.west
    ].filter(id => id !== null);

    // Layout lógico de la mansión
    const layout = [
        [null, 4, null],
        [7, 3, 6],
        [5, 2, 1]
    ];

    mapGrid.innerHTML = "";
    
    layout.flat().forEach(roomId => {
        const cell = document.createElement("div");
        
        if (roomId === null) {
            cell.className = "map-cell empty";
        } else {
            const room = gameState.map.rooms.find(r => r.id === roomId);
            cell.className = "map-cell";
            cell.textContent = room.name;

            if (roomId === currentRoomId) {
                // Sala actual de Luigi
                cell.classList.add("current");
            } else if (salasAccesibles.includes(roomId)) {
                // Salas a las que se puede viajar directamente
                cell.classList.add("available");
            } else {
                // Salas que existen pero no son accesibles desde aquí
                cell.classList.add("inaccessible");
            }
        }
        mapGrid.appendChild(cell);
    });
}