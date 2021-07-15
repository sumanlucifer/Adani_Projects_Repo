
sap.ui.define(["sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter"], function (Controller, Filter) {
        "use strict";

        return Controller.extend("com.agel.mmts.storeinchargetotaldetails.view.blocks.LandingPage.packingItemsForm.PackingItemsForm", {


            onbeforeRebindTable: function (oEvent) {
                var PONumber;
                var mBindingParams = oEvent.getParameter("bindingParams");
                if (this.getView().getBindingContext().getObject())
                    PONumber = this.getView().getBindingContext().getObject().PONumber;
                var aFilter = [];
                var sType = this.getView().getModel("detailsModel").getProperty("/Type");
                if (sType === "INTRANSIT")
                    aFilter.push(new Filter("Status", sap.ui.model.FilterOperator.EQ, 'SAVED'));
                else if (sType === "RECEIVED")
                    aFilter.push(new Filter("Status", sap.ui.model.FilterOperator.EQ, 'DISPATCHED'));

                mBindingParams.filters.push(new sap.ui.model.Filter("PONumber", sap.ui.model.FilterOperator.EQ, PONumber));
                mBindingParams.filters.push(aFilter[0]);
            },

            onpressPackingListDetails: function (oEvent) {
                // this.oParentBlock.fireOnpressPackingListDetails(oEvent);
                this._showObject(oEvent.getSource());
            },
            _showObject: function (oItem) {
                var that = this;
                var oRouter = this.getOwnerComponent().getRouter();
                var sObjectPath = oItem.getBindingContext().getPath();
                oRouter.navTo("RouteDetailsPage", {
                    RequestId: sObjectPath.slice("/PackingListSet".length)
                });
            }


        });
    });