sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
    "use strict";

    var InnerPackagingTable = BlockBase.extend("com.agel.mmts.unloadmaterial.view.blocks.UnloadMaterial.innerPackaging.InnerPackaging", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.unloadmaterial.view.blocks.UnloadMaterial.innerPackaging.InnerPackaging",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.unloadmaterial.view.blocks.UnloadMaterial.innerPackaging.InnerPackaging",
                    type: "XML"
                }
            },
             events: {
                 "OnViewQRCodePress":{},
                //  "OnMapVendorQRSuccess":{},
                //  "OnMapVendorQRFail":{}
			}
        }
    });

    return InnerPackagingTable;
});