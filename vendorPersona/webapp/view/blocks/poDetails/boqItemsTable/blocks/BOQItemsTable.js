sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
    "use strict";

    var BOQItemsTable = BlockBase.extend("com.agel.mmts.vendorPersona.view.blocks.poDetails.boqItemsTable.BOQItemsTable", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.vendorPersona.view.blocks.poDetails.boqItemsTable.BOQItemsTable",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.vendorPersona.view.blocks.poDetails.boqItemsTable.BOQItemsTable",
                    type: "XML"
                }
            },
             events: {
                "ManageBOQItemPress": {},
                "onManageBOQItemPress":{},
                "onChange":{},
                "onSendForApprovalPress":{},
                "onViewBOQItemPress":{},
                "navToManageBOQApp":{}
			}
        }
    });

    return BOQItemsTable;
});
