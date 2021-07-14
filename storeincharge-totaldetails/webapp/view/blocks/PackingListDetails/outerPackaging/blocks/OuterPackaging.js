sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
    "use strict";

    var BOQItemsTable = BlockBase.extend("com.agel.mmts.storeinchargetotaldetails.view.blocks.PackingListDetails.outerPackaging.OuterPackaging", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.storeinchargetotaldetails.view.blocks.PackingListDetails.outerPackaging.OuterPackaging",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.storeinchargetotaldetails.view.blocks.PackingListDetails.outerPackaging.OuterPackaging",
                    type: "XML"
                }
            },
             events: {
                 "OnViewQRCodePressSmart":{}//venkatesh
			}
        }
    });

    return BOQItemsTable;
});