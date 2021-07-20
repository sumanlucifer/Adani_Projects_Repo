
sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
    "use strict";

    return Controller.extend("com.agel.mmts.storeinchargeraisedpo.view.blocks.PackingListReceivedDetails.innerPackaging.InnerPackaging", {
 
        onViewQRCodePressSmart: function(oEvent){
            this.oParentBlock.fireOnViewQRCodePressSmart(oEvent);
        }
      

    });
});