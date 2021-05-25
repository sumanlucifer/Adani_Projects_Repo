sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
    "use strict";

    var BuyerFormBlock = BlockBase.extend("com.agel.mmts.tcengineer.view.blocks.BOQDetails.buyerForm.BuyerForm", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.tcengineer.view.blocks.BOQDetails.buyerForm.BuyerForm",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.tcengineer.view.blocks.BOQDetails.buyerForm.BuyerForm",
                    type: "XML"
                }
            }
        }
    });

    return BuyerFormBlock;
});
