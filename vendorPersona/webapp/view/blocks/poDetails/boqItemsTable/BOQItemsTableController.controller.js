sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
    "use strict";

    return Controller.extend("com.agel.mmts.vendorPersona.view.blocks.poDetails.boqItemsTable.BOQItemsTable", {

        onManageBOQItemPress: function (oEvent) {
            this._showObject(oEvent.getSource());
        },

        // Navigation
        _showObject: function (oItem) {
            var that = this;
            var oRouter = this.getOwnerComponent().getRouter();
            var sObjectPath = oItem.getBindingContext().getPath();

            oRouter.navTo("RouteManageBOQPage", {
                parentID: sObjectPath.slice("/ParentLineItemSet".length) // /ParentLineItemSet(123)->(123)
            });

        },

        onBeforeRebindTreeTable: function (oEvent) {
            this.oParentBlock.fireManageBOQItemPress(oEvent);
        },

        onAfterRendering: function(oEvent){
            this.byId("smartTreeTable").rebindTable();
        },

        onChange: function(oEvent){
        },

        onSendForApprovalPress: function(oEvent){
            this.oParentBlock.fireOnSendForApprovalPress(oEvent);
        },

        onViewBOQItemPress: function(oEvent){
            this.oParentBlock.fireOnViewBOQItemPress(oEvent);
        }


    });
});