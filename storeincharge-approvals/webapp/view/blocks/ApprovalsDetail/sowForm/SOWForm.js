sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
    "use strict";

    var SOWFormBlock = BlockBase.extend("com.agel.mmts.storeinchargeapprovals.view.blocks.ApprovalsDetail.sowForm.SOWForm", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.storeinchargeapprovals.view.blocks.ApprovalsDetail.sowForm.SOWForm",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.storeinchargeapprovals.view.blocks.ApprovalsDetail.sowForm.SOWForm",
                    type: "XML"
                }
            }
        }
    });

    return SOWFormBlock;
});
