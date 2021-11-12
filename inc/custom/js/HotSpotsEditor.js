let { panorama, minimap } = getConfig();
const theme = getTheme();
let panEditor;

const Panorama = ({ reload }) => {
	React.useEffect(() => {
		if (reload) {
			panEditor.destroy();
			panEditor = pannellum.viewer("hotspots-preview", panorama[theme]);
		}
	}, [reload]);
	
	React.useEffect(() => {
		panEditor = pannellum.viewer("hotspots-preview", panorama[theme]);	
	}, []);
	
	return <div id="hotspots-preview"></div>;
}

const HotSpotsEditor = ({ update, reloadPan }) => {

	const selectScene = () => event => {
		panEditor.loadScene(event.target.value);
		update({ panorama: panorama, minimap: minimap });
	}

    const addHotspot = () => event => {
        event.preventDefault();
        
		const currentScene = panEditor.getScene();
        
		let { layerId, hotSpots } = panorama[theme].scenes[currentScene];
		
		const layerIndex = getLayerIndex(layerId);
		const newId = getNewId("hotSpots", layerIndex);
        const text = `Hotspot ${newId}`;
        const cssClass = `custom-tooltip r0 temptooltip-${currentScene}-${newId}`
            
        const newHotSpot = {
            id: newId,
            yaw: panEditor.getYaw(),
            pitch: panEditor.getPitch(),
            angle: 0,
            type: "scene",
            sceneId: panEditor.getScene(),
            cssClass: cssClass,
            hovImage: "",
            text: text,
            createTooltipArgs: `{"title": "${text}", "url": ""}`,
            createTooltipFunc: tooltipConstructor
        }
    
        hotSpots.push(newHotSpot);
		console.log(newHotSpot)
        panEditor.addHotSpot(newHotSpot);
    
        update({ panorama: panorama, minimap: minimap });
    }

    return (
        <div className="hotspots-wrapper">
            
            {getScenes().length < 1 ? <p>Você ainda não adicionou cenas!</p> : (
                <select
                    id="scene-selector" 
                    name="scene-selector"
                    onChange={selectScene()}
                >
                    {getScenes().map(({ imgId, title, layerId }) => (
                        <option value={imgId} selected={getCurrScene(panEditor) == imgId}>
                            {title} - Cam. {getLayerIndex(layerId) + 1}
                        </option>
                    ))}
                </select>
            )}
            
            <Panorama reload={reloadPan} />

            <footer className="hotspot-list-wrapper">
                
                <button
                    className="button button-primary" 
                    onClick={addHotspot()}
                >
                    Adicionar hotspot
                </button>

				{getCurrScene(panEditor) ? (
					getScenes().filter(({ imgId }) => getCurrScene(panEditor) == imgId).map(({ hotSpots }) => (
						hotSpots.map((hotspot, i) => (
							<HotSpot i={i} {...hotspot} />
						))
					))
				) : null}

            </footer>
        </div>
    );
}

const HotSpot = ({ i, id, sceneId: targetScene, angle, pitch, yaw, hovImage, text }) => {
    const ANGLES = [ 0, 45, 90, 135, 180, 225, 270, 315 ];
    const TITLES = {
        origin: panorama[theme].scenes[getCurrScene(panEditor)].title,
        target: panorama[theme].scenes[targetScene].title
    }

    const propChange = () => event => {
        const prop = event.target.getAttribute("property");
        const currentScene = panEditor.getScene();
        const value = event.target.value;
            
        panorama[theme].scenes[currentScene].hotSpots[i][prop] = value;
    
        update({ panorama: panorama, minimap: minimap });
    }

    const editText = () => event => {
        const currentScene = panEditor.getScene();	
        const value = event.target.value;
        
        let { createTooltipArgs, text } = panorama[theme].scenes[currentScene].hotSpots[i];
        const tooltipArgs = JSON.parse(createTooltipArgs);
        const { title, url } = tooltipArgs;

        createTooltipArgs = JSON.stringify({ title: value, url: url });
        text = value;
    
        update({ panorama: panorama, minimap: minimap });
    }

    const addHovImage = () => event => {
        event.preventDefault();
    
        let customUploader;
            
        if (customUploader) {
            customUploader.open();
            return;
        }
        
        const uploader = {
            config: {
                title: "Selecione a imagem para a prévia",
                library: {
                    type: ["image"]
                },
                button: {
                    text: "Selecionar"
                },
                multiple: false
            },
            onSelect: () => {
                const attachment = customUploader.state().get("selection").first().toJSON();
                const currentScene = panEditor.getScene();
                const { url } = attachment;

                let { 
                    sceneId: targetScene, 
                    hovImage, 
                    createTooltipArgs 
                } = panorama[theme].scenes[currentScene].hotSpots[i];

                hovImage = url;
                createTooltipArgs = JSON.stringify({
                    title: panorama[theme].scenes[targetScene].title,
                    url: url
                });
                
                update({ panorama: panorama, minimap: minimap }, true);
            }
        }

        customUploader = wp.media(uploader.config).on("select", uploader.onSelect).open();
    }

    const removeHotspot = () => event => {
        event.preventDefault();
    
        const currentScene = panEditor.getScene();
    
        panorama[theme].scenes[currentScene].hotSpots.splice(i, 1);
        panEditor.removeHotSpot(id);
            
        update({ panorama: panorama, minimap: minimap });
    }
	
	const editAngle = () => event => {
		const currentScene = panEditor.getScene();

		let { angle, cssClass } = panorama[theme].scenes[currentScene].hotSpots[i];
		
		const oldAngle = angle;
		const newAngle = event.target.value;

		const hotspot = document.querySelector(`.temptooltip-${currentScene}-${id}`);
		hotspot.classList.remove(`r${oldAngle}`);
		hotspot.classList.add(`r${newAngle}`);

		angle = newAngle;
		cssClass = `custom-tooltip r${newAngle} temptooltip-${currentScene}-${id}`;

		update({ panorama: panorama, minimap: minimap });
	}

    return (
        <details className="hotspot-item">
            <summary style={{ fontSize: "16px" }}>
				#{id}. {TITLES.origin} -&gt; {TITLES.target}
			</summary>

			<label for={`target-scene-selector-${id}`}>
				Entra em:
			</label>
            <select 
                onChange={propChange()}
                name="target-scene-selector"
				property="sceneId" id={`target-scene-selector-${id}`}
				style={{ margin: "10px 5px" }}
            >
                {getScenes().map(({ imgId, title, layerId }) => (
                    <option value={imgId} selected={targetScene == imgId}>
                        {title} - Pav. {getLayerIndex(layerId) + 1}
                    </option>
                ))}
            </select>

			<br />
			
			<label for={`yaw-${id}`} style={{ fontSize: "16px" }}>
				Posição em X:
			</label>
            <input
                onChange={propChange()}
                type="text" name="yaw" 
                value={yaw} id={`yaw-${id}`}
				property="yaw" style={{ margin: "10px 5px" }}
            />

			<br />
            
			<label for={`pitch-${id}`}>
				Posição em Y:
			</label>
			<input
                onChange={propChange()}
                type="text" name="pitch"
				property="pitch" value={pitch} 
				id={`pitch-${id}`} style={{ margin: "10px 5px" }}
            />
			
			<br />
			
			<label for={`text-${id}`}>
				Texto:
			</label>
			<input
                onChange={editText()}
                prop="text" type="text" name="text"
				value={text} id={`text-${id}`} 
				style={{ margin: "10px 5px" }}
            /> Se deixado como "Hotspot {id}", será ocultado no site

			<br />

            <select 
                onChange={editAngle()}
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
                onChange={propChange()}
                type="text" 
                name="hov-image" 
                value={hovImage} 
                style={{ maxWidth: "100px" }} 
                placeholder="URL da prévia"
				property="hovImage" style={{ margin: "10px 5px" }}
            />

            <button 
				className="button"
                onClick={addHovImage()} 
                style={{ margin: "0px 5px" }}
            >
                Adicionar prévia
            </button>
            <button className="button" onClick={removeHotspot()}>
                Remover
            </button>

			<hr />
        </details>
    );
}