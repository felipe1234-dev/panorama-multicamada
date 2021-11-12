const themeToggler = document.querySelector("#day-toggler");
	
themeToggler.addEventListener("change", () => update(getConfig(), true));

const getTheme = () => themeToggler.checked ? "day" : "night";

const getOffset = elem => {

    if (!elem.getClientRects().length) {
        return { top: 0, left: 0 };
    }

    let rect = elem.getBoundingClientRect();
    let win = elem.ownerDocument.defaultView;
    
    return ({
        top: rect.top + win.pageYOffset,
        left: rect.left + win.pageXOffset
    });  
}

const getLayers = () => {
    const { panorama } = getConfig();
    const theme = getTheme();
    const scenes = getScenes();

    let layersIds = [];
    let layers = [];

    scenes.forEach(({ layerId }) => {
		if (!layersIds.includes(layerId)) {
        	layersIds.push(layerId);
        }
   	});

	layersIds = layersIds.sort();
	
    layersIds.forEach(searchId => {
		layers.push({
        	id: searchId,
            scenes: scenes.filter(({ layerId }) => layerId == searchId)
        }); 
   	});

    return layers;
}

const getScenes = () => {
    const { panorama } = getConfig();
    const theme = getTheme();
    let scenes = [];

    Object.keys(panorama[theme].scenes).forEach(sceneId => {
        scenes.push(panorama[theme].scenes[sceneId]);
    });

    return scenes;
}

const getNewId = (type, i) => {
    const theme = getTheme();
    let { minimap } = getConfig();
	
	let idsList = [];
	
	switch (type) {
		case "hotSpots":
            getLayers()[i].scenes.forEach( ({ hotSpots }) => {
                hotSpots.forEach( ({ id }) => idsList.push(id) );
            });
			break;
		case "mi-item":
            minimap.layers[i].items.forEach(({ id }) => idsList.push(id));
			break;
        case "layers":
            getScenes().forEach(({ layerId }) => idsList.push(layerId));
	}

	let newId = 1;

	while (true) {
		if (!idsList.includes(newId)) {
			break;
		}

		newId++;
	}
	
	return newId;
}

const getLayersIds = () => {
    let ids = [];

    getScenes().forEach(({ layerId }) => {
        if (!ids.includes(layerId)) {
            ids.push(layerId);
        }
    });

    ids = ids.sort();

    return ids;
}

const getLayerIndex = searchId => {
    let index;

    getLayersIds().some((id, i) => {
        if (searchId == id) {
            index = i;
            return;
        }
    });

    return index;
}

const getCurrScene = panEditor => {
    const { panorama } = getConfig();

    return panEditor && panEditor.isLoaded() ? panEditor.getScene() : panorama[getTheme()].default.firstScene;
}

// usado para fazer um tooltip mais da hora
const tooltipConstructor = (hotSpotDiv, args) => {
	const { title, url } = JSON.parse(args);
	
    hotSpotDiv.classList.add("pnlm-tooltip");
	const span = document.createElement("span");
	
	if (title) {
		hotSpotDiv.appendChild(span);
	}
		
    if (!url && title) {
   		span.innerHTML = title;
        span.style.width = span.scrollWidth + 20 + "px";
        span.style.marginLeft = -(span.scrollWidth - hotSpotDiv.offsetWidth)/2 + "px";
        span.style.marginTop = -span.scrollHeight - 10 + "px";
    } 
	else if (title) {
		span.style.cssText = `
			left: 120px;
			bottom: -90px;
			z-index: 100;
			width: 200px;
            height: 200px;
            border-radius: 50%;
            overflow: hidden;
            margin-left: -10;
            margin-top: -10;
            background-image: url("${url}");
            background-size: cover;
            background-repeat: no-repeat;
            border: 4px solid #000000dd;
            cursor: pointer;
		`;
		span.classList.add("hov-image-class")
		
		const titleEl = document.createElement("div");
        span.appendChild(titleEl);
		
		titleEl.style.cssText = `
			margin: 0px auto 30px;
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: #000000dd;
		`;
         
		const titleText = document.createElement("h4");
		titleEl.appendChild(titleText);
		
		titleText.innerHTML = title;
		titleText.style.cssText = `
			max-width: 165px;
        	max-height: 165px;
        	font-size: 20px;
        	margin: 2px auto;
        	color: '#fff;
		`;
	}
}