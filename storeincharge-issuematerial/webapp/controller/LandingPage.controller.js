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
                    issueCount: null,
                    issuereservedCount: null
                });
                this.setModel(oIconTabCountModel, "oIconTabCountModel");

                //adding searchfield association to filterbar and initialize the filter bar -> added in base controller
                // this.initializeFilterBar();
            },
            
            _onObjectMatched: function (oEvent) {

            },

            onIssueTableUpdateFinished: function (oEvent) {
                //Setting the header context for a property binding to $count
                this.setIconTabCount(oEvent, oEvent.getParameter("total"), "/issueCount");
            },

            onIssueReservedTableUpdateFinished: function (oEvent) {
                //Setting the header context for a property binding to $count                       
                this.setIconTabCount(oEvent, oEvent.getParameter("total"), "/issuereservedCount");
            },

            setIconTabCount: function (oEvent, total, property) {
                if (oEvent.getSource().getBinding("items").isLengthFinal()) {
                    this.getView().getModel("oIconTabCountModel").setProperty(property, total);
                }
            },

            onbeforeRebindListIssueTable: function (oEvent) {
                var mBindingParams = oEvent.getParameter("bindingParams");
                mBindingParams.sorter.push(new sap.ui.model.Sorter("CreatedAt", true));

            },

            onbeforeRebindIssueReservedTable: function (oEvent) {
                var mBindingParams = oEvent.getParameter("bindingParams");
                mBindingParams.sorter.push(new sap.ui.model.Sorter("CreatedAt", true));

            },

            // On Icon Tab Select
            onIconTabBarChanged: function (sKey) {
                if (sKey === "IssueKey") {
                    this.byId("pageTitle").setText(this.getResourceBundle().getText("PageTitle"));
                } else if (sKey === "IssueReservedKey") {
                    this.byId("pageTitle").setText(this.getResourceBundle().getText("PageTitle"));
                }

            },

            // On Icon Tab Select
            onIconTabSelect: function (oEvent) {
                var that = this;
                var sKey = oEvent.getParameter("key");
                if (sKey === "IssueKey") {
                    this.byId("pageTitle").setText(this.getResourceBundle().getText("PageTitle"));
                } else if (sKey === "IssueReservedKey") {
                    this.byId("pageTitle").setText(this.getResourceBundle().getText("PageTitle"));
                }
            },

            onDetailPress: function (oEvent) {
                this._showObjectList(oEvent.getSource());
            },

            _showObjectList: function (oItem) {
                var that = this;
                var sObjectPath = oItem.getBindingContext().sPath; 
                // debugger;       
                that.getRouter().navTo("RaiseIssueScanQRCode", {
                    // ID: oItem.getBindingContext().getObject().ID
                     ID: sObjectPath.slice("/IssuedMaterialReserveSet".length)
                });
            },

            onDetailPressIssueMaterial: function (oEvent) {
                this._showObjectListIssueMaterial(oEvent.getSource());
            },

            _showObjectListIssueMaterial: function (oItem) {
                var that = this;
                var sObjectPath = oItem.getBindingContext().sPath; 
                // debugger;       
                that.getRouter().navTo("IssuedMaterialDetails", {
                     ID: sObjectPath.slice("/IssuedMaterialSet".length)
                });  
            }

		});
	});
