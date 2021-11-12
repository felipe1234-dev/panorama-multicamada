<?php 

function add_settings() {
    add_meta_box(
        "settings-container",
        "Configurações Gerais",
        "initiate_day_toggler",
        "panorama multicamada",
        "advanced",
        "high"
    );
}
add_action("add_meta_boxes", "add_settings");

function initiate_day_toggler($post) {
    ?>
    <p>ID: <?php echo $post->ID; ?></p>
	<p>SHORTCODE: [panorama-multicamada id='<?php echo $post->ID; ?>' largura='100%' altura='500px']</p>
	<hr />

    <div id="settings"></div>

	Noite
    <label class="switch">
        <input type="checkbox" name="day-toggler" id="day-toggler" checked>
        <span class="slider round"></span>
    </label>
	Dia

    <textarea id="panorama-config" name="panorama-config" style="display: none;">
<?php 
	$config = get_post_meta($post->ID, "panorama_config", true);
	echo $config != "" ? $config : '{
        "day": {
            "default": {
                "firstScene": null, 
                "autoLoad": true
            },
            "scenes": {}
        }, 
        "night": {
            "default": {
                "firstScene": null, 
                "autoLoad": true
            },
            "scenes": {}
        },
        "overlay": {
            "enable": true,
            "imgUrl": "'.str_replace("/editors", "", plugin_dir_url( __FILE__ )).'inc/media/360_icon.png?v=1"
        },
        "enableMobileFullscreen": true,
		"enableFadeAnimation": true
    }'; 
?></textarea>
    <?php
}

function save_panorama($post_id) {
    if (array_key_exists("panorama-config", $_POST)) {

        delete_post_meta($post_id, "panorama_config");

        update_post_meta(
            $post_id,
            "panorama_config",
            sanitize_text_field($_POST["panorama-config"])
        );

    }
}
add_action("save_post", "save_panorama");

?>