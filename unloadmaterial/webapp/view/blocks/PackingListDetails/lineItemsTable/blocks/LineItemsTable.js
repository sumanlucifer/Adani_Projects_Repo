sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
    "use strict";

    var BOQItemsTable = BlockBase.extend("com.agel.mmts.unloadmaterial.view.blocks.PackingListDetails.lineItemsTable.LineItemsTable", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.unloadmaterial.view.blocks.PackingListDetails.lineItemsTable.LineItemsTable",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.unloadmaterial.view.blocks.PackingListDetails.lineItemsTable.LineItemsTable",
                    type: "XML"
                }
            },
             events: {
                 "OnViewBOQItemsPress":{},
                 "OnViewQRCode" : {},
                 "OnViewQRCode1" : {},
                 "OnViewQRCodePress":{}
			}
        }
    });

    return BOQItemsTable;
});