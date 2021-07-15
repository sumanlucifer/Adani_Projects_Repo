
sap.ui.define(["sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter"], function (Controller, Filter) {
        "use strict";

        return Controller.extend("com.agel.mmts.storeinchargetotaldetails.view.blocks.LandingPage.packingItemsForm.PackingItemsForm", {

            onbeforeRebindOpenPoTable: function (oEvent) {
                var PONumber;
                var mBindingParams = oEvent.getParameter("bindingParams");
                if (this.getView().getBindingContext().getObject())
                    PONumber = this.getView().getBindingContext().getObject().PONumber;

                mBindingParams.filters.push(new sap.ui.model.Filter("PONumber", sap.ui.model.FilterOperator.EQ, PONumber));
            }

        });
    });