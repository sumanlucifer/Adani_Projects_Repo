sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
    "use strict";

    var PackingListForm = BlockBase.extend("com.agel.mmts.vendorPersona.view.blocks.poDetails.packingListTable.PackingListTable", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.vendorPersona.view.blocks.poDetails.packingListTable.PackingListTable",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.vendorPersona.view.blocks.poDetails.packingListTable.PackingListTable",
                    type: "XML"
                }
            },
            events: {
				"onBeforeRebindPackingListTable": {}
			}
        }
    });

    return PackingListForm;

});

