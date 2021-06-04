sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
    "use strict";

    return Controller.extend("com.agel.mmts.vendorPersona.view.blocks.poDetails.inspectionTable.InspectionTable", {

        onBeforeRebindPackingListTable: function (oEvent) {
            var PONumber;
            var mBindingParams = oEvent.getParameter("bindingParams");
            if (this.getView().getBindingContext().getObject())
                PONumber = this.getView().getBindingContext().getObject().PONumber;

            mBindingParams.filters.push(new sap.ui.model.Filter("PONumber", sap.ui.model.FilterOperator.EQ, PONumber));

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

        onOfflineInspectionPress: function(oEvent){
            var POId = this.getView().getBindingContext().getObject().ID;
            this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this.oRouter.navTo("RouteCreateOfflineInspection", {
                POId: POId
            });
        }
    });
});