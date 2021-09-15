
sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
    "use strict";

    return Controller.extend("com.agel.mmts.unloadmaterial.view.blocks.UnloadMaterial.innerPackaging.InnerPackaging", {
        
        onViewQRCodePress: function(oEvent){
            this.oParentBlock.fireOnViewQRCodePress(oEvent);
        },

        onMapVendorQRPress: function(oEvent) {
            this.oParentBlock.fireOnMapVendorQRPress(oEvent);
        }
      

    });
});