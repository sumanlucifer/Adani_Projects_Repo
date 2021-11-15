sap.ui.define(['sap/uxap/BlockBase'], 
function (BlockBase) {
    "use strict";

    var BuyerFormBlock = BlockBase.extend("com.agel.mmts.userroleassignment.view.blocks.UserDetails.basicDetails.BasicDetails", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.userroleassignment.view.blocks.UserDetails.basicDetails.BasicDetails",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.userroleassignment.view.blocks.UserDetails.basicDetails.BasicDetails",
                    type: "XML"
                }
            },
            events: {
                "onRoleDialogPress": {}                
			}
        }
    });
    return BuyerFormBlock;
    
});
