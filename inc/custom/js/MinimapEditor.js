let { panorama, minimap } = getConfig();
const theme = getTheme();

const MinimapEditor = () => {
    const [layerIndex, setLayerIndex] = React.useState(0);

    const addMiItem = i => event => {
        const img = event.target;
    
        let xPx = event.pageX - getOffset(img).left - 10,
            yPx = event.pageY - getOffset(img).top - 10;
    
        let x = (xPx*100)/img.getBoundingClientRect().width,
            y = (yPx*100)/img.getBoundingClientRect().height;
    
        minimap.layers[layerIndex].items.push({
            id: getNewId("mi-item", layerIndex),
            layerId: layerIndex + 1,
            x: x,
            y: y,
            sceneId: panorama[theme].default.firstScene
        });
    
        update({ panorama: panorama, minimap: minimap });
    }
	
	const addMinimap = () => event => {
		event.preventDefault();

		let customUploader;

		if (customUploader) {
			customUploader.open();
			return;
		}
	
		const uploader = {
			config: {
				title: `Selecione a imagem da planta para a camada ${layerIndex}`,
				library: {
					type : ['image']
				},
				button: {
					text: 'Selecionar'
				},
				multiple: false
			},
			onSelect: () => {
				let attachment = customUploader.state().get("selection").first().toJSON();

				minimap.layers[layerIndex].imgUrl = attachment.url;

				update({ panorama: panorama, minimap: minimap });
			}
		}
		
		customUploader = wp.media(uploader.config).on("select", uploader.onSelect).open();
	}

    return (
        <>
            {getScenes().length < 1 ? <p>Você ainda não adicionou camadas!</p> : (
                <select
                    id="layer-selector" name="layer-selector"
                    onChange={e => setLayerIndex(e.target.value)}
                >
                    {getLayers().map((layer, i) => (
                        <option value={i} selected={i == layerIndex}>
                            Camada {i + 1}
                        </option>
                    ))}
                </select>
            )}
            
            <div className="minimap-wrapper">
                <div className="minimap-wrapper-img" onClick={addMiItem(layerIndex)}>
                    <img 
                        src={minimap.layers[layerIndex].imgUrl} 
                        alt="Minimapa do panorama" 
                        className="minimap-img" 
                    />
                    {minimap.layers[layerIndex].items.map(({ id, x, y }) => (
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
                {minimap.layers[layerIndex].items.map((item, i) => (
                    <MiListItem layerIndex={layerIndex} itemIndex={i} { ...item } />
                ))}
            </div>

            <div className="minimap-settings">
				<hr />

                <MiSettings />
				
				<br />
                
				<a 
					href="#" className="button button-primary button-large" 
					add-minimap="true" onClick={addMinimap(layerIndex)}
					style={{ marginTop: "10px" }}
				>
					Modificar planta 
				</a>
            </div>
        </>
    );
}

const MiListItem = ({ id, x, y, sceneId: itemScene, layerId, layerIndex, itemIndex }) => {
   
    const editMiItem = () => event => {
        const prop = event.target.getAttribute("property");
        const value = event.target.value;
    
        minimap.layers[layerIndex].items[itemIndex][prop] = value;
    
        update({ panorama: panorama, minimap: minimap });
    }
    
    
    const removeMiItem = () => event => {
        event.preventDefault();
        
        minimap.layers[layerIndex].items.splice(itemIndex, 1);
    
        update({ panorama: panorama, minimap: minimap });
    }

    return (
        <div className="minimap-list-item" id={`mi-${id}`}>
            #{id}
                            
            <input 
                type="text" value={x}
                name="minimap-item x" 
                placeholder="X (em %)"
                property="x" onChange={editMiItem()}
            /> 
                            
            <input 
                type="text" value={y}
                name="minimap-item y" 
                placeholder="Y (em %)"
                property="y" onChange={editMiItem()}
            /> 

            <select 
                id={`mi-items-${id}`} name={`mi-items-${id}`}
                property="sceneId" onChange={editMiItem()}
            >
                {getScenes().map(({ imgId, title }) => (
                    <option 
                        selected={itemScene == imgId}
                        value={imgId}
                    >
                        {title}
                    </option>   
                ))}
            </select> 
                            
            <button 
                className="button" remove-mi-item="true"
                onClick={removeMiItem()}
            >
                Remover
            </button> 
        </div>
    );
}


const MiSettings = () => {
    const editMiSetting = () => event => {
        const prop = event.target.getAttribute("setting");
        const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    
        minimap[prop] = value;
        
        update({ panorama: panorama, minimap: minimap });
    }
    
    return (
        <>
            <label for="minimap-width">
                Largura da imagem:
            </label>
            <input 
                id="minimap-width" 
                name="minimap-width" 
                type="text" 
                placeholder="Largura da planta no panorama" 
                value={minimap.width}
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
                value={minimap.widthOpen}
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
                value={minimap.mobileWidth}
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
                value={minimap.itemsWidthOpen}
                style={{ margin: "10px 5px" }}
                setting="itemsWidthOpen"
                onChange={editMiSetting()}
            />
            <input 
                id="minimap-items-height-open" 
                name="minimap-items-height-open" 
                type="text" 
                placeholder="Altura dos itens (bolinhas) do minimapa aberto" 
                value={minimap.itemsHeightOpen}
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
                value={minimap.itemsWidth}
                style={{ margin: "10px 5px" }}
                setting="itemsWidth"
                onChange={editMiSetting()}
            />
            <input 
                id="minimap-items-height" 
                name="minimap-items-height" 
                type="text" 
                placeholder="Altura dos itens (bolinhas) do minimapa minimizado" 
                value={minimap.itemsHeight}
                style={{ margin: "10px 5px" }}
                setting="itemsHeight"
                onChange={editMiSetting()}
            />
                    
            <br />

            <input 
                defaultChecked={minimap.show}
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
    );
}