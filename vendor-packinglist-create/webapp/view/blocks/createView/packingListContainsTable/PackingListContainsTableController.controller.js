
sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
    "use strict";

    return Controller.extend("com.agel.mmts.vendorpackinglistcreate.view.blocks.createView.packingListContainsTable.packingListContainsTable", {

        onViewBOQItemsPress: function (oEvent) {
            this.oParentBlock.fireOnViewBOQItemsPress(oEvent);
        },

        onGeneratePackingList: function (oEvent) {
            this.oParentBlock.fireOnGeneratePackingList(oEvent);
        },

        onPackingListTypeChange: function(oEvent){
            var sPackingListType = oEvent.getSource().getSelectedItem().getText();
            var oPackingListContainsModel = this.getView().getModel("packingListContainsModel");
            var sPath = oEvent.getSource().getBindingContext("packingListContainsModel").getPath();
            oPackingListContainsModel.setProperty(sPath + "/PackagingType", sPackingListType);
        }

    });
});