sap.ui.define(["sap/ui/core/mvc/Controller", 'sap/m/MessageBox',], function (Controller, MessageBox) {
    "use strict";
    return Controller.extend("com.agel.mmts.vendorpackinglistcreate.view.blocks.createView.packingListContainsTable.packingListContainsTable", {
        onViewBOQItemsPress: function (oEvent) {
            this.oParentBlock.fireOnViewBOQItemsPress(oEvent);
        },
        onGeneratePackingList: function (oEvent) {
            this.oParentBlock.fireOnGeneratePackingList(oEvent);
        },
        onPackingListTypeChange: function (oEvent) {
            var sPackingListType = oEvent.getSource().getSelectedItem().getText();
            var oPackingListContainsModel = this.getView().getModel("packingListContainsModel");
            var sPath = oEvent.getSource().getBindingContext("packingListContainsModel").getPath();
            oPackingListContainsModel.setProperty(sPath + "/PackagingType", sPackingListType);
        },
        onChaneNumberOfPackage: function (oEvent) {

            var sValue = oEvent.getSource().getValue();
            var isDecimal = sValue - (Math.floor(sValue)) !== 0;
            if (isDecimal || sValue < 0) {
                var oPackingListContainsModel = this.getView().getModel("packingListContainsModel");
                var sPath = oEvent.getSource().getBindingContext("packingListContainsModel").getPath();
                oPackingListContainsModel.setProperty(sPath + "/NumberOfPackages", null);
                sap.m.MessageBox.error("Please enter the valid No. of Packages");

                this.getView().byId("idButtonGenerate").setVisible(false);

            }
            else {
                this.getView().byId("idButtonGenerate").setVisible(true);

            }
        }
    });
});