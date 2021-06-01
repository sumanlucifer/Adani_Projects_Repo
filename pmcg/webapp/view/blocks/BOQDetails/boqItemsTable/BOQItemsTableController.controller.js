sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
    "use strict";

    return Controller.extend("com.agel.mmts.pmcg.view.blocks.BOQDetails.boqItemsTable.BOQItemsTable", {

        onApproveBOQPress: function (oEvent) {
            this.oParentBlock.fireOnApproveBOQPress(oEvent);
        },

        onRejectBOQPress: function (oEvent) {
            this.oParentBlock.fireOnRejectBOQPress(oEvent);
        },


    });
});