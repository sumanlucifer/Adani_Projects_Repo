sap.ui.define([
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/core/Fragment",
        "sap/ui/model/Sorter",
        "sap/ui/Device",
        "sap/ui/core/routing/History",
        'sap/m/ColumnListItem',
        'sap/m/Input'
	],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
	function (Controller , JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, History, ColumnListItem, Input ) {
		"use strict";

		return Controller.extend("com.agel.mmts.securityPerson-ScanQR.controller.LandingPage", {
            
            onInit: function () {
                
                 //Router Object
                this.oRouter = this.getRouter();
                this.oRouter.getRoute("RoutePODetailPage").attachPatternMatched(this._onObjectMatched, this);
            },

            _onObjectMatched: function (oEvent) {
                var sObjectId = oEvent.getParameter("arguments").POId;
                this._bindView("/PurchaseOrders" + sObjectId);
                
            },

            _bindView: function(sObjectPath) {
                var objectViewModel = this.getViewModel("objectViewModel");
                var that = this;

                this.getView().bindElement({
                        path: sObjectPath,
                        parameters: {
                            "$expand": {
                                        "parent_line_items": {
                                                    "$expand": {
                                                        "child_line_items": {}
                                                    }   
                                        }
                        }   
                },
                events: {
                    dataRequested: function() {
                        objectViewModel.setProperty("/busy", true);
                    },
                    dataReceived: function() {
                        objectViewModel.setProperty("/busy", false);
                        var oView = that.getView();
                    }
                }
             });
            },

		});
	});
