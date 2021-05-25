sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
    "use strict";

    var SOWFormBlock = BlockBase.extend("com.agel.mmts.tcengineer.view.blocks.BOQDetails.sowForm.SOWForm", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.tcengineer.view.blocks.BOQDetails.sowForm.SOWForm",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.tcengineer.view.blocks.BOQDetails.sellesowFormrForm.SOWForm",
                    type: "XML"
                }
            }
        }
    });

    return SOWFormBlock;
});
