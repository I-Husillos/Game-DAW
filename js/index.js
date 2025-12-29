let sceneImg = document.getElementById("sceneBg");
let divStats = document.getElementById("divStacs");
let enemyImg = document.getElementById("enemyImg");
let divMessages = document.getElementById("log");
let divNombreSala = document.getElementById("nameRoom");


let btnNorth = document.getElementById("btnNorth");
let btnSouth = document.getElementById("btnSouth");
let btnEast = document.getElementById("btnEast");
let btnWest = document.getElementById("btnWest");
let btnSearchGold = document.getElementById("btnSearchGold");


// obtiene la sala actual en la que se encuentra el jugador
function getCurrentRoom(){
    // busca en el mapa la sala cuyo id coincida con el de la sala actual del jugador
    let currentRoomId = defaultGameState.player.currentRoom;

    return defaultGameState.map.rooms.find(room => room.id === currentRoomId);
}

// muestra la información de una sala en la interfaz
function showRoom(room){
    // actualiza la imagen de fondo de la escena
    sceneImg.src = room.img;

    // muestra el nombre de la sala
    divNombreSala.innerHTML = `
        <h2>${room.name}</h2>
    `;

    // añade a los mensajes la descripción y las salidas disponibles de la sala
    divMessages.innerHTML += `
        <p>${room.description}</p>
        <p>
            Salidas:
            ${room.north !== null ? " Norte" : ""}
            ${room.south !== null ? " Sur" : ""}
            ${room.east  !== null ? " Este" : ""}
            ${room.west  !== null ? " Oeste" : ""}
        </p>
    `;
}


// muestra las estadísticas del jugador
function showStats(){
    divStats.innerHTML = `
        <h2>Estadísticas</h2>
        <p><strong>Fuerza:</strong> ${defaultGameState.player.strength}</p>
        <p><strong>Defensa:</strong> ${defaultGameState.player.defense}</p>
        <p><strong>Salud:</strong> ${defaultGameState.player.health}</p>
        <p><strong>Oro:</strong> ${defaultGameState.player.gold}</p>
        <p><strong>Pociones:</strong> ${defaultGameState.player.potions}</p>
        `;
}

// muestra un enemigo en la interfaz
function showEnemy(enemy){
    // establece la imagen del enemigo y la hace visible
    enemyImg.src = enemy.img;
    enemyImg.alt = enemy.name;
    enemyImg.style.display = "block";
    
    // muestra las estadísticas del enemigo en los mensajes
    divMessages.innerHTML += `
        <h2>${enemy.name}</h2>
        <p><strong>Fuerza:</strong> ${enemy.strength}</p>
        <p><strong>Defensa:</strong> ${enemy.defence}</p>
        <p><strong>Salud:</strong> ${enemy.health}</p>
        `;
}



// mueve al jugador a una nueva sala
function movePlayer(direction){
    // obtiene la sala actual y la id de la nueva sala según la dirección
    let currentRoom = getCurrentRoom();
    let newRoomId = currentRoom[direction];

    // si no hay salida en esa dirección, muestra un mensaje y no hace nada
    if(newRoomId == null){
        addMessage("No hay salida en esa dirección");
        return;
    }

    // actualiza la sala actual del jugador
    defaultGameState.player.currentRoom = newRoomId;

    // obtiene y muestra la nueva sala
    let newRoom = getCurrentRoom();
    showRoom(newRoom);

    // limpia la imagen del enemigo anterior
    enemyImg.style.display = "none";
    enemyImg.src = "";


    // comprueba si aparece un enemigo en la nueva sala
    checkEnemy(newRoom);
}


// comprueba si aparece un enemigo en la sala
function checkEnemy(room){
    // si está el jugador en la tienda no aparecen enemigos
    if (room.isShop) {
        return;
    }

    // genera un número aleatorio para determinar si aparece un enemigo
    let probabilidad = Math.random();

    // si la probabilidad es menor que la establecida en la sala, aparece un enemigo normal
    if(probabilidad < room.monsterProb){
        spawnEnemy();
    // si la probabilidad es muy baja, aparece el jefe
    } else if (probabilidad < 0.02){
        spawnBoss();
    }
}

// hace aparecer un enemigo aleatorio (que no sea jefe)
function spawnEnemy(){
    // filtra los enemigos que no son jefes
    let enemies = defaultGameState.map.enemies.filter(enemy => !enemy.isBoss);
    // elige un enemigo al azar de la lista filtrada
    let enemy = enemies[Math.floor(Math.random() * enemies.length)];

    // muestra el enemigo y un mensaje
    addMessage(`¡Ha aparecido un ${enemy.name}!`)
    showEnemy(enemy);
}

// hace aparecer al jefe final
function spawnBoss(){
    // busca al enemigo que está marcado como jefe
    let boss = defaultGameState.map.enemies.find(enemy => enemy.isBoss === true);

    // muestra al jefe y un mensaje especial
    showEnemy(boss);
    addMessage("¡HAS DESPERTADO AL JEFE FINAL!");
}

// permite al jugador buscar oro en la sala actual
function searchGold(){
    // obtiene la sala actual
    let currentRoom = getCurrentRoom();

    // si la sala no tiene probabilidad de monstruos, se asume que no hay nada que buscar
    if(currentRoom.monsterProb <= 0){
        addMessage("No parece haber nada de valor aquí.");
        return;
    }

    // calcula una cantidad aleatoria de oro encontrado (entre 0 y 10)
    let goldFound = Math.floor(Math.random() * 11);

    // si se encuentra oro, se añade al jugador y se muestra un mensaje
    if(goldFound > 0){
        defaultGameState.player.gold += goldFound;
        addMessage(`Has encontrado ${goldFound} oro!`);
    // si no se encuentra oro, se informa al jugador
    } else {
        addMessage("Buscas durante un rato, pero no encuentras nada.");
    }

    // actualiza las estadísticas para reflejar el posible cambio en el oro
    showStats();
}

// añade un mensaje al panel de mensajes y hace scroll hacia abajo
function addMessage(text) {
    divMessages.innerHTML += `<p>${text}</p>`;
    divMessages.scrollTop = divMessages.scrollHeight;
}

// añade los eventos de click a los botones de movimiento
btnNorth.addEventListener("click", () => movePlayer("north"));
btnSouth.addEventListener("click", () => movePlayer("south"));
btnEast.addEventListener("click",  () => movePlayer("east"));
btnWest.addEventListener("click",  () => movePlayer("west"));

// añade el evento de click al botón de buscar oro
btnSearchGold.addEventListener("click", () => searchGold());

// cuando la página se carga completamente, se muestra la sala inicial y las estadísticas del jugador
window.addEventListener("load", () => {
    showRoom(getCurrentRoom());
    showStats();
});