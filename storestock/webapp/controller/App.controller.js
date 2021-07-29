sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel"

],

    function (BaseController, JSONModel) {
        "use strict";
        return BaseController.extend("com.agel.mmts.storestock.controller.App", {

            onInit: function () {

            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
                this.oOwnerComponent = this.getOwnerComponent();
                this.oRouter = this.oOwnerComponent.getRouter();
                this.oRouter.attachRouteMatched(this.onRouteMatched, this);
            },
             onRouteMatched: function (oEvent) {
			var sRouteName = oEvent.getParameter("name"),
				oArguments = oEvent.getParameter("arguments");

			// Save the current route name
			this.currentRouteName = sRouteName;
			this.currentParent = oArguments.product;
			this.currentPC = oArguments.supplier;
		},
        
        onStateChanged: function (oEvent) {
			var bIsNavigationArrow = oEvent.getParameter("isNavigationArrow"),
				sLayout = oEvent.getParameter("layout");

			// Replace the URL with the new layout if a navigation arrow was used
			if (bIsNavigationArrow) {
				this.oRouter.navTo(this.currentRouteName, {layout: sLayout, parentMaterial: this.currentParent, pcList: this.currentPC}, true);
			}
		}


        });
    });
