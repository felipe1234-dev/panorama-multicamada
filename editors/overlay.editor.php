<?php
function add_overlay_editor() {
    add_meta_box(
        "pano-overlay",
        "Imagem de Overlay",
        "initiate_overlay_editor",
        "panorama multicamada",
        "advanced",
        "core"
    );
}
add_action("add_meta_boxes", "add_overlay_editor");

function initiate_overlay_editor($post) {
    ?>
<div id="overlay-editor"></div>
<style type="text/css">
	.fake-background {
		background-image: url("<?php echo str_replace("/editors", "", plugin_dir_url( __FILE__ )).'inc/media/fake_background.png?v=1'; ?>");
	}
</style>
    <?php
}
?>