
sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
    "use strict";

    return Controller.extend("com.agel.mmts.securityscanqr.view.blocks.packingListDetails.innerPackaging.InnerPackaging", {
        //venkatesh
        onViewQRCodePress: function(oEvent){
            this.oParentBlock.fireOnViewQRCodePress(oEvent);
        }
      

    });
});