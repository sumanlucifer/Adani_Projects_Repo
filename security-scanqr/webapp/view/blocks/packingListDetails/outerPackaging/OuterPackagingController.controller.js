
sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
    "use strict";

    return Controller.extend("com.agel.mmts.securityscanqr.view.blocks.packingListDetails.outerPackaging.OuterPackaging", {
        //venkatesh
        onViewQRCodePress: function(oEvent){
            this.oParentBlock.fireOnViewQRCodePress(oEvent);
        }
      

    });
});