sap.ui.define([
		"com/agel/mmts/storetotalorder/storetotalorder/controller/BaseController",
		"sap/ui/model/json/JSONModel"
],
	function (BaseController, JSONModel) {
		"use strict";

		return BaseController.extend("com.agel.mmts.storetotalorder.storetotalorder.controller.App", {
            
			onInit: function () {
                // this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

			}
		});
	});
