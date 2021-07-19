
sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
    "use strict";

    return Controller.extend("com.agel.mmts.storeinchargeraisedpo.view.blocks.PackingListDetails.outerPackaging.OuterPackaging", {
      
        onViewQRCodePressSmart: function(oEvent){
            this.oParentBlock.fireOnViewQRCodePressSmart(oEvent);
        }
      

    });
});