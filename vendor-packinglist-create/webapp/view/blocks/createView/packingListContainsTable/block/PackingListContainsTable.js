sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
    "use strict";

    var PackagingTable = BlockBase.extend("com.agel.mmts.vendorpackinglistcreate.view.blocks.createView.packingListContainsTable.PackingListContainsTable", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.vendorpackinglistcreate.view.blocks.createView.packingListContainsTable.PackingListContainsTable",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.vendorpackinglistcreate.view.blocks.createView.packingListContainsTable.PackingListContainsTable",
                    type: "XML"
                }
            },
             events: {
                 "OnGeneratePackagingTablePress":{},
                 "OnGeneratePackingList":{}
			}
        }
    });

    return PackagingTable;
});
