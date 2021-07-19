sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
    "use strict";

    return Controller.extend("com.agel.mmts.vendorPersona.view.blocks.poDetails.packingListTable.PackingListTable", {

        onBeforeRebindPackingListTable: function (oEvent) {
            var PONumber;
            var mBindingParams = oEvent.getParameter("bindingParams");

            var that = this;
            this.getOwnerComponent().getModel().metadataLoaded(true).then(
                function () {
                    // model is ready now
                    PONumber = that.getView().getBindingContext().getObject().PONumber;
                    mBindingParams.filters.push(new sap.ui.model.Filter("PONumber", sap.ui.model.FilterOperator.EQ, PONumber));
                    mBindingParams.sorter.push(new sap.ui.model.Sorter("CreatedAt", true));
                },
                function () {
                    //Error Handler Display error information so that the user knows that the application does not work.
                });
        },

        onPackingListTableUpdateFinished: function (oEvent) {

        },


        onPackingListItemPress: function (oEvent) {
            var packingListId = oEvent.getSource().getBindingContext().getPath().slice("/PackingListSet".length);
            packingListId = packingListId.substr(1, packingListId.length - 2);
            var status = oEvent.getSource().getBindingContext().getObject().Status;
            var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
            var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                target: {
                    semanticObject: "PackingList",
                    action: "manage"
                },
                params: {
                    "packingListID": packingListId,
                    "status": status
                }
            })) || ""; // generate the Hash to display a MDCC Number
            oCrossAppNavigator.toExternal({
                target: {
                    shellHash: hash
                }
            }); // navigate to Manage MDCC application - Initiate Dispatch Screen 
        },
    });
});