sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel"
	], function (Controller, JSONModel) {
		"use strict";

		return Controller.extend("com.agel.mmts.vendorPersona-OpenPOs.controller.App", {

			onInit : function () {

				// apply content density mode to root view
				//this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			}
		});

	}
);