
sap.ui.define(["sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter"], function (Controller, Filter) {
        "use strict";

        return Controller.extend("com.agel.mmts.storeinchargeraisedpo.view.blocks.PODetails.packingItemsForm.PackingItemsForm", {

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
            getListGRNStatusColor: function (status) {
                if (status === "UNLOADING COMPLETED")
                    return 'Success';
                if (status === "DISPATCHED")
                    return 'Indication06';
                if (status === "SAVED")
                    return 'Indication05';
                if (status === "SENT FOR QR CODE APPROVAL")
                    return 'Indication03';
                if (status === "QR_CODE_REQUEST_APPROVED")
                    return 'Indication07';
            }



        });
    });