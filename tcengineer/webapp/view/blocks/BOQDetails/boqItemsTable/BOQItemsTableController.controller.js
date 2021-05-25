sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
    "use strict";

    return Controller.extend("com.agel.mmts.tcengineer.view.blocks.BOQDetails.boqItemsTable.BOQItemsTable", {

        onBeforeRebindTreeTable: function (oEvent) {
            this.oParentBlock.fireManageBOQItemPress(oEvent);
        },

        onAfterRendering: function(oEvent){
            this.byId("smartTreeTable").rebindTable();
        }


    });
});