sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
    "use strict";

    var BOQItemsTable = BlockBase.extend("com.agel.mmts.storeinchargeapprovals.view.blocks.ApprovalsDetail.lineItemsTable.LineItemsTable", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.storeinchargeapprovals.view.blocks.ApprovalsDetail.lineItemsTable.LineItemsTable",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.storeinchargeapprovals.view.blocks.ApprovalsDetail.lineItemsTable.LineItemsTable",
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