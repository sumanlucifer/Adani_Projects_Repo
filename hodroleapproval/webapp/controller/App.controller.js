sap.ui.define([
    "com/agel/mmts/hodroleapproval/controller/BaseController"
], function (BaseController) {
    "use strict";

    return BaseController.extend("com.agel.mmts.hodroleapproval.controller.App", {

        onInit: function () {
            // apply content density mode to root view
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
        }
    });
}
);