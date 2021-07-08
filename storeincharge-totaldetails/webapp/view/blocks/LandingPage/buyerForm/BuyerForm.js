sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
    "use strict";

    var BuyerFormBlock = BlockBase.extend("com.agel.mmts.storeinchargetotaldetails.view.blocks.LandingPage.buyerForm.BuyerForm", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.storeinchargetotaldetails.view.blocks.LandingPage.buyerForm.BuyerForm",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.storeinchargetotaldetails.view.blocks.LandingPage.buyerForm.BuyerForm",
                    type: "XML"
                }
            }
        }
    });

    return BuyerFormBlock;
});
