sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
    "use strict";

    var BuyerFormBlock = BlockBase.extend("com.agel.mmts.storeinchargeraisedpo.view.blocks.PODetails.buyerForm.BuyerForm", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.storeinchargeraisedpo.view.blocks.PODetails.buyerForm.BuyerForm",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.storeinchargeraisedpo.view.blocks.PODetails.buyerForm.BuyerForm",
                    type: "XML"
                }
            }
        }
    });

    return BuyerFormBlock;
});
