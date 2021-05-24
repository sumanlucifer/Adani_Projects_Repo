sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
    "use strict";

    var BuyerFormBlock = BlockBase.extend("com.agel.mmts.vendorPersona.view.blocks.poDetails.buyerForm.BuyerForm", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.vendorPersona.view.blocks.poDetails.buyerForm.BuyerForm",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.vendorPersona.view.blocks.poDetails.buyerForm.BuyerForm",
                    type: "XML"
                }
            }
        }
    });

    return BuyerFormBlock;
});
