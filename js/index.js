// estado inicial del juego, que se carga desde el fichero map.js
let gameState = defaultGameState;

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
let btnBuy    = document.getElementById("btnBuy");

// devuelve la información de la habitación actual del jugador
function getCurrentRoom() {
    
    let currentRoomId = defaultGameState.player.currentRoom;

    return defaultGameState.map.rooms.find(room => room.id === currentRoomId);
}

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

// gestiona el movimiento del jugador entre habitaciones
function movePlayer(direction) {
    let room = getCurrentRoom();
    // obtiene el id de la siguiente habitación según la dirección
    let nextRoomId = room[direction];

    // si no hay salida, informa al jugador
    if (nextRoomId === null) {
        writeLog("No hay salida en esa dirección.");
        return;
    }

    // actualiza la habitación actual del jugador
    gameState.player.currentRoom = nextRoomId;

    // renderiza la nueva habitación y gestiona los eventos de entrada
    let newRoom = getCurrentRoom();
    newRoom.goldSearched = false;
    clearEnemy();
    renderRoom(newRoom);
    handleRoomEnter(newRoom);
}

// gestiona los eventos que ocurren al entrar en una habitación
function handleRoomEnter(room) {
    // si es una tienda, no aparecen monstruos
    if (room.isShop) {
        writeLog("Te encuentras en una zona segura.");

        professorrImg.src = gameState.map.character[0].img;
        professorrImg.alt = "Professor";
        professorrImg.style.display = "block";

        return;
    }

    // Si no es una tienda, oculta al profesor.
    professorrImg.style.display = "none";

    // genera un número aleatorio para determinar si aparece un enemigo
    let roll = Math.random();

    // probabilidad de que aparezca el jefe final 2%
    if (roll < 0.02) {
        spawnBoss();
    // probabilidad de que aparezca un enemigo normal
    } else if (roll < room.monsterProb) {
        spawnEnemy();
    }
}

// hace aparecer un enemigo normal de forma aleatoria
function spawnEnemy() {
    // filtra los enemigos que no son jefes
    let enemies = gameState.map.enemies.filter(e => !e.isBoss);
    // selecciona un enemigo al azar
    let enemy = enemies[Math.floor(Math.random() * enemies.length)];

    renderEnemy(enemy);
    writeLog(`¡Un ${enemy.name} aparece!`);
}

// hace aparecer al jefe final
function spawnBoss() {
    let boss = gameState.map.enemies.find(e => e.isBoss);

    renderEnemy(boss);
    writeLog("¡HAS DESPERTADO AL JEFE FINAL!");
}

// permite al jugador buscar oro en la habitación
function searchGold() {
    let room = getCurrentRoom();

    // comprueba si ya se ha buscado oro en la habitación
    if (room.goldSearched) {
        writeLog("Aquí ya no queda nada de valor.");
        return;
    } else if (room.isShop){
        writeLog("Aquí no puedes buscar.");
        return;
    }

    // marca la habitación como registrada
    room.goldSearched = true;

    // otorga una cantidad aleatoria de oro al jugador
    let gold = Math.floor(Math.random() * 11) + 5;
    gameState.player.gold += gold;

    writeLog(`Encuentras ${gold} monedas de oro.`);
    renderStats();
}

// permite al jugador usar una poción para recuperar salud
function usePotion() {
    let p = gameState.player;

    if (p.potions <= 0) {
        writeLog("No te quedan pociones.");
        return;
    }

    p.potions--;
    // recupera 25 de vida, sin superar el máximo de 100
    p.health = Math.min(100, p.health + 25);

    writeLog("Usas una poción y recuperas salud.");
    renderStats();
}

// permite al jugador comprar una poción en una tienda
function buyPotion() {
    let room = getCurrentRoom();
    let p = gameState.player;

    if (!room.isShop) {
        writeLog("Aquí no puedes comprar.");
        return;
    }

    if (p.gold < 20) {
        writeLog("No tienes suficiente oro.");
        return;
    }

    p.gold -= 20;
    p.potions++;

    writeLog("Compras una poción.");
    renderStats();
}

// asigna la función de movimiento a los botones de dirección
btnNorth.addEventListener("click", () => movePlayer("north"));
btnSouth.addEventListener("click", () => movePlayer("south"));
btnEast.addEventListener("click",  () => movePlayer("east"));
btnWest.addEventListener("click",  () => movePlayer("west"));

// asigna las funciones correspondientes a los botones de acción
btnSearch.addEventListener("click", searchGold);
btnPotion.addEventListener("click", usePotion);
btnBuy.addEventListener("click", buyPotion);

// se ejecuta cuando la página ha cargado completamente
window.addEventListener("load", () => {
    // renderiza la habitación inicial y las estadísticas del jugador
    renderRoom(getCurrentRoom());
    renderStats();
    writeLog("Bienvenido a la Mansión Encantada");
});