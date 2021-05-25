sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    'sap/ui/core/ValueState'
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, ValueState) {
        "use strict";

        return BaseController.extend("com.agel.mmts.tcengineer.controller.BOQRequestList", {
            onInit: function () {
                //Router Object
                this.oRouter = this.getRouter();
                this.oRouter.getRoute("RouteBOQRequestList").attachPatternMatched(this._onObjectMatched, this);

                //view model instatiation
                var oViewModel = new JSONModel({
                    busy: false,
                    delay: 0
                });
                this.setModel(oViewModel, "objectViewModel");

                // keeps the search state
                this._aTableSearchState = [];
                // Keeps reference to any of the created dialogs
                this._mViewSettingsDialogs = {};

                //adding searchfield association to filterbar and initialize the filter bar -> added in base controller
                this.initializeFilterBar();
            },

            onFilterChange: function (oEvent) {
                //   if (oEvent.getSource().getValue().length){
                this.oFilterBar.fireFilterChange(oEvent);
                //  }
            },

            // Date Range Selection
            onDateRangeSelectionChange: function (oEvent) {
                var sFrom = oEvent.getParameter("from"),
                    sTo = oEvent.getParameter("to"),
                    bValid = oEvent.getParameter("valid"),
                    oEventSource = oEvent.getSource(),
                    oText = this.byId("TextEvent");

                if (bValid) {
                    oEventSource.setValueState(ValueState.None);
                } else {
                    oEventSource.setValueState(ValueState.Error);
                }

                this.oFilterBar.fireFilterChange(oEvent);
            },

            onBOQRequestPress: function (oEvent) {
                // The source is the list item that got pressed
                this._showObject(oEvent.getSource());
            },

            _showObject: function (oItem) {
                var that = this;
                var sObjectPath = oItem.getBindingContext().sPath;
                that.getRouter().navTo("RouteBOQDetailsPage", {
                    BOQRequestId: sObjectPath.slice("/BOQApprovalRequestSet".length) // /BOQApprovalRequestSet(123)->(123)
                });
            },
        });
    });
