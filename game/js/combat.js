// elige y muestra un enemigo común de forma aleatoria
function spawnEnemy() {
    // primero, filtra el array de enemigos para obtener solo aquellos que no son jefes
    let enemies = gameState.map.enemies.filter(e => !e.isBoss);
    // selecciona un enemigo al azar
    let enemy = enemies[Math.floor(Math.random() * enemies.length)];

    // CORRECCIÓN: Usar la variable 'enemy' correcta
    renderEnemy(enemy);
    writeLog(`¡Un ${enemy.name} aparece!`);
    iniciarCombate(enemy);
}

// hace aparecer al jefe final
function spawnBoss() {
    let boss = gameState.map.enemies.find(e => e.isBoss);

    // CORRECCIÓN: Usar la variable 'boss' correcta
    renderEnemy(boss);
    writeLog("¡HAS DESPERTADO AL JEFE FINAL!");
    iniciarCombate(boss);
}


function iniciarCombate(enemigoSeleccionado) {
    // Clonamos al enemigo para la sesión de combate actual [cite: 339]
    enemigoTemporal = { ...enemigoSeleccionado };
    
    writeLog(`--- COMBATE POR TURNOS: ${enemigoTemporal.name.toUpperCase()} ---`);
    writeLog("Pulsa el botón 'ATACAR' o escribe 'atacar' para empezar.");
    
    // Bloqueamos movimiento y activamos botón de ataque
    toggleControls(true);
}

// LÓGICA DE TURNO INDIVIDUAL [cite: 330, 336]
function atacar() {
    if (!enemigoTemporal) return;

    let p = gameState.player;

    // 1. ATAQUE DEL MONSTRUO 
    let aleatorioM = Math.floor(Math.random() * 10) + 1;
    let dañoAlHeroe = Math.max(0, (enemigoTemporal.strength + aleatorioM) - (p.defense + p.defenseBonus));
    
    if (dañoAlHeroe > 0) {
        p.health -= dañoAlHeroe;
        writeLog(`${enemigoTemporal.name} te inflige ${dañoAlHeroe} de daño.`);
    }

    if (p.health <= 0) {
        gestionarMuerteJugador();
        toggleControls(false);
        return;
    }

    // 2. ATAQUE DEL HÉROE [cite: 336]
    let aleatorioH = Math.floor(Math.random() * 10) + 1;
    let dañoAlMonstruo = Math.max(0, (p.strength + p.strengthBonus + aleatorioH) - enemigoTemporal.defence);
    
    if (dañoAlMonstruo > 0) {
        enemigoTemporal.health -= dañoAlMonstruo;
        writeLog(`Atacas al ${enemigoTemporal.name} y le causas ${dañoAlMonstruo} de daño.`);
    }

    // 3. COMPROBACIÓN DE RESULTADO [cite: 342]
    if (enemigoTemporal.health <= 0.20) {
        writeLog(`¡Has derrotado al ${enemigoTemporal.name}!`);
        clearEnemy();
        gestionarRecompensa();
        enemigoTemporal = null;
        toggleControls(false);
    } else {
        writeLog(`Vida restante del enemigo: ${enemigoTemporal.health}`);
    }
    
    renderStats();
}

function gestionarRecompensa() {
    // 40% de probabilidad de encontrar algo[cite: 5]
    if (Math.random() <= 0.40) {
        let bonificador = Math.floor(Math.random() * 11) + 5; // Valor entre 5 y 15[cite: 5, 6]
        
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