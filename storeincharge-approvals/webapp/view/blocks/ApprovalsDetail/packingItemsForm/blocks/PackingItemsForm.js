sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
    "use strict";

    var PackingItemsFormBlock = BlockBase.extend("com.agel.mmts.storeinchargeapprovals.view.blocks.ApprovalsDetail.packingItemsForm.PackingItemsForm", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.storeinchargeapprovals.view.blocks.ApprovalsDetail.packingItemsForm.PackingItemsForm",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.storeinchargeapprovals.view.blocks.ApprovalsDetail.packingItemsForm.PackingItemsForm",
                    type: "XML"
                }
            },
            events: {
                "OnpressPackingListDetails":{}
            }
        }
    });

    return PackingItemsFormBlock;
});
