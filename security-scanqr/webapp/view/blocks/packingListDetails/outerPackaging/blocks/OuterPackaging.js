sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
    "use strict";

    var BOQItemsTable = BlockBase.extend("com.agel.mmts.securityscanqr.view.blocks.packingListDetails.outerPackaging.OuterPackaging", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.securityscanqr.view.blocks.packingListDetails.outerPackaging.OuterPackaging",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.securityscanqr.view.blocks.packingListDetails.outerPackaging.OuterPackaging",
                    type: "XML"
                }
            },
             events: {
                 "OnViewQRCodePress":{}//venkatesh
			}
        }
    });

    return BOQItemsTable;
});