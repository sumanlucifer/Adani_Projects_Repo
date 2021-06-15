sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
    "use strict";

    var BOQItemsTable = BlockBase.extend("com.agel.mmts.vendorpackinglistcreate.view.blocks.packingListDetails.packagingListContains.LineItemsTable", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.vendorpackinglistcreate.view.blocks.packingListDetails.packagingListContains.LineItemsTable",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.vendorpackinglistcreate.view.blocks.packingListDetails.packagingListContains.LineItemsTable",
                    type: "XML"
                }
            },
             events: {
                 "OnViewBOQItemsPress":{},
                 "OnViewQRCode" : {},
                 "OnViewQRCode1" : {}
			}
        }
    });

    return BOQItemsTable;
});