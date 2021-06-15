
sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
    "use strict";

    return Controller.extend("com.agel.mmts.vendorpackinglistcreate.view.blocks.createView.lineItemsTable.LineItemsTable", {

        onViewBOQItemsPress: function (oEvent) {
            this.oParentBlock.fireOnViewBOQItemsPress(oEvent);
        }

    });
});