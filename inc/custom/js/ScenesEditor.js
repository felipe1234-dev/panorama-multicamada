let { panorama, minimap } = getConfig();

const ScenesEditor = ({ update }) => {
	
	const addLayer = () => event => {
		event.preventDefault();
		
        let customUploader;
        
        if (customUploader) {
            customUploader.open();
            return;
        }
        
        const uploader = {
            config: {
                title: 
                    `Selecione as imagens para compor as cenas da nova camada`,
                library: { 
                    type: [ "image" ] 
                },
                button: { 
                    text: "Selecionar"
                },
                multiple: true
            },
            onSelect: () => {
                const attachments = customUploader.state().get("selection").toJSON();
				
                attachments.map(({ type, url, id: imgId, title }) => {
                    if (type === "image") {
                        let newImg = {
                            type: "equirectangular",
                            panorama: url,
                            hotSpotDebug: true,
                            title: title,
                            imgId: imgId,
                            imgSrc: url,
                            layerId: getNewId("layers"),
                            hotSpots: []
                        }
                        
                        panorama[theme].scenes[imgId] = newImg;
						
						if (getLayers().length < 1) {
							panorama[theme].default.firstScene = imgId;
						}
						
						minimap.layers.push({
							imgUrl: minimap.layers[minimap.layers.length - 1].imgUrl,
							items: []
						});
                    }
                });
                
                update({ panorama: panorama, minimap: minimap }, true);
            }
        }

        customUploader = wp.media(uploader.config).on("select", uploader.onSelect).open();
	}

    return (
        <>
            {getLayers().length < 1 ? <p>Não há camadas no seu panorama, adicione no botão abaixo</p> : (
                getLayers().map((layer, i) => (
                    <Layer {...layer} i={i} />
                ))
            )}

            <div style={{ display: "flex", alignItems: "center" }}>
                <a
                    href="#" onClick={addLayer()}
                    add-layer="true" className="button button-primary button-large"
                >
                    Adicionar camada
                </a>
            </div>
        </>
    );
}

const Layer = ({ id: layerId, scenes, i: layerIndex }) => {
	
	const addScenes = () => event => {
        event.preventDefault();
		
        let customUploader;
        
        if (customUploader) {
            customUploader.open();
            return;
        }
        
        const uploader = {
            config: {
                title: 
                    `Selecione as imagens para compor as cenas da camada ${layerIndex + 1} do seu panorama`,
                library: { 
                    type: [ "image" ] 
                },
                button: { 
                    text: "Selecionar"
                },
                multiple: true
            },
            onSelect: () => {
                const attachments = customUploader.state().get("selection").toJSON();
				
                attachments.map(({ type, url, id: imgId, title }) => {
                    if (type === "image") {
                        let newImg = {
                            type: "equirectangular",
                            panorama: url,
                            hotSpotDebug: true,
                            title: title,
                            imgId: imgId,
                            imgSrc: url,
                            layerId: layerId,
                            hotSpots: []
                        }
                        
                        panorama[theme].scenes[imgId] = newImg;
                    }
                });
                
                update({ panorama: panorama, minimap: minimap }, true);
            }
        }

        customUploader = wp.media(uploader.config).on("select", uploader.onSelect).open();
    }
	
    const setAsFirst = sceneId => event => {
        panorama[theme].default.firstScene = sceneId;

        update({ panorama: panorama, minimap: minimap });
    } 
	
	const deleteScene = sceneId => event => {
        delete panorama[theme].scenes[sceneId];

        update({ panorama: panorama, minimap: minimap });
    } 

    const deleteLayer = () => event => {
        event.preventDefault();
    
        getScenes().forEach(({ layerId: sceneLayer, imgId }) => {
            if (sceneLayer == layerId) {
                delete panorama[theme].scenes[imgId];
            }
        });
    
        // apagar no minimapa também
        minimap.layers.splice(layerIndex, 1);
    
        update({ panorama: panorama, minimap: minimap });
    }

    const { firstScene } = panorama[theme].default;

    return (
        <div layer-id={layerId} className="layer">
            <header className="layer-header">
                <h3>Camada {layerIndex + 1}</h3>
                <a 
                    href="#" onClick={addScenes()} add-scenes="true"
                    className="button button-primary button-large"
                >
                    Adicionar Cenas
                </a>
                <a
                    href="#" onClick={deleteLayer()}
                    className="button button-primary button-large"
                    delete-layer="true"
                >
                    Deletar Camada
                </a>
            </header>
            <section className="layer-scenes">
                {scenes.map(({ title, imgId, imgSrc }, i) => (
                    <div className="container">
                        <img 
                            src={imgSrc}
                            className={`scenes-img${firstScene == imgId ? " first-scene" : ""}`} 
                            img-id={imgId}
                            alt={title}
                        />
                        <span className="center">
                            <button 
								className="button button-primary"
								disabled={firstScene == imgId}
								onClick={setAsFirst(imgId)}
							>
								{firstScene == imgId ? "Já é a primeira" : "Tornar primeira"}
							</button>
							 <button 
								className="button button-primary"
								disabled={firstScene == imgId}
								onClick={deleteScene(imgId)}
								delete-scene="true"
							>
								Deletar cena
							</button>
                        </span>
                    </div>
                ))}
            </section>
            <hr />
        </div>
    );
}