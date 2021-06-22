sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
    "use strict";

    return Controller.extend("com.agel.mmts.vendorPersona.view.blocks.poDetails.packingListTable.PackingListTable", {

        onBeforeRebindPackingListTable: function (oEvent) {
            var PONumber;
            var mBindingParams = oEvent.getParameter("bindingParams");
            if (this.getView().getBindingContext().getObject())
                PONumber = this.getView().getBindingContext().getObject().PONumber;

            mBindingParams.filters.push(new sap.ui.model.Filter("PONumber", sap.ui.model.FilterOperator.EQ, PONumber));
            mBindingParams.sorter.push(new sap.ui.model.Sorter("CreatedAt", true));

        },

        onPackingListTableUpdateFinished: function(oEvent){
            
        },


        onPackingListItemPress: function (oEvent) {
            var poNumber = oEvent.getSource().getBindingContext().getObject().PONumber; // read SupplierID from OData path Product/SupplierID
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
    });
});