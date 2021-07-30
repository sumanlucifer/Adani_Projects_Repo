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

        return BaseController.extend("com.agel.mmts.storeinchargeraisedpo.controller.PODetails", {
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
                this.oRouter.getRoute("RoutePODetailsPage").attachPatternMatched(this._onObjectMatched, this);
            },

            _onObjectMatched: function (oEvent) {        
                var sObjectId = oEvent.getParameter("arguments").POId;
                var sObjectType = oEvent.getParameter("arguments").Type;
                this._bindView("/PurchaseOrderSet" + sObjectId);
                this.getView().getModel("detailsModel").setProperty("/Type", sObjectType);

                if (sObjectType === "RAISED"){
                    this.getView().getModel("detailsModel").setProperty("/packingListTable", false);
                } else if (sObjectType === "INPROGRESS"){
                    this.getView().getModel("detailsModel").setProperty("/packingListTable", true);
                }

            },

            _createPODetailsModel: function () {
                var oModel = new JSONModel({
                    Label: null,
                    packingListTable: false,
                    Type: null
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
