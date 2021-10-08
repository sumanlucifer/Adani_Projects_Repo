sap.ui.define([
    "com/agel/mmts/newvendor/controller/BaseController"
], function (BaseController) {
    "use strict";

    return BaseController.extend("com.agel.mmts.newvendor.controller.App", {

        onInit: function () {
            // apply content density mode to root view
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
        }
    });
}
);