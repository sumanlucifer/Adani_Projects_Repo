
sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
    "use strict";

    return Controller.extend("com.agel.mmts.qrdetails.view.blocks.packingListDetails.lineItemsTable.LineItemsTable", {

        onViewBOQItemsPress: function (oEvent) {
            this.oParentBlock.fireOnViewBOQItemsPress(oEvent);
        },

        onViewQRPress: function(oEvent){
            this.oParentBlock.fireOnViewQRCodePress(oEvent);
        },

        onBeforeRebindTreeTable: function (oEvent) {
            this.oParentBlock.fireManageBOQItemPress(oEvent);
        },

        onAfterRendering: function (oEvent) {
            this.byId("smartTreeTable").rebindTable();
        },
         onRefreshBOQItems: function(){
            this.getOwnerComponent().getModel().refresh();
        }


    });
});