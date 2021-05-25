sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
    "use strict";

    var SellerFormBlock = BlockBase.extend("com.agel.mmts.tcengineer.view.blocks.BOQDetails.sellerForm.SellerForm", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.tcengineer.view.blocks.BOQDetails.sellerForm.SellerForm",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.tcengineer.view.blocks.BOQDetails.sellerForm.SellerForm",
                    type: "XML"
                }
            }
        }
    });

    return SellerFormBlock;
});
