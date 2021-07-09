sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
    "use strict";

    var PackingListItemsFormBlock = BlockBase.extend("com.agel.mmts.storeinchargetotaldetails.view.blocks.LandingPage.packingListItemsForm.PackingListItemsForm", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.storeinchargetotaldetails.view.blocks.LandingPage.packingListItemsForm.PackingListItemsForm",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.storeinchargetotaldetails.view.blocks.LandingPage.packingListItemsForm.PackingListItemsForm",
                    type: "XML"
                }
            }
        }
    });

    return PackingListItemsFormBlock;
});
