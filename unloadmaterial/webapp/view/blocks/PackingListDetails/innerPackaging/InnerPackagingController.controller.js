
sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
    "use strict";

    return Controller.extend("com.agel.mmts.unloadmaterial.view.blocks.PackingListDetails.innerPackaging.InnerPackaging", {
        //venkatesh
        onViewQRCodePress: function(oEvent){
            this.oParentBlock.fireOnViewQRCodePress(oEvent);
        }
      

    });
});