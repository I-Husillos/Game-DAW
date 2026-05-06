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
    
    let currentRoomId = gameState.player.currentRoom;

    return gameState.map.rooms.find(room => room.id === currentRoomId);
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
    
    if(enemyImg.style.display === "block") {
        writeLog("No puedes huir, ¡hay un enemigo frente a ti!");
        return;
    }

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
    clearEnemy();
    renderRoom(newRoom);
    handleRoomEnter(newRoom);
}

// gestiona los eventos que ocurren al entrar en una habitación
function handleRoomEnter(room) {
    professorrImg.style.display = "none";

    // si es una tienda, no aparecen monstruos
    if (room.isShop) {
        writeLog("Te encuentras en una zona segura.");

        professorrImg.src = gameState.map.character[0].img;
        professorrImg.alt = "Professor";
        professorrImg.style.display = "block";

        return;
    }

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
    let enemigoSeleccionado = enemies[Math.floor(Math.random() * enemies.length)];

    renderEnemy(enemigoSeleccionado);
    writeLog(`¡Un ${enemigoSeleccionado.name} aparece!`);
    iniciarCombate(enemigoSeleccionado);
}

// hace aparecer al jefe final
function spawnBoss() {
    let jefeFinal = gameState.map.enemies.find(e => e.isBoss);

    renderEnemy(jefeFinal);
    writeLog("¡HAS DESPERTADO AL JEFE FINAL!");
    iniciarCombate(jefeFinal);
}

// permite al jugador buscar oro en la habitación
function searchGold() {
    let room = getCurrentRoom();

    // comprueba si ya se ha buscado oro en la habitación
    if (room.goldSearched) {
        writeLog("Aquí ya no queda nada de valor.");
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

function iniciarCombate(enemigoSeleccionado) {
    let p = gameState.player;
    // Clonamos el enemigo para no mutar datos persistentes de map.js
    let enemigoTemporal = {
        ...enemigoSeleccionado,
        health: enemigoSeleccionado.health
    };
    
    writeLog(`--- INICIA EL COMBATE CONTRA ${enemigoTemporal.name.toUpperCase()} ---`);

    while (p.health > 0 && enemigoTemporal.health > 0) {
        
        // ATAQUE DEL MONSTRUO
        let aleatorioM = Math.floor(Math.random() * 10) + 1;
        let dañoAlHeroe = Math.max(0, (enemigoTemporal.strength + aleatorioM) - (p.defense + p.defenseBonus));
        
        if (dañoAlHeroe > 0) {
            p.health -= dañoAlHeroe;
            writeLog(`${enemigoTemporal.name} te ataca y te quita ${dañoAlHeroe} de vida.`);
        } else {
            writeLog(`${enemigoTemporal.name} ataca, ¡pero tu defensa lo bloquea!`);
        }

        // Comprobamos si el héroe ha muerto tras el golpe
        if (p.health <= 0) {
            p.health = 0; // Evitamos valores negativos en la UI
            renderStats(); // Actualizamos visualmente
            gestionarMuerteJugador();
            return; // Salimos de la función de combate
        }

        // ATAQUE DEL HÉROE
        let aleatorioH = Math.floor(Math.random() * 10) + 1;
        let dañoAlMonstruo = Math.max(0, (p.strength + p.strengthBonus + aleatorioH) - enemigoTemporal.defence);
        
        if (dañoAlMonstruo > 0) {
            enemigoTemporal.health -= dañoAlMonstruo;
            writeLog(`Atacas al ${enemigoTemporal.name} y le causas ${dañoAlMonstruo} de daño.`);
        } else {
            writeLog(`Tu ataque no logra penetrar la piel del ${enemigoTemporal.name}.`);
        }

        // Comprobamos si el monstruo ha muerto
        if (enemigoTemporal.health <= 0) {
            writeLog(`¡Has derrotado al ${enemigoTemporal.name}!`);
            clearEnemy();
            gestionarRecompensa();
        }
    }
    renderStats();
}

function gestionarRecompensa() {
    // 40% de probabilidad de encontrar algo[cite: 5]
    if (Math.random() <= 0.40) {
        let bonificador = Math.floor(Math.random() * 10) + 1; // Valor entre 1 y 10[cite: 5, 6]
        
        // 50% probabilidad: menor a 0.5 es espada, mayor es escudo[cite: 5]
        if (Math.random() < 0.5) {
            writeLog(`¡Encuentras una espada con bonus +${bonificador}!`);
            if (bonificador > gameState.player.strengthBonus) {
                gameState.player.strengthBonus = bonificador;
                writeLog("Es mejor que tu arma actual. ¡Equipada!");
            } else {
                writeLog("Es de peor calidad que la tuya. La desechas.");
            }
        } else {
            writeLog(`¡Encuentras un escudo con bonus +${bonificador}!`);
            if (bonificador > gameState.player.defenseBonus) {
                gameState.player.defenseBonus = bonificador;
                writeLog("Es mejor que tu escudo actual. ¡Equipado!");
            } else {
                writeLog("Es de peor calidad que el tuyo.");
            }
        }
    }
}


function gestionarMuerteJugador() {
    writeLog("HAS MUERTO");
    writeLog("Pierdes todo tu oro, pociones y equipo. Vuelves a la entrada.");

    // Reseteo de estadísticas al estado base[cite: 5]
    let p = gameState.player;
    p.health = 100;
    p.gold = 0;
    p.potions = 0;
    p.strengthBonus = 0;
    p.defenseBonus = 0;
    p.currentRoom = 1; // Volver a la sala 1[cite: 5]

    // Actualizar interfaz y cargar sala inicial[cite: 2]
    renderStats();
    renderRoom(getCurrentRoom());
    clearEnemy();
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