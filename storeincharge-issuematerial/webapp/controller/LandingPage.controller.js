sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/m/Button"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Button) {
		"use strict";

		return BaseController.extend("com.agel.mmts.storeinchargeissuematerial.controller.LandingPage", {
			onInit: function () {

                //Router Object
                this.oRouter = this.getRouter();
                this.oRouter.getRoute("RouteLandingPage").attachPatternMatched(this._onObjectMatched, this);

                //view model instatiation
                var oViewModel = new JSONModel({
                    busy: false,
                    delay: 0
                });
                this.setModel(oViewModel, "objectViewModel");

                // Icon Tab Count Model
                var oIconTabCountModel = new JSONModel({
                    confirmCount: null
                });
                this.setModel(oIconTabCountModel, "oIconTabCountModel");

                //adding searchfield association to filterbar and initialize the filter bar -> added in base controller
                // this.initializeFilterBar();
            },
            
            _onObjectMatched: function (oEvent) {

            },

            onDetailPress: function (oEvent) {
                this._showObjectList(oEvent.getSource());
            },

            _showObjectList: function (oItem) {
                var that = this;
                var sObjectPath = oItem.getBindingContext().sPath;        
                debugger;
                that.getRouter().navTo("RaiseIssueScanQRCode", {
                    SONumber: oItem.getBindingContext().getObject().SONumber
                });
            }
		});
	});
