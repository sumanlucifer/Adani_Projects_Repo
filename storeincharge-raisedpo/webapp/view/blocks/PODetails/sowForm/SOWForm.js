sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
    "use strict";

    var SOWFormBlock = BlockBase.extend("com.agel.mmts.storeinchargeraisedpo.view.blocks.PODetails.sowForm.SOWForm", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.storeinchargeraisedpo.view.blocks.PODetails.sowForm.SOWForm",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.storeinchargeraisedpo.view.blocks.PODetails.sowForm.SOWForm",
                    type: "XML"
                }
            }
        }
    });

    return SOWFormBlock;
});
