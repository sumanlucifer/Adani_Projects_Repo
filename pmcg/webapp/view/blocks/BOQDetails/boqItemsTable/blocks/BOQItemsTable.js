sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
    "use strict";

    var BOQItemsTable = BlockBase.extend("com.agel.mmts.pmcg.view.blocks.BOQDetails.boqItemsTable.BOQItemsTable", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.pmcg.view.blocks.BOQDetails.boqItemsTable.BOQItemsTable",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.pmcg.view.blocks.BOQDetails.boqItemsTable.BOQItemsTable",
                    type: "XML"
                }
            },
             events: {
                "OnApproveBOQPress": {},
                "OnRejectBOQPress":{}
			}
        }
    });

    return BOQItemsTable;
});
