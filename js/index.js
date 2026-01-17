// el objeto gameState es la única fuente de verdad para el estado actual del juego
// se inicializa con los datos de defaultGameState del fichero map.js
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

// devuelve el objeto completo de la habitación actual del jugador
// para ello, busca en el array map.rooms utilizando el ID de la habitación guardado en el estado del jugador
function getCurrentRoom() {
    // obtiene el ID de la habitación donde se encuentra el jugador
    let currentRoomId = defaultGameState.player.currentRoom;

    // utiliza el método find para buscar en el array de habitaciones
    // y devolver la primera que coincida con el currentRoomId
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
    // obtiene el ID de la siguiente habitación según la dirección cardinal elegida
    // el objeto room tiene propiedades como north, south, etc, que contienen el ID de la sala contigua
    let nextRoomId = room[direction];

    // si no hay salida, informa al jugador
    if (nextRoomId === null) {
        writeLog("No hay salida en esa dirección.");
        return;
    }

    // actualiza el estado del juego cambiando la habitación actual del jugador
    gameState.player.currentRoom = nextRoomId;

    // obtiene el objeto de la nueva habitación y prepara la escena
    let newRoom = getCurrentRoom();
    // se resetea el estado de búsqueda de oro para la nueva habitación
    newRoom.goldSearched = false; 
    clearEnemy();
    renderRoom(newRoom);
    // una vez renderizada la sala, se ejecutan los eventos de entrada
    handleRoomEnter(newRoom);
}

// gestiona los eventos que ocurren al entrar en una habitación
function handleRoomEnter(room) {
    // si la habitación es una tienda, se muestra al vendedor y no hay peligro
    if (room.isShop) {
        writeLog("Te encuentras en una zona segura.");

        professorrImg.src = gameState.map.character[0].img;
        professorrImg.alt = "Professor";
        professorrImg.style.display = "block";

        return;
    }

    // si no es una tienda, oculta al profesor
    professorrImg.style.display = "none";

    // algoritmo de aparición de enemigos basado en probabilidad
    // se genera un número aleatorio entre 0 y 1
    let roll = Math.random();

    // compara el número aleatorio con las probabilidades definidas para decidir qué evento ocurre
    // hay un 2% de probabilidad de que aparezca el jefe
    if (roll < 0.02) { // Probabilidad del 2%
        spawnBoss();
    // si no aparece el jefe, hay una probabilidad monsterProb de que aparezca un enemigo normal
    } else if (roll < room.monsterProb) {
        spawnEnemy();
    }
}

// elige y muestra un enemigo común de forma aleatoria
function spawnEnemy() {
    // primero, filtra el array de enemigos para obtener solo aquellos que no son jefes
    let enemies = gameState.map.enemies.filter(e => !e.isBoss);
    // algoritmo de selección aleatoria:
    // Math.random() genera un número entre 0 y 1
    // se multiplica por la longitud del array de enemigos filtrado para obtener un índice flotante
    // Math.floor redondea hacia abajo para obtener un índice de array válido
    let enemy = enemies[Math.floor(Math.random() * enemies.length)];

    renderEnemy(enemy);
    writeLog(`¡Un ${enemy.name} aparece!`);
}

// hace aparecer al jefe final
function spawnBoss() {
    // busca específicamente al enemigo marcado como jefe
    let boss = gameState.map.enemies.find(e => e.isBoss);

    renderEnemy(boss);
    writeLog("¡HAS DESPERTADO AL JEFE FINAL!");
}

// permite al jugador buscar oro en la habitación
function searchGold() {
    let room = getCurrentRoom();

    // se usa un flag para controlar si ya se ha buscado en esta sala, para evitar que el jugador busque oro infinitamente en el mismo lugar
    if (room.goldSearched) {
        writeLog("Aquí ya no queda nada de valor.");
        return;
    } else if (room.isShop){
        writeLog("Aquí no puedes buscar.");
        return;
    }

    // se establece el flag a true para que no se pueda volver a buscar
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
    // recupera 25 de vida se usa Math.min para asegurar que la vida
    // no supere el máximo de 100, evitando así un desbordamiento de la estadística
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