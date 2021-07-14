sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
    "use strict";

    var BOQItemsTable = BlockBase.extend("com.agel.mmts.unloadmaterial.view.blocks.UnloadMaterial.outerPackaging.OuterPackaging", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.unloadmaterial.view.blocks.UnloadMaterial.outerPackaging.OuterPackaging",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.unloadmaterial.view.blocks.UnloadMaterial.outerPackaging.OuterPackaging",
                    type: "XML"
                }
            },
             events: {
                 "OnViewQRCodePress":{}//venkatesh
			}
        }
    });

    return BOQItemsTable;
});