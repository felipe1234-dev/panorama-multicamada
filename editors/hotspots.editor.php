<?php

function add_hot_spots_editor() {
    add_meta_box(
        "pano-hotspots",
        "Hotspots",
        "initiate_hotspots_editor",
        "panorama multicamada",
        "advanced",
        "default"
    );
}
add_action("add_meta_boxes", "add_hot_spots_editor");

function initiate_hotspots_editor($post) {
    ?>

<div id="hotspots-editor"></div>

<style type="text/css">
    /*.panorama-overlay {
        background-image: url("<?php echo str_replace("/editors", "", plugin_dir_url( __FILE__ ))."inc/media/360_icon.png?v=1"; ?>");
    }*/

    .custom-tooltip::after {
        background-image: url("<?php echo str_replace("/editors", "", plugin_dir_url( __FILE__ ))."inc/media/arrow.png?v=1"; ?>");
    }
</style>
    <?php
}


?>