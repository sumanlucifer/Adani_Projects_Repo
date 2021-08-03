sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
    "use strict";

    return Controller.extend("com.agel.mmts.vendorPersona.view.blocks.poDetails.inspectionTable.InspectionTable", {

        onBeforeRebindInspectionTable: function (oEvent) {
            var PONumber;
            var mBindingParams = oEvent.getParameter("bindingParams");

            var that = this;
            this.getOwnerComponent().getModel().metadataLoaded(true).then(
                function () {
                    // model is ready now
                    PONumber = that.getView().getBindingContext().getObject().PONumber;
                    //mBindingParams.filters.push(new sap.ui.model.Filter("PONumber", sap.ui.model.FilterOperator.EQ, PONumber));
                    mBindingParams.sorter.push(new sap.ui.model.Sorter("CreatedAt", true));
                },
                function () {
                    //Error Handler Display error information so that the user knows that the application does not work.
                });

        },

        //triggers on press of a Inspection ID item from the list
        onInspectionIDPress: function (oEvent) {
            // The source is the list item that got pressed
            this._showObject(oEvent.getSource());
        },


        // On Show Object - Navigation
        _showObject: function (oItem) {
            var that = this;
            this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            var sPath = oItem.getBindingContext().getPath();
            this.oRouter.navTo("RouteInspectionDetailsPage", {
                inspectionID: sPath.slice("/InspectionCallIdSet".length) // /PurchaseOrders(123)->(123)
            });
        },

        onOfflineInspectionPress: function (oEvent) {
            var POId = this.getView().getBindingContext().getObject().ID;
            this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this.oRouter.navTo("RouteCreateOfflineInspection", {
                POId: POId
            });
        }
    });
});