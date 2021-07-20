sap.ui.define([
        "./BaseController",
        "sap/ui/model/json/JSONModel"

],
	
	function (BaseController, JSONModel) {
		"use strict";
return BaseController.extend("com.agel.mmts.storestock.controller.storeStockParentDetail", {
	
			onInit: function () {
                	
         

            },

              onPurchaseOrderPress: function (oEvent) {
            // The source is the list item that got pressed
            this._showObject(oEvent.getSource());
        },

        _showObject: function (oItem) {
            var that = this;
            var sObjectPath = oItem.getBindingContext().sPath;
            that.getRouter().navTo("RoutePODetailPage", {
                POId: sObjectPath.slice("/PurchaseOrderSet".length) // /PurchaseOrders(123)->(123)
            });
        }
            
           

            
		});
	});
