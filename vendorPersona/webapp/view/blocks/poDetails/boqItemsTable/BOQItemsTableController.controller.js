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

        onAfterRendering: function (oEvent) {
            this.byId("smartTreeTable").rebindTable();
        },

        onChange: function (oEvent) {
        },

        onSendForApprovalPress: function (oEvent) {
            this.oParentBlock.fireOnSendForApprovalPress(oEvent);
        },

        onViewBOQItemPress: function (oEvent) {
            this.oParentBlock.fireOnViewBOQItemPress(oEvent);
        },

        navToManageBOQApp: function (oEvent) {
            var poNumber = this.getView().getBindingContext().getObject().PONumber; // read SupplierID from OData path Product/SupplierID
            var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
            var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                target: {
                    semanticObject: "boq",
                    action: "manage"
                },
                params: {
                    "poNumber": poNumber
                }
            })) || ""; // generate the Hash to display a Supplier
            oCrossAppNavigator.toExternal({
                target: {
                    shellHash: hash
                }
            }); // navigate to Supplier application
        },

        onRefreshBOQItems: function(){
            this.getOwnerComponent().getModel().refresh();
        }


    });
});