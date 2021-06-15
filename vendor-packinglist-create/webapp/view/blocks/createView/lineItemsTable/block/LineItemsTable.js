sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
    "use strict";

    var BOQItemsTable = BlockBase.extend("com.agel.mmts.vendorpackinglistcreate.view.blocks.createView.lineItemsTable.LineItemsTable", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.vendorpackinglistcreate.view.blocks.createView.lineItemsTable.LineItemsTable",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.vendorpackinglistcreate.view.blocks.createView.lineItemsTable.LineItemsTable",
                    type: "XML"
                }
            },
             events: {
                 "OnViewBOQItemsPress":{}
			}
        }
    });

    return BOQItemsTable;
});