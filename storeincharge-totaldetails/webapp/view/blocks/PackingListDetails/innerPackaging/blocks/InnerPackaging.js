sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
    "use strict";

    var InnerPackagingTable = BlockBase.extend("com.agel.mmts.storeinchargetotaldetails.view.blocks.PackingListDetails.innerPackaging.InnerPackaging", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.storeinchargetotaldetails.view.blocks.PackingListDetails.innerPackaging.InnerPackaging",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.storeinchargetotaldetails.view.blocks.PackingListDetails.innerPackaging.InnerPackaging",
                    type: "XML"
                }
            },
             events: {
                 "OnViewQRCodePress":{}
			}
        }
    });

    return InnerPackagingTable;
});