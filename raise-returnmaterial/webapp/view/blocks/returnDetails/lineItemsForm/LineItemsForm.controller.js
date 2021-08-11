sap.ui.define(["sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter"], function (Controller, Filter) {
        "use strict";

        return Controller.extend("com.agel.mmts.raisereturnmaterial.view.blocks.returnDetails.lineItemsForm.LineItemsForm", {

            onpressPackingListDetails: function (oEvent) {
                this._showObject(oEvent.getSource());
            },

            _showObject: function (oItem) {
                var that = this;
                var oRouter = this.getOwnerComponent().getRouter();
                var sObjectPath = oItem.getBindingContext().getPath();
                oRouter.navTo("RouteDetailsPage", {
                    RequestId: sObjectPath.slice("/PackingListSet".length)
                });
            },

             onPressRetrunAsset : function (oEvent) {
                 debugger;
                 var sObjectId = oEvent.getSource();
            }

        });
    });