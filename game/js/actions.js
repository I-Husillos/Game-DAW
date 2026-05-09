// gestiona el movimiento del jugador entre habitaciones
function movePlayer(direction) {
    
    if(enemyImg.style.display === "block") {
        writeLog("No puedes huir, ¡hay un enemigo frente a ti!");
        return;
    }

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
    // si es una tienda, no aparecen monstruos
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
    // probabilidad de que aparezca un enemigo normal
    } else if (roll < room.monsterProb) {
        spawnEnemy();
    }
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

function buyShield() {
    let room = getCurrentRoom();
    let p = gameState.player;

    if (!room.isShop) {
        writeLog("Aquí no puedes comprar.");
        return;
    }

    const cost = 40; // Coste de la mejora permanente
    if (p.gold < cost) {
        writeLog(`No tienes oro suficiente. La mejora de defensa cuesta ${cost} monedas.`);
        return;
    }

    p.gold -= cost;
    p.defenseBonus += 10; // Incremento permanente de +10 a la defensa

    writeLog("El Profesor mejora tu equipo con un Chaleco de Ectoplasma (+10 Defensa).");
    renderStats();
}