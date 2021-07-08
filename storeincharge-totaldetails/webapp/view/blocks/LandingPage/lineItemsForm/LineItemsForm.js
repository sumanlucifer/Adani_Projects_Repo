sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
    "use strict";

    var LineItemsForm = BlockBase.extend("com.agel.mmts.storeinchargetotaldetails.view.blocks.LandingPage.lineItemsForm.LineItemsForm", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.storeinchargetotaldetails.view.blocks.LandingPage.lineItemsForm.LineItemsForm",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.storeinchargetotaldetails.view.blocks.LandingPage.lineItemsForm.LineItemsForm",
                    type: "XML"
                }
            }
        }
    });

    return LineItemsForm;
});
