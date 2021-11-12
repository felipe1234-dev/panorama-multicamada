<?php
/**
 * Plugin name: Plugin Panoramas Multicamadas
 * Description: Adiciona widget de panorama no elementor. Correção de bugs, estouro de memória, código refeito e reorganizado, com novas funcionalidades no editor. Inspirado e trbalhado por cima do projeto de jvcalassio (a página dele: https://jvcalassio.github.io), dê um olá para ele e aproveita também para acessar a minha página!
 * Version: 1.2
 * Author: felipe-alves-dev
 * Author URI: https://felipe1234-dev.github.io/felipe-portfolio/
 */

require("main.php");

function load_default_files() {
    wp_enqueue_media();

    // carregando o pannellum
    wp_enqueue_style(
        "pannellum-style", 
        plugin_dir_url(__FILE__ )."inc/pannellum@2.5.6/pannellum.css", 
        false, "2.5.6", false
    );
    wp_enqueue_script(
        "pannellum-script", 
        plugin_dir_url(__FILE__)."inc/pannellum@2.5.6/pannellum.js", 
        false, "2.5.6", false
    );

    // carregando o react
    wp_enqueue_script(
        "react-dom", 
        plugin_dir_url(__FILE__)."inc/react@17.0.2/react-dom.development.js", 
        false, "17.0.2", true
    );
    wp_enqueue_script(
        "react", 
        plugin_dir_url(__FILE__)."inc/react@17.0.2/react.development.js", 
        false, "17.0.2", true
    );

    // carregando o babel
    wp_enqueue_script(
        "babel", 
        plugin_dir_url(__FILE__)."inc/babel@7.15.8/babel.min.js", 
        false, "7.15.8", true
    );
}

function load_admin_files() {
    load_default_files();

    // carregando os estilos próprios dos editores
    wp_enqueue_style(
        "scenes-editor", 
        plugin_dir_url(__FILE__ )."inc/custom/css/scenes-editor.css", 
        false, "1.7", false
    );
    wp_enqueue_style(
        "hotspots-editor", 
        plugin_dir_url(__FILE__ )."inc/custom/css/hotspots-editor.css", 
        false, "1.4", false
    );
    wp_enqueue_style(
        "day-toggler", 
        plugin_dir_url(__FILE__ )."inc/custom/css/day-toggler.css", 
        false, "1.1", false
    );
    wp_enqueue_style(
        "minimap-editor", 
        plugin_dir_url(__FILE__ )."inc/custom/css/minimap-editor.css", 
        false, "1.0", false
    );
	wp_enqueue_style(
        "overlay-editor", 
        plugin_dir_url(__FILE__ )."inc/custom/css/overlay-editor.css", 
        false, "1.3", false
    );
	
	wp_enqueue_script(
        "panorama-plugin-config", 
        plugin_dir_url(__FILE__)."inc/custom/js/config.js", 
        false, "1.1", false
    );
	wp_enqueue_script(
        "panorama-help-functions", 
        plugin_dir_url(__FILE__)."inc/custom/js/help-functions.js", 
        false, "1.5", false
    );
	wp_enqueue_script(
        "panorama-hotspots-editor", 
        plugin_dir_url(__FILE__)."inc/custom/js/HotSpotsEditor.js", 
        false, "1.6", true
    );
	wp_enqueue_script(
        "panorama-minimap-editor", 
        plugin_dir_url(__FILE__)."inc/custom/js/MinimapEditor.js", 
        false, "1.1", true
    );
	wp_enqueue_script(
        "panorama-scenes-editor", 
        plugin_dir_url(__FILE__)."inc/custom/js/ScenesEditor.js", 
        false, "1.7", true
    );
	wp_enqueue_script(
        "panorama-overlay-editor", 
        plugin_dir_url(__FILE__)."inc/custom/js/OverlayEditor.js", 
        false, "1.0", true
    );
	wp_enqueue_script(
        "panorama-settings-editor", 
        plugin_dir_url(__FILE__)."inc/custom/js/Settings.js", 
        false, "1.0", true
    );
	wp_enqueue_script(
        "panorama-editor-starter", 
        plugin_dir_url(__FILE__)."inc/custom/js/editor-starter.js", 
        false, "1.3", true
    );
}

function add_type_attribute($tag, $id, $src) {
	switch ($id) {
		case "panorama-plugin-config":
		case "panorama-help-functions":
		case "panorama-hotspots-editor":
		case "panorama-minimap-editor":
		case "panorama-scenes-editor":
		case "panorama-overlay-editor":
		case "panorama-settings-editor":
		case "panorama-editor-starter":
			$tag = '<script id="'.$id.'" type="text/babel" src="'.esc_url($src).'"></script>';
			break;
		case "pannellum-css":
		case "pannellum-js":
			// para caso o plugin original esteja instalado 
			$tag = "";
			break;
		default:
			break;
	}

    return $tag;
}
add_filter("script_loader_tag", "add_type_attribute", 10, 3);

function load_production_files() {
    load_default_files();

    wp_enqueue_style(
        "panorama-style", 
        plugin_dir_url(__FILE__ )."inc/custom/css/panorama.css", 
        false, "2.4", false
    );
}

add_action("admin_enqueue_scripts", "load_admin_files");
add_action("wp_enqueue_scripts", "load_production_files");

function pano_start() { 
    setup_post_type(); 
    flush_rewrite_rules(); 
}
register_activation_hook(__FILE__, "pano_start");

function create_panorama($atts) {
    global $post;
	
	$short = shortcode_atts(array(
    	/*'dia-id' => '',
        'noite-id' => '',
        'antes-id' => '',
        'depois-id' => '',*/
		"id"        => "",
        "largura" 	=> "100%",
        "altura" 	=> "400px"
    ), $atts);

    if (is_page()) {
		$pano = new WP_Query(array(
        	"post_type" => "panorama multicamada",
            "post__in" 	=> array(
            	intval($short["id"])
           	)
 		));
		
        ob_start();
		
		while($pano->have_posts()) {
            global $post;
           	$pano->the_post();
            $pano_id = get_the_ID();

			$pano_config = json_decode(get_post_meta($pano_id, "panorama_config", true), false);
			$mini_config = json_decode(get_post_meta($pano_id, "minimap_config", true), false);

        ?>
<style type="text/css">
    #panorama-<?php echo $pano_id; ?> {
        width: <?php echo $short["largura"]; ?>;
        height: <?php echo $short["altura"]; ?>;
    }

    .minimap-item.active {
        background-image: url("<?php echo plugin_dir_url(__FILE__)."inc/media/green.png?v=2"; ?>");
    }

	.minimap-item {
        background-image: url("<?php echo plugin_dir_url(__FILE__)."inc/media/blue.png?v=2"; ?>");
	}
	
    .pano-minimap:not(.big) .minimap-item {
        width: <?php echo $mini_config->itemsWidth ? $mini_config->itemsWidth : "3.047%"; ?>;
        height: <?php echo $mini_config->itemsHeight ? $mini_config->itemsHeight : "4.14%"; ?>
    }
	
	.pano-minimap.big .minimap-item {
        width: <?php echo $mini_config->itemsWidthOpen ? $mini_config->itemsWidthOpen : "1.047%"; ?>;
        height: <?php echo $mini_config->itemsHeightOpen ? $mini_config->itemsHeightOpen : "4.14%"; ?>;
    }

    .custom-tooltip::after {
        background-image: url("<?php echo plugin_dir_url(__FILE__)."inc/media/arrow.png?v=2"; ?>");
    }

    <?php 
        if ($pano_config->overlay->enable) {
            ?>.panorama-overlay {
        background-image: url("<?php echo $pano_config->overlay->imgUrl; ?>");
    }
            <?php
        }
    ?>
</style>
<div class="panorama-widget">
    <?php 
        if ($pano_config->overlay->enable) {
            ?>
    <div class="panorama-overlay"></div>
            <?php
        }
    ?>
    <div id="pano-container-<?php echo $pano_id; ?>"></div>
	
	<textarea id="panorama-config" style="display:none;">
		<?php echo get_post_meta($pano_id, "panorama_config", true); ?>
	</textarea>
	<textarea id="minimap-config" style="display:none;">
		<?php echo get_post_meta($pano_id, "minimap_config", true); ?>
	</textarea>
</div>

<script type="text/babel">
	const panoConfig = document.querySelector("#panorama-config");
	const miniConfig = document.querySelector("#minimap-config");

	const JSONstrCallback = (key, value) => key === "createTooltipFunc" ? value.toString() : value;
	const JSONparsCallback = (key, value) => key === "createTooltipFunc" ? eval(`(${value})`) : value;

	let CONFIG = JSON.parse(panoConfig.value, JSONparsCallback);
	let MINIMAP = JSON.parse(miniConfig.value, JSONparsCallback);
	
	const getLayersIds = p => {
		let ids = [];

		Object.keys(CONFIG[p].scenes).forEach(sceneId => {
			if (!ids.includes(CONFIG[p].scenes[sceneId].layerId)) {
				ids.push(CONFIG[p].scenes[sceneId].layerId);
			}
		});

		ids = ids.sort();

		return ids;
	}
	
	const getLayerIndex = (searchId, period) => {
		let index;

		getLayersIds(period).some((id, i) => {
			if (searchId == id) {
				index = i;
				return;
			}
		});

		return index;
	}
	
	let pano;
	
	const Buttons = ({ sel, onPeriodChange }) => {
		const BUTTONS = [
			{
				src: "<?php echo plugin_dir_url( __FILE__)."inc/media/day_icon.png"; ?>",
				period: "day",
				selected: sel === "day"
			},
			{
				src: "<?php echo plugin_dir_url( __FILE__)."inc/media/night_icon.png"; ?>",
				period: "night",
				selected: sel === "night"
			}
		];
	
		return (
			<div className="panorama-buttons">
				{BUTTONS.map(({ src, period, selected }) => (
					periods.includes(period) ?
						<button 
							className={`panorama-toggle-button${selected ? " selected" : ""}`} 
							id="panorama-period-toggler-<?php echo $pano_id; ?>" period={period}
							onClick={() => onPeriodChange(period)}
						>
							<img src={src} alt={`Alternar para ${period == "day" ? "dia" : "noite"}`} />
						</button>
					: null
				))}
        	</div>
		);
	}
	
	const Minimap = ({ big, setBig, layerIndex }) => {
		const [ratio, setRatio] = React.useState(0);
		
		React.useEffect(() => {
			const img = new Image();
    		img.src = MINIMAP.layers[layerIndex].imgUrl + "?_=" + (new Date()).getTime();
			
			img.onload = function() {
				setRatio(this.width/this.height);
			}
		}, [layerIndex]);
		
		const loadScene = sceneId => {
			pano.loadScene(sceneId);
			setBig(false);
		}
		
		const changeLayer = newLayer => {
			pano.loadScene(MINIMAP.layers[newLayer].items[0].sceneId);
			setBig(false);
		}
		
		return (
			<>
				<style type="text/css">{`
					.pano-minimap { 
						max-width: ${MINIMAP.width};
					} 

					@media (max-width: 576px) { 
						.pano-minimap { 
							max-width: ${MINIMAP.mobileWidth};
						} 
						
						.pano-minimap.big {
							max-width: 100% !important;
						}
					} 

					.pano-minimap.big {
						width: ${MINIMAP.widthOpen};
						max-width: ${MINIMAP.widthOpen} !important;
					}

					.pano-minimap.big {
						left: 50%; 
						bottom: 50%;
						transform: translate(-50%, 50%);
					}`}
				</style>
				<div 
					onClick={() => setBig(!big)} 
					className={`pano-minimap-exit${big ? " show" : ""}`}
				></div>
				<div 
					className={`pano-minimap${big ? " big" : ""}`} 
					onClick={() => setBig(!big)}
				>
					<div className="pano-layers-selector">
						{MINIMAP.layers.map((layer, i) => (
							<button 
								className={layerIndex == i ? "selected" : ""} 
								onClick={() => changeLayer(i)}
							>
								Pav. {i + 1}
							</button>
						))}
					</div>
					<div className="pano-minimap-portrait">
						<img 
							src={MINIMAP.layers[layerIndex].imgUrl} 
							alt={`Minimapa do pavimento ${layerIndex + 1}`}
						/>
						{MINIMAP.layers[layerIndex].items.map(({ id, x, y, sceneId }) => {
							const isMobile = window.outerWidth < 576;
							let miWidthPercent;
							
							if (!big) {
								miWidthPercent = isMobile ? MINIMAP.mobileWidth : MINIMAP.width;
							}
							else {
								miWidthPercent = isMobile ? "100%" : MINIMAP.widthOpen;
							}
							
							const miWidth = parseFloat(miWidthPercent)/100 * window.outerWidth;
							
							// ratio = miWidth/miHeight
							// miHeight = miWidth/(miWidth/miHeight)
							// miHeight = miWidth*(miHeight/miWidth)
							// miHeight = miWidth*miHeight/miWidth
							// miHeight = miHeight
							
							const miHeight = miWidth/ratio;
							
							const selectorHeight = 40; // px
							
							// miHeight*parseFloat(y)/100 + selectorHeight = newY*(miHeight + selectorHeight)
							
							const newY = ( parseFloat(y)/100 * miHeight + selectorHeight)/(miHeight + selectorHeight);
							
							return (
								<span 
									className={`minimap-item${pano.getScene() == sceneId ? " active" : ""}`} 
									style={{ left: `${x}%`, top: `${newY*100}%` }} 
									onClick={() => loadScene(sceneId)}
								></span>
							);
						})}
					</div>
				</div>
			</>
		);
	}
	
	let periods = ["day", "night"];
	
	periods.forEach((p, i) => {
		const scenes = Object.keys(CONFIG[p].scenes);
		
		if (scenes.length < 1) {
			periods.splice(i, 1);
		}
		
		scenes.forEach(sceneId => {
			CONFIG[p].scenes[sceneId].hotSpotDebug = false; 
			// se colocado como verdadeiro, o cursor vira uma cruz e fica feio
			
			CONFIG[p].scenes[sceneId].hotSpots.forEach((spot, i) => {
				const args = CONFIG[p].scenes[sceneId].hotSpots[i].createTooltipArgs;
				CONFIG[p].scenes[sceneId].hotSpots[i].createTooltipArgs = args.replace(/Hotspot \d+/g, "");
				// é ideal que esse texto apareça apenas no editor
				// pois ele é genérico, ex: "Hotspot 1"
			});
			
			if (CONFIG.enableFadeAnimation) {
				CONFIG[p].default.sceneFadeDuration = 1000;	
			}
		});
	});
	
	console.log(CONFIG);
	console.log(MINIMAP);
	
	const isFullscreen = () => {
		const btn = document.querySelector(".pnlm-fullscreen-toggle-button");
		return btn.classList.contains("pnlm-fullscreen-toggle-button-active");
	}
	
	const Panorama = () => {
		const [panoLoaded, setPanoLoaded] = React.useState(false);
		const [period, setPeriod] = React.useState("");
		const [miOpen, setMiOpen] = React.useState(false);
		const [layerIndex, setLayerIndex] = React.useState(0);
		const [scene, setScene] = React.useState("");
		
		React.useEffect(() => {
			pano = pannellum.viewer("panorama-<?php echo $pano_id; ?>", CONFIG[periods[0]]);
			setPeriod(periods[0]);
			
			const firstScene = CONFIG[periods[0]].default.firstScene;
			const firstLayer = CONFIG[periods[0]].scenes[firstScene].layerId;
			
			setLayerIndex(getLayerIndex(firstLayer, periods[0]));
			setScene(firstScene);
		}, []);
		
		React.useEffect(() => {			
			pano.on("load", () => setPanoLoaded(true));
			pano.on("scenechange", newScene => {
				// por alguma razão misteriosa, o pannellum não deixa a 
				// a gente usar a propriedade "scenes" por aqui (e nem outra)!
				// então, fiz a mudança de camadas no Minimap
				// abri um issue no repositório deles, link: https://github.com/mpetroff/pannellum/issues/1044
				
				setScene(newScene);
			});
		}, [panoLoaded]);
		
		React.useEffect(() => {
			if (scene) {
				const sceneLayer = pano.getConfig().layerId;
				setLayerIndex(getLayerIndex(sceneLayer, period));
			}
		}, [scene]);
		
		const onPeriodChange = newPeriod => {
			const isFull = isFullscreen();
								
			pano.off("scenechange");
			
			//const reactControls = document.querySelector("#panorama-<?php echo $pano_id; ?> #custom-controls");
			//reactControls.parentElement.removeChild(reactControls);
			
			//pano.destroy();
			
			pano = pannellum.viewer("panorama-<?php echo $pano_id; ?>", CONFIG[newPeriod]);
			pano.setFullscreen(isFull);
								
			setPanoLoaded(false);		
			setPeriod(newPeriod);
		}
	
		return (
			<div id="panorama-<?php echo $pano_id; ?>">
				{panoLoaded && (
					<div id="custom-controls">
						<Buttons
							sel={period}
							onPeriodChange={onPeriodChange}
						/>
						<Minimap
							big={miOpen}
							setBig={setMiOpen}
							layerIndex={layerIndex}
						/>
					</div>
				)}
			</div>
		);
	}
	
	ReactDOM.render(<Panorama />, document.querySelector("#pano-container-<?php echo $pano_id; ?>"));
</script>

<script type="text/javascript">
    (function() {
        <?php 
            if ($pano_config->overlay->enable) { 
        ?>
        document.querySelector(".panorama-overlay").addEventListener("click", () => {
                
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            
            if (isIOS) {
                document.querySelector(".panorama-overlay").style.display = "none";
            } 
            else {
                pano.toggleFullscreen();
            }
            
        });
        <?php
            }
        ?>
		
    })();
</script>
<?php
		}
		
        wp_reset_postdata();
        return ob_get_clean();
    }
}

add_shortcode("panorama-multicamada", "create_panorama");

function add_id_column($columns) {
    $columns["multi_pano_pid"] = "ID";
    return $columns;
}
add_action("manage_posts_columns", "add_id_column");

function add_id_value($column, $post_id) {
    if($column == "multi_pano_pid") {
        echo $post_id;
    }
}
add_action("manage_posts_custom_column", "add_id_value", 10, 2);

function add_shortcode_column($columns) {
    $columns["shortcode"] = "Shortcode";
    return $columns;
}
add_action("manage_posts_columns", "add_shortcode_column");

function add_shortcode_value($column, $post_id) {
    if($column == "shortcode") {
        echo "[panorama-multicamada id='$post_id' largura='100%' altura='400px']";
    }
}
add_action("manage_posts_custom_column", "add_shortcode_value", 10, 2);
