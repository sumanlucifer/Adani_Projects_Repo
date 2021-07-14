sap.ui.define([
		"com/agel/mmts/unloadmaterial/controller/BaseController",
		"sap/ui/model/json/JSONModel"
],
	function (BaseController, JSONModel) {
		"use strict";

		return BaseController.extend("com.agel.mmts.unloadmaterial.controller.App", {
            
			onInit: function () {
                // this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

			}
		});
	});
