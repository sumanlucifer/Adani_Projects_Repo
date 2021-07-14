sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/Device",
    "sap/ui/core/routing/History",
    'sap/m/ColumnListItem',
    'sap/m/Input',
    'sap/base/util/deepExtend',
    'sap/ui/export/Spreadsheet',
    'sap/m/MessageToast',
    "sap/m/MessageBox",
    "sap/m/ObjectIdentifier",
    "sap/m/Text",
    "sap/m/Button"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, History, ColumnListItem, Input, deepExtend, Spreadsheet, MessageToast, MessageBox, ObjectIdentifier, Text, Button) {
		"use strict";

		return BaseController.extend("com.agel.mmts.storeinchargetotaldetails.controller.LandingPage", {
        onInit: function () {
            this.getView().addEventDelegate({
                onAfterShow: this.onBeforeShow,
            }, this);
            //view model instatiation
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0
            });
            this.setModel(oViewModel, "objectViewModel");

            this._createPODetailsModel();

            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RouteLandingPage").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sObjectId = oEvent.getParameter("arguments").ID;
            var sObjectType = oEvent.getParameter("arguments").Type;
            // var sObjectType = "RECEIVED";
            // var sObjectId = "(1)";
            this._bindView("/PurchaseOrderSet" + sObjectId);
            this.getView().getModel("detailsModel").setProperty("/Type",sObjectType);
             if(sObjectType === "INTRANSIT")
                this.getView().getModel("detailsModel").setProperty("/packingListItemFilter",'DISPATCHED');
            else if(sObjectType === "RECEIVED")
                this.getView().getModel("detailsModel").setProperty("/packingListItemFilter",'SAVED');
            if(sObjectType === "INTRANSIT" || sObjectType === "RECEIVED")
                this.getView().getModel("detailsModel").setProperty("/packingListTable",true);
        },

        _createPODetailsModel: function () {

            var oModel = new JSONModel({
                Label: null,
                packingListTable: false,
                Type: null,
                packingListItemFilter: null
            });

            this.setModel(oModel, "detailsModel");
        },

        _bindView: function (sObjectPath) {
            var objectViewModel = this.getViewModel("objectViewModel");
            var that = this;
            this.getView().bindElement({
                path: sObjectPath,
                events: {
                    dataRequested: function () {
                        objectViewModel.setProperty("/busy", true);
                    },
                    dataReceived: function () {
                        objectViewModel.setProperty("/busy", false);
                    }
                }
            });
        },

        onChildTableUpdateStarted: function (oEvent) {
            oEvent.getSource().setBusy(true);
        },

        onChildItemsTableUpdateFinished: function (oEvent) {
            oEvent.getSource().setBusy(false);
        },

        // onpressPackingListDetails: function(oEvent){
        //     this._showObject(oEvent.getSource());
        // },
        
        // _showObject: function (oItem) {
        //     var that = this;
        //     var sObjectPath = oItem.getBindingContext().sPath;
        //     that.getRouter().navTo("RouteDetailsPage", {
        //         RequestId: sObjectPath.slice("/PackingList".length)
        //     });
        // }

		});
	});
