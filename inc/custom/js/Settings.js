

let { panorama, minimap } = getConfig();

const Settings = ({ update }) => {

    const editSetting = () => event => {
        const prop = event.target.getAttribute("setting");
        const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    
        panorama[prop] = value;

        update({
            panorama: panorama,
            minimap: minimap
        });
    }

    return (
        <>
            <input 
                defaultChecked={panorama.enableMobileFullscreen}
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
                defaultChecked={panorama.enableFadeAnimation}
                type="checkbox" 
                id="panorama-enable-fade-anim" 
                name="panorama-enable-fade-anim"
                setting="enableFadeAnimation"
                onChange={editSetting()}
            />
            <label for="panorama-enable-fade-anim">
                Habilitar animação de transição
            </label>
        </>
    );
}