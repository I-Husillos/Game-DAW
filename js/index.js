let sceneImg = document.getElementById("sceneBg");
let divStats = document.getElementById("divStacs");
let enemyImg = document.getElementById("enemyImg");
let divMessages = document.getElementById("log");
let divNombreSala = document.getElementById("nameRoom");


let btnNorth = document.getElementById("btnNorth");
let btnSouth = document.getElementById("btnSouth");
let btnEast = document.getElementById("btnEast");
let btnWest = document.getElementById("btnWest");


function getCurrentRoom(){
    let currentRoomId = defaultGameState.player.currentRoom;

    return defaultGameState.map.rooms.find(room => room.id === currentRoomId);
}

function showRoom(room){
    sceneImg.src = room.img;

    divNombreSala.innerHTML = `
        <h2>${room.name}</h2>
    `;

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

function showEnemy(enemy){
    enemyImg.src = enemy.img;
    enemyImg.alt = enemy.name;
    enemyImg.style.display = "block";
    
    divMessages.innerHTML += `
        <h2>${enemy.name}</h2>
        <p><strong>Fuerza:</strong> ${enemy.strength}</p>
        <p><strong>Defensa:</strong> ${enemy.defence}</p>
        <p><strong>Salud:</strong> ${enemy.health}</p>
        `;
}




function movePlayer(direction){
    let currentRoom = getCurrentRoom();
    let newRoomId = currentRoom[direction];

    if(newRoomId == null){
        //añadir mensaje
        addMessage("No hay salida en esa dirección");
        return;
    }

    defaultGameState.player.currentRoom = newRoomId;

    let newRoom = getCurrentRoom();
    showRoom(newRoom);

    enemyImg.innerHTML = "";

    checkEnemy(newRoom);
}



function checkEnemy(room){
    let probabilidad = Math.random();

    if(probabilidad < room.monsterProb){
        spawnEnemy();
    } else if (probabilidad < 0.05){
        spawnBoss();
    }
}

function spawnEnemy(){
    const enemies = defaultGameState.map.enemies.filter(enemy => !enemy.isBoss);
    const enemy = enemies[Math.floor(Math.random() * enemies.length)];

    showEnemy(enemy);
    addMessage(`¡Un ${enemy.name} aparece!`)
}


function spawnBoss(){
    let boss = defaultGameState.map.enemies.find(enemy => enemy.isBoss === true);

    showEnemy(boss);
    addMessage("¡HAS DESPERTADO AL JEFE FINAL!");
}


function addMessage(text) {
    divMessages.innerHTML += `<p>${text}</p>`;
    divMessages.scrollTop = divMessages.scrollHeight;
}


btnNorth.addEventListener("click", () => movePlayer("north"));
btnSouth.addEventListener("click", () => movePlayer("south"));
btnEast.addEventListener("click",  () => movePlayer("east"));
btnWest.addEventListener("click",  () => movePlayer("west"));


window.addEventListener("load", () => {
    showRoom(getCurrentRoom());
    showStats();
});