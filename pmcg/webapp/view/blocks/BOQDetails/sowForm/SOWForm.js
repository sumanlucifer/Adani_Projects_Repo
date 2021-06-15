sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
    "use strict";

    var SOWFormBlock = BlockBase.extend("com.agel.mmts.pmcg.view.blocks.BOQDetails.sowForm.SOWForm", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.pmcg.view.blocks.BOQDetails.sowForm.SOWForm",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.pmcg.view.blocks.BOQDetails.sellesowFormrForm.SOWForm",
                    type: "XML"
                }
            }
        }
    });

    return SOWFormBlock;
});
