
sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
    "use strict";

    return Controller.extend("com.agel.mmts.unloadmaterial.view.blocks.UnloadMaterial.innerPackaging.InnerPackaging", {

        onViewQRCodePress: function (oEvent) {
            this.oParentBlock.fireOnViewQRCodePress(oEvent);
        },

        onMapVendorQRSuccess: function (oEvent) {
            debugger;
            if (oEvent.getParameter("cancelled")) {
                sap.m.MessageToast.show("Scan cancelled", { duration: 1000 });
            } else {
                var sScannedValue = oEvent.getParameter("text")
                sap.m.MessageToast.show("Scanned: " + sScannedValue, { duration: 2000 });
                if (sScannedValue.length > 0) {
                    var sPath = oEvent.getSource().getBindingContext("JSONModelData").sPath;
                    oEvent.getSource().getModel("JSONModelData").setProperty(sPath+"/ExternalQRCode",sScannedValue);
                }
            }
            // this.oParentBlock.fireOnMapVendorQRSuccess(oEvent);
        },

        onMapVendorQRFail: function (oEvent) {
            sap.m.MessageToast.show("Scan failed" + oEvent, { duration: 1000 });
            // this.oParentBlock.fireOnMapVendorQRFail(oEvent);
        }


    });
});