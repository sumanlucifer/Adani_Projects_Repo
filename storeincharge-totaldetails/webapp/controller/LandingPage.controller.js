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


                //Router Object
                this.oRouter = this.getRouter();
                this.oRouter.getRoute("RouteLandingPage").attachPatternMatched(this._onObjectMatched, this);
            },

            onBeforeShow: function (oEvent) {
                // debugger;
                // this.getView().getContent()[0].getSections()[1].rerender();
                // this.getView().getContent()[0].getSections()[3].rerender();
                // this.getView().getContent()[0].getSections()[4].rerender();
                // this.getView().getContent()[0].getSections()[1].rerender();
            },

            _onObjectMatched: function (oEvent) {
                // var sObjectType = "INTRANSIT";
                // var sObjectId = "(1)";
                
                this._createPODetailsModel();

                var startupParams = this.getOwnerComponent().getComponentData().startupParameters;
                var sObjectId = startupParams.ID[0];
                var sObjectType = startupParams.Type[0];

                this._bindView("/PurchaseOrderSet" + sObjectId);
                this.getView().getModel("detailsModel").setProperty("/Type", sObjectType);

                if (sObjectType === "INTRANSIT" || sObjectType === "RECEIVED")
                    this.getView().getModel("detailsModel").setProperty("/packingListTable", true);

                if (sObjectType === "INTRANSIT")
                    this.getView().getModel("detailsModel").setProperty("/packingListItemFilter", 'DISPATCHED');
                else if (sObjectType === "RECEIVED")
                    this.getView().getModel("detailsModel").setProperty("/packingListItemFilter", 'SAVED');

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
                // console.log(sObjectPath);
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
            }

        });
    });
