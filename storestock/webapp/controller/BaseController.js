sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("com.agel.mmts.storestock.controller.BaseController", {
		
	
		getModel: function (sName) {
		   return  this.getOwnerComponent().getModel();
        },
        setModel: function (sName) {
		   return this.getView().setModel(sName);
		},
		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
        },
           getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },
      addContentDensityClass: function () {
            return this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
        },

	});
});