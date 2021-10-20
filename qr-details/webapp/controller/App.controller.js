sap.ui.define([
    "sap/ui/core/mvc/Controller",
    		"sap/ui/model/json/JSONModel"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller, JSONModel) {
		"use strict";

		return Controller.extend("com.agel.mmts.qrdetails.controller.App", {
			onInit: function () {
				this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			}
		});
	});
