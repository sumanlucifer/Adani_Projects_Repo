sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
    "use strict";

    var SOWFormBlock = BlockBase.extend("com.agel.mmts.vendorPersona.view.blocks.poDetails.sowForm.SOWForm", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.vendorPersona.view.blocks.poDetails.sowForm.SOWForm",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.vendorPersona.view.blocks.poDetails.sellesowFormrForm.SOWForm",
                    type: "XML"
                }
            }
        }
    });

    return SOWFormBlock;
});
