
sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
    "use strict";

    return Controller.extend("com.agel.mmts.storeinchargeapprovals.view.blocks.ApprovalsDetail.outerPackaging.OuterPackaging", {
      
        onViewQRCodePressSmart: function(oEvent){
            this.oParentBlock.fireOnViewQRCodePressSmart(oEvent);
        }
      

    });
});