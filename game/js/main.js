// Asignación de botones de movimiento
btnNorth.addEventListener("click", () => movePlayer("north"));
btnSouth.addEventListener("click", () => movePlayer("south"));
btnEast.addEventListener("click",  () => movePlayer("east"));
btnWest.addEventListener("click",  () => movePlayer("west"));

// Asignación de botones de acción
btnSearch.addEventListener("click", searchGold);
btnPotion.addEventListener("click", usePotion);
btnBuyPotion.addEventListener("click", buyPotion);
btnBuyShield.addEventListener("click", buyShield);
btnAttack.addEventListener("click", atacar);
btnHelp.addEventListener("click", showHelp);
btnMap.addEventListener("click", toggleMap);

// se ejecuta cuando la página ha cargado completamente
window.addEventListener("load", () => {
    // renderiza la habitación inicial y las estadísticas del jugador
    renderRoom(getCurrentRoom());
    renderStats();
    writeLog("Bienvenido a la Mansión Encantada");
});