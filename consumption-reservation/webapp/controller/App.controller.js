sap.ui.define([
    "com/agel/mmts/consumptionreservation/controller/BaseController"
],
    function (BaseController) {
        "use strict";

        return BaseController.extend("com.agel.mmts.consumptionreservation.controller.App", {
            onInit: function () {
                this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

            }
        });
    });