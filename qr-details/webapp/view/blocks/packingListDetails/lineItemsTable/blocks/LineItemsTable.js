sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
    "use strict";

    var BOQItemsTable = BlockBase.extend("com.agel.mmts.qrdetails.view.blocks.packingListDetails.lineItemsTable.LineItemsTable", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.qrdetails.view.blocks.packingListDetails.lineItemsTable.LineItemsTable",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.qrdetails.view.blocks.packingListDetails.lineItemsTable.LineItemsTable",
                    type: "XML"
                }
            },
             events: {

                  "ManageBOQItemPress": {},
                "onManageBOQItemPress":{},
                 "OnViewBOQItemsPress":{},
                 "OnViewQRCodePress":{}
			}
        }
    });

    return BOQItemsTable;
});