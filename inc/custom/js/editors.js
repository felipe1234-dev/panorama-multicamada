


let dbConfig = document.querySelector("#panorama-config");
let dbMinimap = document.querySelector("#minimap-config");
// "db" porque são os valores que já foram salvos pelo sistema

const JSONstrCallback = (key, value) => key === "createTooltipFunc" ? value.toString() : value;
const JSONparsCallback = (key, value) => key === "createTooltipFunc" ? eval(`(${value})`) : value;

let CONFIG = JSON.parse(dbConfig.value, JSONparsCallback);
let MINIMAP = JSON.parse(dbMinimap.value, JSONparsCallback);

// são as propriedades dos itens de hotSpots que não podem ser jogados na geração do panorama (pannellum)
let toIgnore = [ "hovImage", "angle" ];

const update = (reloadPan = false) => {
	if (!CONFIG[getTheme()].default.firstScene) {
		CONFIG[getTheme()].default.firstScene = Object.keys(CONFIG[getTheme()].scenes)[0]; 
	}
    // setando a primeira cena como a primeira que vier

    // atualiza a variável global, assim, os outros editores poderão perceber as mudanças 

    ReactDOM.render(
        <ScenesEditor />, 
        document.getElementById("scenes-editor")
    );

    ReactDOM.render(
        <HotspotsEditor />, 
        document.getElementById("hotspots-editor")
    );
	
	ReactDOM.render(
        <MinimapEditor />, 
        document.getElementById("minimap-editor")
    );

    ReactDOM.render(
        <Settings />,
        document.getElementById("settings")
    );
    // re-renderizando os componentes para se atualizarem
    
	if (reloadPan) {
		let newConfig = JSON.parse(JSON.stringify(CONFIG, JSONstrCallback), JSONparsCallback); // cópia
		// vamos retirar essas propriedades dos hotSpots para não acontecer bugs
		
		Object.keys(newConfig[getTheme()].scenes).forEach(sceneId => {
			newConfig[getTheme()].scenes[sceneId].hotSpots.forEach((spot, i) => {
				toIgnore.forEach(prop => {
					delete newConfig[getTheme()].scenes[sceneId].hotSpots[i][prop];
				});
			});
		});	//console.log(newConfig);
		
		panEditor.destroy();
		panEditor = pannellum.viewer("hotspots-preview", newConfig[getTheme()]);
	}
}

const themeToggler = document.querySelector("#day-toggler");

themeToggler.addEventListener("change", () => update(true));

const getTheme = () => themeToggler.checked ? "day" : "night";

const getScenes = () => Object.keys(CONFIG[getTheme()].scenes);

const getCurrScene = () => panEditor && panEditor.isLoaded() ? panEditor.getScene() : CONFIG[getTheme()].default.firstScene;

const getLayers = () => {
    let layers = [];

    Object.keys(CONFIG[getTheme()].scenes).forEach(id => {
		if (!layers.includes(CONFIG[getTheme()].scenes[id].layerId)) {
        	layers.push(CONFIG[getTheme()].scenes[id].layerId);
        }
   	});

	layers = layers.sort();

    layers.forEach((searchLayer, i) => {
		layers[i] = {
        	id: searchLayer,
            scenes: []
        }

        Object.keys(CONFIG[getTheme()].scenes).forEach(sceneId => {
        	if (CONFIG[getTheme()].scenes[sceneId].layerId == searchLayer) {
            	layers[i].scenes.push(CONFIG[getTheme()].scenes[sceneId]);
            }
        })
   	});

    return layers;
}

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


let panEditor;

let int = setInterval(() => {
	let toIgnore = [ "hovImage", "angle" ];
    const loaded = !!document.querySelector("#hotspots-preview");
	
    if (loaded) {
		let newConfig = JSON.parse(JSON.stringify(CONFIG, JSONstrCallback), JSONparsCallback); // cópia
		// vamos retirar essas propriedades dos hotSpots para não acontecer bugs
		
		Object.keys(newConfig[getTheme()].scenes).forEach(sceneId => {
			newConfig[getTheme()].scenes[sceneId].hotSpots.forEach((spot, i) => {
				toIgnore.forEach(prop => {
						delete newConfig[getTheme()].scenes[sceneId].hotSpots[i][prop];
				});
			});
		});	
		
		//console.log(newConfig);
		
		panEditor = pannellum.viewer("hotspots-preview", newConfig[getTheme()]);
		
		clearInterval(int);
    }
}, 1000);


/**************************************************************************************************************/
// TODAS AS FUNÇÕES                                                                                           *
/**************************************************************************************************************/

const editText = i => event => {
	const currentScene = panEditor.getScene();	
    const value = event.target.value;
    const text = value;
	
    const tooltipArgs = JSON.parse(CONFIG[getTheme()].scenes[currentScene].hotSpots[i].createTooltipArgs);
	const { title, url } = tooltipArgs;
			
	CONFIG[getTheme()].scenes[currentScene].hotSpots[i].createTooltipArgs = JSON.stringify({
		title: text,
		url: url
	});
	CONFIG[getTheme()].scenes[currentScene].hotSpots[i].text = text;

    update();
}

const attrChange = i => event => {
    const attr = event.target.getAttribute("attr");
	const currentScene = panEditor.getScene();
    const value = event.target.value;
        
    CONFIG[getTheme()].scenes[currentScene].hotSpots[i][attr] = value;

    update();
}



const addHovImage = i => event => {
    event.preventDefault();

    let customUploader;
        
    if (customUploader) {
        customUploader.open();
        return;
    }

    customUploader = wp.media({
        title: "Selecione a imagem para a prévia",
        library: {
            type: ["image"]
        },
        button: {
            text: "Selecionar"
        },
        multiple: false
    }).on("select", () => {
        const attachment = customUploader.state().get("selection").first().toJSON();
        const currentScene = panEditor.getScene();

        CONFIG[getTheme()].scenes[currentScene].hotSpots[i]["hovImage"] = attachment.url;
			
		const targetScene = CONFIG[getTheme()].scenes[currentScene].hotSpots[i].sceneId;
			
		CONFIG[getTheme()].scenes[currentScene].hotSpots[i].createTooltipArgs = JSON.stringify({
			title: CONFIG[getTheme()].scenes[targetScene].title,
			url: attachment.url
		});
		
        update(true);
    }).open();
}



const editAngle = (i, id) => event => {
	const currentScene = panEditor.getScene();
	
    const oldDegrees = CONFIG[getTheme()].scenes[currentScene].hotSpots[i].angle;
	const newDegrees = event.target.value;
	
	const hotspot = document.querySelector(`.temptooltip-${currentScene}-${id}`);
	hotspot.classList.remove(`r${oldDegrees}`);
	hotspot.classList.add(`r${newDegrees}`)
	
    CONFIG[getTheme()].scenes[currentScene].hotSpots[i].angle = newDegrees;
	CONFIG[getTheme()].scenes[currentScene].hotSpots[i].cssClass = `custom-tooltip r${newDegrees} temptooltip-${currentScene}-${id}`;
		
    update();
}

const getNewId = (type, i) => {
	let items = [];
	MINIMAP.layers[i].items.forEach(item => items.push(item.id));
	
	let hotspots = [];
	getLayers()[i].scenes.forEach(({ hotSpots }) => hotSpots.forEach(item => hotspots.push(item.id)));
	
	console.log(items)
	console.log(hotspots)
	
	let idsList;
	
	switch (type) {
		case "hotSpots":
			idsList = hotspots;
			break;
		case "mi-item":
			idsList = items;
			break;
	}
	
	let newId  = 1;

	while (true) {
		if (!idsList.includes(newId)) {
			break;
		}

		newId++;
	}
	
	console.log(newId)
	
	return newId;
}

const getLayerIndex = searchId => {
	let index;
	
	getLayers().some((layer, i) => {
		if (searchId == layer.id) {
			index = i;
			return;
		}
	});
	
	return index;
}


const addHotspot = () => event => {
    event.preventDefault();
        
    const currentScene = panEditor.getScene();
	const layer = getLayerIndex(CONFIG[getTheme()].scenes[currentScene].layerId);
	//console.log(layer);
	const id = getNewId("hotSpots", layer);
	const yaw = panEditor.getYaw();
	const pitch = panEditor.getPitch();
	const sceneId = panEditor.getScene();
	const text = `Hotspot ${id}`;
	const cssClass = `custom-tooltip r0 temptooltip-${sceneId}-${id}`
		
    const newHotSpot = {
        id: id,
        yaw: yaw,
        pitch: pitch,
        angle: 0,
        type: "scene",
        sceneId: sceneId,
		cssClass: cssClass,
        hovImage: "",
        text: text,
        createTooltipArgs: `{"title": "${text}", "url": ""}`,
		createTooltipFunc: tooltipConstructor
    }

    CONFIG[getTheme()].scenes[currentScene].hotSpots.push(newHotSpot);
		
	toIgnore.forEach(prop => {
		delete newHotSpot[prop];
	});
		
	panEditor.addHotSpot(newHotSpot);

    update();
}




const removeHotspot = (id, i) => event => {
    event.preventDefault();

    const currentScene = panEditor.getScene();

    CONFIG[getTheme()].scenes[currentScene].hotSpots.splice(i, 1);
	panEditor.removeHotSpot(id);
		
    update();
}



const setAsFirst = sceneId => event => {
    CONFIG[getTheme()].default.firstScene = sceneId;
	
	//console.log(sceneId);
	//console.log(CONFIG[getTheme()].default.firstScene);
	//console.log(CONFIG[getTheme()]);
    
	update();
}




const addScenes = layerId => event => {
    event.preventDefault();
    
    let customUploader;
    
    if (customUploader) {
        customUploader.open();
        return;
    }
    
    customUploader = wp.media({
        title: 
            `Selecione as imagens para compor as cenas da camada ${layerId} do seu panorama`,
        library: { 
            type: [ "image" ] 
        },
        button: { 
            text: "Selecionar"
        },
        multiple: true
    }).on("select", () => {
        const attachments = customUploader.state().get("selection").toJSON();

        attachments.map(item => {
            if (item.type === "image") {
                let newImg = {
                    type: "equirectangular",
                    panorama: item.url,
                    hotSpotDebug: true,
                    title: item.title,
                    imgId: item.id,
                    imgSrc: item.url,
                    layerId: layerId,
                    hotSpots: []
                }
                
                CONFIG[getTheme()].scenes[item.id] = newImg;
                
				//console.log(layerId);
				//console.log(getLayers().length);
                const isAddingLayer = layerId >= getLayers().length && layerId != 1; 
                if (isAddingLayer) {
                    MINIMAP.layers.push({
                        imgUrl: MINIMAP.layers[getLayers().length - 2].imgUrl, 
						// pega a imagem da anterior como padrão, -1 para converter length em índice, -2 para pegar o anterior
                        items: []
                    });
                }
            }
        });
        
        update(true);
    }).open();
}

const addMinimap = layer => event => {
    event.preventDefault();
    
    let customUploader;
            
    if (customUploader) {
        customUploader.open();
        return;
    }

    customUploader = wp.media({
        title: `Selecione a imagem da planta para a camada ${layer}`,
        library: {
            type : ['image']
        },
        button: {
            text: 'Selecionar'
        },
        multiple: false
    }).on('select', function() {
        let attachment = customUploader.state().get("selection").first().toJSON();
        
        MINIMAP.layers[layer].imgUrl = attachment.url;

        update();
    })
    .open();
}

const deleteLayer = (searchLayer, i) => event => {
    event.preventDefault();

    getScenes().forEach(sceneId => {
        if (CONFIG[getTheme()].scenes[sceneId].layerId == searchLayer) {
            delete CONFIG[getTheme()].scenes[sceneId];
        }
    });

    // apagar no minimapa também
    MINIMAP.layers.splice(i, 1);

    update();
}


const addMiItem = i => event => {
    const img = event.target;

    let xPx = event.pageX - getOffset(img).left - 10,
        yPx = event.pageY - getOffset(img).top - 10;

    let x = (xPx*100)/img.getBoundingClientRect().width,
        y = (yPx*100)/img.getBoundingClientRect().height;

    MINIMAP.layers[i].items.push({
        id: getNewId("mi-item", i),
		layerId: i + 1,
        x: x,
        y: y,
        sceneId: CONFIG[getTheme()].default.firstScene
    });

    update();
}


const editMiItem = (layer, i) => event => {
    const prop = event.target.getAttribute("attr");
    const value = event.target.value;

    MINIMAP.layers[layer].items[i][prop] = value;

    update();
}


const removeMiItem = (layer, i) => event => {
	event.preventDefault();
	
	//console.log(layer);
	//console.log(i);
	
    MINIMAP.layers[layer].items.splice(i, 1);

    update();
}

const editMiSetting = () => event => {
    const prop = event.target.getAttribute("setting");
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;

    MINIMAP[prop] = value;
    //console.log(value);
    update();
}

const editSetting = () => event => {
    const prop = event.target.getAttribute("setting");
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;

    CONFIG[prop] = value;
    //console.log(value);
    update();
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










const Settings = () => {
    return (
        <>
            <input 
                defaultChecked={CONFIG.enableMobileFullscreen}
                type="checkbox" 
                id="panorama-enable-fullscreen-mobile" 
                name="panorama-enable-fullscreen-mobile"
                setting="enableMobileFullscreen"
                onChange={editSetting()}
            />
            <label for="panorama-enable-fullscreen-mobile">
                Habilitar tela cheia (mobile)
            </label>

			<br />
					
			<input 
                defaultChecked={CONFIG.enableFadeAnimation}
                type="checkbox" 
                id="panorama-enable-fade-anim" 
                name="panorama-enable-fade-anim"
                setting="enableFadeAnimation"
                onChange={editSetting()}
            />
            <label for="panorama-enable-fade-anim">
                Habilitar animação de desaparecimento
            </label>
            
            <textarea 
                id="general-settings" 
                name="general-settings" 
                style={{ display: "none" }} 
                value={JSON.stringify(CONFIG, JSONstrCallback)}
            />
        </>
    );
}

ReactDOM.render(
    <Settings />,
    document.getElementById("settings")
);







/**************************************************************************************************************/
// SCENES EDITOR                                                                                              *
/**************************************************************************************************************/


const ScenesEditor = () => {
    return (
        <>
            {getLayers().length < 1 ? <p>Não há camadas no seu panorama, adicione no botão abaixo</p> : (
                getLayers().map(({ id, scenes }, i) => (
                    <Layer id={id} scenes={scenes} i={i} />
                ))
            )}

            <div style={{ display: "flex", alignItems: "center" }}>
                <a
                    href="#" onClick={addScenes(getLayers().length + 1)}
                    add-layer="true"
                    className="button button-primary button-large"
                >
                    Adicionar camada
                </a>
            </div>

            <textarea 
                id="scenes-list" 
                name="scenes-list" 
                style={{ display: "none" }} 
            	value={JSON.stringify(CONFIG, JSONstrCallback)}
            />
        </>
    );
}

const Layer = ({ id, scenes, i }) => {
    return (
        <div layer-id={id} className="layer">
            <header className="layer-header">
                <h3>Andar {i + 1}</h3>
                <a 
                    href="#" onClick={addScenes(id)} add-scenes="true"
                    className="button button-primary button-large"
                >
                    Adicionar Cenas
                </a>
                <a
                    href="#" onClick={deleteLayer(id, i)}
                    className="button button-primary button-large"
                    delete-layer="true"
                >
                    Deletar Camada
                </a>
            </header>
            <section className="layer-scenes">
                {scenes.map(({ title, imgId, imgSrc }, i) => (
                    <div className="tooltip">
                        <img 
                            src={imgSrc}
                            className={`scenes-img${CONFIG[getTheme()].default.firstScene == imgId ? " first-scene" : ""}`} 
                            img-id={imgId}
                            alt={title}
							onClick={setAsFirst(imgId)}
                        />
                        <span className="tooltiptext">
                            Clique sob a imagem para torná-la a primeira cena!
                        </span>
                    </div>
                ))}
            </section>
            <hr />
        </div>
    );
}

ReactDOM.render(
    <ScenesEditor />, 
    document.getElementById("scenes-editor")
);


















/**************************************************************************************************************/
// HOTSPOTS EDITOR                                                                                            *
/**************************************************************************************************************/


const HotspotsEditor = () => {
	const  [currScene, setCurrScene] = React.useState("");

	React.useEffect(() => setCurrScene(getCurrScene()), []);

	const selectScene = () => event => {
		panEditor.loadScene(event.target.value);
		setCurrScene(event.target.value);
		update();
	}

    return (
        <div className="hotspots-wrapper">
            
            {getScenes().length < 1 ? <p>Você ainda não adicionou cenas!</p> : (
                <select
                    id="scene-selector" 
                    name="scene-selector"
                    onChange={selectScene()}
                >
                    {getScenes().map(sceneId => {
                        const { title, layerId } = CONFIG[getTheme()].scenes[sceneId];
                        
                        return (
                            <option value={sceneId} selected={getCurrScene() == sceneId}>
                                {title} - Andar {layerId}
                            </option>
                        );
                    })}
                </select>
            )}
            
            <div id="hotspots-preview"></div>

            <footer className="hotspot-list-wrapper">
                
                <button 
                    className="button button-primary" 
                    onClick={addHotspot()}
                >
                    Adicionar hotspot
                </button>

				{currScene ? (
					getScenes().map(sceneId => {
						if (currScene == sceneId) {
							return CONFIG[getTheme()].scenes[sceneId].hotSpots.map((hotspot, i) => (
								<SceneHotspots i={i} data={hotspot} />
							));
						}
						return null;
					})
				) : null}

            </footer>

            <textarea 
                id="hotspots-list" 
                name="hotspots-list" 
                style={{ display: "none" }} 
				value={JSON.stringify(CONFIG, JSONstrCallback)}
            />
        </div>
    );
}

const SceneHotspots = ({ data, i }) => {
    const { id, sceneId: targetScene, angle, pitch, yaw, hovImage, text } = data;
    const ANGLES = [ 0, 45, 90, 135, 180, 225, 270, 315 ];

    return (
        <details className="hotspot-item">
            <summary style={{ fontSize: "16px" }}>
				#{id}. {CONFIG[getTheme()].scenes[getCurrScene()].title} -&gt; {CONFIG[getTheme()].scenes[targetScene].title}
			</summary>

			<label for={`target-scene-selector-${id}`}>
				Entra em:
			</label>
            <select 
                onChange={attrChange(i)}
                name="target-scene-selector"
				attr="sceneId" id={`target-scene-selector-${id}`}
				style={{ margin: "10px 5px" }}
            >
                {getScenes().map(sceneId => {
                    const { title, layerId } = CONFIG[getTheme()].scenes[sceneId];
                        
                    return (
                        <option value={sceneId} selected={targetScene == sceneId}>
                            {title} - Andar {layerId}
                        </option>
                    );
                })}
            </select>

			<br />
			
			<label for={`yaw-${id}`} style={{ fontSize: "16px" }}>
				Posição em X:
			</label>
            <input
                onChange={attrChange(i)}
                type="text" name="yaw" 
                value={yaw} id={`yaw-${id}`}
				attr="yaw" style={{ margin: "10px 5px" }}
            />

			<br />
            
			<label for={`pitch-${id}`}>
				Posição em Y:
			</label>
			<input
                onChange={attrChange(i)}
                type="text" name="pitch"
				attr="pitch" value={pitch} 
				id={`pitch-${id}`} style={{ margin: "10px 5px" }}
            />
			
			<br />
			
			<label for={`text-${id}`}>
				Texto:
			</label>
			<input
                onChange={editText(i)}
                prop="text" type="text" name="text"
				value={text} id={`text-${id}`} 
				style={{ margin: "10px 5px" }}
            /> Se deixado como "Hotspot {id}", será ocultado no site

			<br />

            <select 
                onChange={editAngle(i, id)}
                className="angle-selector" 
                name="angle-selector"
				style={{ margin: "10px 5px" }}
            >
                {ANGLES.map(v => (
                    <option selected={v == angle} value={v}>
                        {v} graus
                    </option>
                ))}
            </select>

            <input 
                onChange={attrChange(i)}
                type="text" 
                name="hov-image" 
                value={hovImage} 
                style={{ maxWidth: "100px" }} 
                placeholder="URL da prévia"
				attr="hovImage" style={{ margin: "10px 5px" }}
            />

            <button 
				className="button"
                onClick={addHovImage(i)} 
                style={{ margin: "0px 5px" }}
            >
                Adicionar prévia
            </button>
            <button className="button" onClick={removeHotspot(id, i)}>
                Remover
            </button>

			<hr />
        </details>
    );
}

ReactDOM.render(
    <HotspotsEditor />, 
    document.getElementById("hotspots-editor")
);














/**************************************************************************************************************/
// MINIMAP EDITOR                                                                                             *
/**************************************************************************************************************/

const MinimapEditor = () => {
    const [layer, setLayer] = React.useState(0);

    return (
        <>
            {getScenes().length < 1 ? <p>Você ainda não adicionou camadas!</p> : (
                <select
                    id="layer-selector" name="layer-selector"
                    onChange={e => setLayer(e.target.value)}
                >
                    {getLayers().map((layer, i) => (
                        <option value={i} selected={i == layer}>
                            Andar {i + 1}
                        </option>
                    ))}
                </select>
            )}
            
            <div className="minimap-wrapper">
                <div className="minimap-wrapper-img" onClick={addMiItem(layer)}>
                    <img 
                        src={MINIMAP.layers[layer].imgUrl} 
                        alt="Minimapa do panorama" 
                        className="minimap-img" 
                    />
                    {MINIMAP.layers[layer].items.map(({ id, x, y }) => (
                        <span 
                            id={`mi-${id}`} 
                            className="minimap-item" 
                            style={{ left: x+"%", top: y+"%" }}
                        >
                            {id}
                        </span>
                    ))}
                </div>
            </div>

            <div className="minimap-list-item">
                {MINIMAP.layers[layer].items.map((item, i) => (
                    <MiListItem layerI={layer} itemI={i} { ...item } />
                ))}
            </div>
			

            <div className="minimap-settings">
				<hr />

                <MiSettings />
				
				<br />
                
				<a 
					href="#" className="button button-primary button-large" 
					add-minimap="true" onClick={addMinimap(layer)}
					style={{ marginTop: "10px" }}
				>
					Modificar planta 
				</a>
            </div>

            <textarea 
                name="minimap-config"
                id="minimap-config"
                style={{ display: "none" }}
           		value={JSON.stringify(MINIMAP, JSONstrCallback)}
            />
        </>
    );
}

const MiListItem = ({ id, x, y, sceneId: itemScene, layerId, layerI, itemI }) => (
    <div className="minimap-list-item" id={`mi-${id}`}>
        #{id}
                        
        <input 
            type="text" value={x}
            name="minimap-item x" 
            placeholder="X (em %)"
            attr="x" onChange={editMiItem(layerI, itemI)}
        /> 
                        
        <input 
            type="text" value={y}
            name="minimap-item y" 
            placeholder="Y (em %)"
            attr="y" onChange={editMiItem(layerI, itemI)}
        /> 

        <select 
            id={`mi-items-${id}`} name={`mi-items-${id}`}
            attr="sceneId" onChange={editMiItem(layerI, itemI)}
        >
            {getScenes().map(sceneId => {
                const { title } = CONFIG[getTheme()].scenes[sceneId];

                return (
                    <option 
                        selected={itemScene == sceneId}
                        value={sceneId}
                    >
                        {title}
                    </option>
                );
            })}
        </select> 
                        
        <button 
            className="button" remove-mi-item="true"
            onClick={removeMiItem(layerI, itemI)}
        >
            Remover
        </button> 
    </div>
)


const MiSettings = () => (
    <>
        <label for="minimap-width">
            Largura da imagem:
        </label>
        <input 
            id="minimap-width" 
            name="minimap-width" 
            type="text" 
            placeholder="Largura da planta no panorama" 
            value={MINIMAP.width}
            style={{ margin: "10px 5px" }}
            setting="width"
            onChange={editMiSetting()}
        />

		<br />

        <label for="minimap-width-open">
            Largura da imagem ao abrir:
        </label>
        <input 
            id="minimap-width-open" 
            name="minimap-width-open" 
            type="text" 
            placeholder="Largura da planta no panorama ao clicar" 
            value={MINIMAP.widthOpen}
            style={{ margin: "10px 5px" }}
            setting="widthOpen"
            onChange={editMiSetting()}
        />

        <br />

        <label for="minimap-mobile-width">
            Largura da imagem (mobile):
        </label>
        <input 
            id="minimap-mobile-width" 
            name="minimap-mobile-width" 
            type="text" 
            placeholder="Largura da planta no panorama (mobile)" 
            value={MINIMAP.mobileWidth}
            style={{ margin: "10px 5px" }}
            setting="mobileWidth"
            onChange={editMiSetting()}
        />
		
		<br />

		<label for="minimap-items-width-open">
            Largura/Altura das bolinhas (mapa aumentado):
        </label>
        <input 
            id="minimap-items-width-open" 
            name="minimap-items-width-open" 
            type="text" 
            placeholder="Largura dos itens (bolinhas) do minimapa aberto" 
            value={MINIMAP.itemsWidthOpen}
            style={{ margin: "10px 5px" }}
            setting="itemsWidthOpen"
            onChange={editMiSetting()}
        />
        <input 
            id="minimap-items-height-open" 
            name="minimap-items-height-open" 
            type="text" 
            placeholder="Altura dos itens (bolinhas) do minimapa aberto" 
            value={MINIMAP.itemsHeightOpen}
            style={{ margin: "10px 5px" }}
            setting="itemsHeightOpen"
            onChange={editMiSetting()}
        />

		<br />

        <label for="minimap-items-width">
            Largura/Altura das bolinhas (mapa diminuído):
        </label>
        <input 
            id="minimap-items-width" 
            name="minimap-items-width" 
            type="text" 
            placeholder="Largura dos itens (bolinhas) do minimapa minimizado" 
            value={MINIMAP.itemsWidth}
            style={{ margin: "10px 5px" }}
            setting="itemsWidth"
            onChange={editMiSetting()}
        />
        <input 
            id="minimap-items-height" 
            name="minimap-items-height" 
            type="text" 
            placeholder="Altura dos itens (bolinhas) do minimapa minimizado" 
            value={MINIMAP.itemsHeight}
            style={{ margin: "10px 5px" }}
            setting="itemsHeight"
            onChange={editMiSetting()}
        />
                
        <br />

        <input 
            defaultChecked={MINIMAP.show}
            type="checkbox" 
            id="minimap-show" 
            name="minimap-show"
            setting="show"
            onChange={editMiSetting()}
        />
        <label for="minimap-show">
            Habilitar planta
        </label>
       
		
    </>
)

ReactDOM.render(
    <MinimapEditor />,
    document.getElementById("minimap-editor")
);

