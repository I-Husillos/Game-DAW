// el objeto gameState es la única fuente de verdad para el estado actual del juego
// se inicializa con los datos de defaultGameState del fichero map.js
let gameState = defaultGameState;

let enemigoTemporal = null;

// devuelve el objeto completo de la habitación actual del jugador
// para ello, busca en el array map.rooms utilizando el ID de la habitación guardado en el estado del jugador
function getCurrentRoom() {
    
    let currentRoomId = gameState.player.currentRoom;

    return gameState.map.rooms.find(room => room.id === currentRoomId);
}
