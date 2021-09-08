sap.ui.define([
    "com/agel/mmts/returnreservation/controller/BaseController"
],
    function (BaseController) {
        "use strict";

        return BaseController.extend("com.agel.mmts.returnreservation.controller.App", {
            onInit: function () {
                this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

            }
        });
    });