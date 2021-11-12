<?php

    function add_scenes_editor() {
        add_meta_box(
            "pano-scenes",
            "Cenas",
            "initiate_scenes_editor",
            "panorama multicamada",
            "advanced",
            "core"
        );
    }
    add_action("add_meta_boxes", "add_scenes_editor");

    function initiate_scenes_editor($post) {
        ?>
<div id="scenes-editor"></div>
        <?php
    }

?>