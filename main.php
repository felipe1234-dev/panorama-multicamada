<?php 

require_once("editors/scenes.editor.php");
require_once("editors/hotspots.editor.php");
require_once("editors/minimap.editor.php");
require_once("editors/settings.editor.php");
require_once("editors/overlay.editor.php");

function setup_post_type() {
    $labels = array(
        "name"                  => "Panoramas Multicamadas",
        "singular_name"         => "Panorama Multicamada",
        "add_new"               => "Adicionar Novo",
        "add_new_item"          => "Adicionar Novo Panorama",
        "edit_item"             => "Editar Panorama",
        "new_item"              => "Novo Panorama",
        "view_item"             => "Ver Panorama",
        "search_items"          => "Procurar Panorama",
        "not_found"             => "Nenhum panorama encontrado",
        "not_found_in_trash"    => "Nenhum panorama encontrado na lixeira",
        "parent_item_colon"     => "",
        "attributes"            => "Atributos do Panorama",
        "all_items"             => "Todos os Panoramas"
    );

    register_post_type(
        "panorama multicamada",
        [
            "label"                 => "Panoramas Multicamadas",
            "labels"                => $labels,
            "public"                => true,
            "exclude_from_search"   => true,
            "publicly_queryable"    => true,
            "show_ui"               => true,
            "menu_icon"             => "dashicons-excerpt-view",
            "query_var"             => true,
            "taxonomies"            => [],
            "rewrite"               => array(
                "slug"          => "multi-panorama", 
                "with_front"    => false
            ),
            "capability_type"       => "post",
            "hierarchical"          => false,
            "menu_position"         => null,
            "supports"              => array("title")
        ]
    );
}
add_action("init", "setup_post_type");

?>