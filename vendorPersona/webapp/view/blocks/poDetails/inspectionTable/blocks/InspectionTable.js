sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
    "use strict";

    var InspectionTable = BlockBase.extend("com.agel.mmts.vendorPersona.view.blocks.poDetails.inspectionTable.InspectionTable", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.vendorPersona.view.blocks.poDetails.inspectionTable.InspectionTable",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.vendorPersona.view.blocks.poDetails.inspectionTable.InspectionTable",
                    type: "XML"
                }
            },
            events: {
				"onBeforeRenderingInspectionTable": {}
			}
        }
    });

    return InspectionTable;

});

