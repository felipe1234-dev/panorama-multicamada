const JSONstrCallback = (key, value) => key === "createTooltipFunc" ? value.toString() : value;

const JSONparsCallback = (key, value) => key === "createTooltipFunc" ? eval(`(${value})`) : value;

const getConfig = () => {
    let dbConfig = document.querySelector("#panorama-config");
    let dbMinimap = document.querySelector("#minimap-config");
    // "db" porque são os valores que já foram salvos pelo sistema

    let CONFIG = JSON.parse(dbConfig.value, JSONparsCallback);
    let MINIMAP = JSON.parse(dbMinimap.value, JSONparsCallback);

    return ({
        panorama: CONFIG,
        minimap: MINIMAP
    });
}