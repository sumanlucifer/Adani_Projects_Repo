
sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
    "use strict";

    return Controller.extend("com.agel.mmts.vendorpackinglistcreate.view.blocks.packingListDetails.packagingListContains.LineItemsTable", {

        onViewBOQItemsPress: function (oEvent) {
            this.oParentBlock.fireOnViewBOQItemsPress(oEvent);
        },
        onViewQRCode: function (oEvent) {
            // this.oParentBlock.fireOnViewQRCode(oEvent);
            this.oRouter = this.getOwnerComponent().getRouter();
          this.oRouter.navTo("RouteQRCodeDetails");  
        },
        onViewQRCode1: function (oEvent) {
            this.oParentBlock.fireOnViewQRCode1(oEvent);
        },

        //venkatesh
        onViewQRPress: function(oEvent){
            this.oParentBlock.fireOnViewQRCodePress(oEvent);
        }
      

    });
});