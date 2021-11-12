let { panorama, minimap } = getConfig();

const OverlayEditor = ({ update }) => {

    const enableOverlay = () => event => {
        const value = event.target.checked;
    
        panorama.overlay.enable = value;
        
        update({ panorama: panorama, minimap: minimap });
    }

    const changeOverlayImg = () => event => {
        event.preventDefault();

		let customUploader;

		if (customUploader) {
			customUploader.open();
			return;
		}
	
		const uploader = {
			config: {
				title: `Selecione a imagem de overlay do panorama`,
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

				panorama.overlay.imgUrl = attachment.url;

				update({ panorama: panorama, minimap: minimap });
			}
		}
		
		customUploader = wp.media(uploader.config).on("select", uploader.onSelect).open();
    }

    return (
        <>
            <div className="fake-background">
                <style type="text/css">{`
                    .panorama-overlay {
                        background-image: url("${panorama.overlay.imgUrl}");
                    }
                `}</style>
                <div className="panorama-overlay"></div>
            </div>
            <button
                className="button button-primary" 
                onClick={changeOverlayImg()}
            >
                Mudar imagem
            </button>

            <hr />
            
            <label for="enable-overlay">
                Habilitar overlay:
            </label>
            <input 
                id="enable-overlay" 
                name="enable-overlay" 
                type="checkbox" 
                checked={panorama.overlay.enable}
                style={{ margin: "10px 5px" }}
                onChange={enableOverlay()}
            />
        </>
    );
}
