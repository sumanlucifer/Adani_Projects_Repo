sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel"

],

    function (BaseController, JSONModel) {
        "use strict";
        return BaseController.extend("com.agel.mmts.storestock.controller.App", {

            onInit: function () {
                jQuery.sap.addUrlWhitelist("blob");
				// apply content density mode to root view
				//this.addStyleClass(this.getContentDensityClass());

            }


        });
    });
