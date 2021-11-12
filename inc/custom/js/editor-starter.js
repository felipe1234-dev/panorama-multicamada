const renderEditors = props => {

    ReactDOM.render(
        <Settings { ...props } />,
        document.getElementById("settings")
    );

    ReactDOM.render(
        <ScenesEditor { ...props } />, 
        document.getElementById("scenes-editor")
    );

    ReactDOM.render(
        <HotSpotsEditor { ...props } />, 
        document.getElementById("hotspots-editor")
    );
	
	ReactDOM.render(
        <MinimapEditor { ...props } />, 
        document.getElementById("minimap-editor")
    );

    ReactDOM.render(
        <OverlayEditor { ...props } />,
        document.getElementById("overlay-editor")
    );
    
    // re-renderizando os componentes para se atualizarem
}

const update = (newConfig, reloadPan = false) => {
    let theme = getTheme();
    let { firstScene } = newConfig.panorama[theme].default;
	
	console.log(newConfig);
	
    if (!firstScene) {
		firstScene = getScenes()[0]; 
	}
    // setando a primeira cena como a primeira que vier caso ainda esteja indefinida

    let panormaConfig = document.querySelector("#panorama-config");
    let minimapConfig = document.querySelector("#minimap-config");

    panormaConfig.value = JSON.stringify(newConfig.panorama, JSONstrCallback);
    minimapConfig.value = JSON.stringify(newConfig.minimap, JSONstrCallback);
    // atualizando os textareas, assim, os outros editores poderão perceber as mudanças 
	
    renderEditors({ update: update, reloadPan: reloadPan });
}

renderEditors({ update: update });