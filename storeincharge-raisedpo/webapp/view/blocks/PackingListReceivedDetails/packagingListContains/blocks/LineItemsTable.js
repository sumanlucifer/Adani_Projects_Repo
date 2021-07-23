sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
    "use strict";

    var BOQItemsTable = BlockBase.extend("com.agel.mmts.storeinchargeraisedpo.view.blocks.PackingListReceivedDetails.packagingListContains.LineItemsTable", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.storeinchargeraisedpo.view.blocks.PackingListReceivedDetails.packagingListContains.LineItemsTable",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.storeinchargeraisedpo.view.blocks.PackingListReceivedDetails.packagingListContains.LineItemsTable",
                    type: "XML"
                }
            }
        }
    });

    return BOQItemsTable;
});