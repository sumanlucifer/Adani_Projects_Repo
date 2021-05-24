sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
    "use strict";

    var SellerFormBlock = BlockBase.extend("com.agel.mmts.vendorPersona.view.blocks.poDetails.sellerForm.SellerForm", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.vendorPersona.view.blocks.poDetails.sellerForm.SellerForm",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.vendorPersona.view.blocks.poDetails.sellerForm.SellerForm",
                    type: "XML"
                }
            }
        }
    });

    return SellerFormBlock;
});
