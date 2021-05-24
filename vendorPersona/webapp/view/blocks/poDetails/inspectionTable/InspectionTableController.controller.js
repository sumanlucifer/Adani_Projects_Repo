sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
    "use strict";

    return Controller.extend("com.agel.mmts.vendorPersona.view.blocks.poDetails.inspectionTable.InspectionTable", {

        onBeforeRebindPackingListTable: function (oEvent) {
            var PONumber;
            var mBindingParams = oEvent.getParameter("bindingParams");
            if (this.getView().getBindingContext().getObject())
                PONumber = this.getView().getBindingContext().getObject().PONumber;

            mBindingParams.filters.push(new sap.ui.model.Filter("PONumber", sap.ui.model.FilterOperator.EQ, PONumber));

        }
    });
});