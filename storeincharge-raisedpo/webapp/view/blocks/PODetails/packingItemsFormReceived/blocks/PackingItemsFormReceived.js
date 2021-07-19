sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
    "use strict";

    var PackingItemsFormBlock = BlockBase.extend("com.agel.mmts.storeinchargeraisedpo.view.blocks.PODetails.packingItemsFormReceived.PackingItemsFormReceived", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.storeinchargeraisedpo.view.blocks.PODetails.packingItemsFormReceived.PackingItemsFormReceived",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.storeinchargeraisedpo.view.blocks.PODetails.packingItemsFormReceived.PackingItemsFormReceived",
                    type: "XML"
                }
            }
        }
    });

    return PackingItemsFormBlock;
});
