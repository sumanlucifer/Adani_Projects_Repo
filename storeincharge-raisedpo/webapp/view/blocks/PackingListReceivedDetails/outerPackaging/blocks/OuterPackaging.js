sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
    "use strict";

    var BOQItemsTable = BlockBase.extend("com.agel.mmts.storeinchargeraisedpo.view.blocks.PackingListReceivedDetails.outerPackaging.OuterPackaging", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.storeinchargeraisedpo.view.blocks.PackingListReceivedDetails.outerPackaging.OuterPackaging",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.storeinchargeraisedpo.view.blocks.PackingListReceivedDetails.outerPackaging.OuterPackaging",
                    type: "XML"
                }
            },
             events: {
                 "OnViewQRCodePressSmart":{}
			}
        }
    });

    return BOQItemsTable;
});