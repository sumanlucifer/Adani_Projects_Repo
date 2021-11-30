sap.ui.define([
		"com/agel/mmts/vendorPersona/controller/BaseController",
		"sap/ui/model/json/JSONModel"
	], function (BaseController, JSONModel) {
		"use strict";

		return BaseController.extend("com.agel.mmts.vendorPersona.controller.App", {

			onInit : function () {

				// apply content density mode to root view
				this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			}
		});

	}
);