sap.ui.define([
	"./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (BaseController, JSONModel, Filter, FilterOperator, Fragment) {
		"use strict";

		return BaseController.extend("com.agel.mmts.securityscanhistory.controller.LandingPage", {
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
                openCount: null,
                confirmCount: null,
                dispatchCount: null
            });
            this.setModel(oIconTabCountModel, "oIconTabCountModel");

            //adding searchfield association to filterbar and initialize the filter bar -> added in base controller
            this.initializeFilterBar();

            },
            
            _onObjectMatched:function(oEvent){

            }

		});
	});
