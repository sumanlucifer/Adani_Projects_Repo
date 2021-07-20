sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
    "use strict";

    var PackingItemsFormBlock = BlockBase.extend("com.agel.mmts.storeinchargeraisedpo.view.blocks.PODetails.packingItemsForm.PackingItemsForm", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.storeinchargeraisedpo.view.blocks.PODetails.packingItemsForm.PackingItemsForm",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.storeinchargeraisedpo.view.blocks.PODetails.packingItemsForm.PackingItemsForm",
                    type: "XML"
                }
            }
        }
    });

    return PackingItemsFormBlock;
});
