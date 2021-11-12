<?php

function add_minimap_editor() {
    add_meta_box(
        "pano-minimap",
        "Minimapa",
        "initiate_minimap_editor",
        "panorama multicamada",
        "advanced",
        "low"
    );
}
add_action("add_meta_boxes", "add_minimap_editor");

function initiate_minimap_editor($post) {
    ?>

<div id="minimap-editor"></div>

<textarea id="minimap-config" name="minimap-config" style="display:none;">
<?php 
	$config = get_post_meta($post->ID, "minimap_config", true);
	echo $config != "" ? $config : '{
        "layers": [
            {
                "imgUrl": "'.str_replace("/editors", "", plugin_dir_url( __FILE__ )).'inc/media/fake_background.png?v=1", 
                "items": []
            }
        ],
        "show": true, 
        "width": "20%", 
        "mobileWidth": "50%", 
        "widthOpen": "70%",
		"itemsWidthOpen": "1.047%",
		"itemsHeightOpen": "4.14%",
		"itemsWidth": "3.047%",
		"itemsHeight": "4.14%"
    }'; 
?></textarea>

    <?php
}

function save_minimap($post_id) {
    if (array_key_exists("minimap-config", $_POST)) {
        delete_post_meta($post_id, "minimap_config");

        add_post_meta(
            $post_id, 
            "minimap_config", 
            sanitize_text_field($_POST["minimap-config"]), 
            false
        );
    }
}
add_action("save_post", "save_minimap");

?>