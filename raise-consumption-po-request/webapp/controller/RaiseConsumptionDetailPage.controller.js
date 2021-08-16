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
    "sap/m/Button",
    "sap/m/Dialog",
    '../utils/formatter',
], function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, History, ColumnListItem, Input, deepExtend, Spreadsheet, MessageToast, MessageBox, ObjectIdentifier, Text, Button, Dialog, formatter) {
    "use strict";

    return BaseController.extend("com.agel.mmts.raiseconsumptionporequest.controller.RaiseConsumptionDetailPage", {
        formatter: formatter,
        onInit: function () {
            this.getView().addEventDelegate({
                onAfterShow: this.onBeforeShow,
            }, this);
            //view model instatiation
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0,
                boqSelection: null,
                csvFile: "file"
            });
            this.setModel(oViewModel, "objectViewModel");

            var oReservationData = new JSONModel({
                ReservationNumber: null,
                ReservationDate: null

            });
            this.setModel(oReservationData, "oReservationData");

            //    this._initializeCreationModels();

            // Keeps reference to any of the created sap.m.ViewSettingsDialog-s in this sample
            this._mViewSettingsDialogs = {};

            // get Owener Component Model

            // Main Model Set
            this.MainModel = this.getComponentModel();
            this.getView().setModel(this.MainModel);

            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RouteReturnConsumptionDetailPage").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var that = this;
            var sObjectId = oEvent.getParameter("arguments").SOId;
            this.sObjectId = sObjectId;
            this._bindView("/SONumberDetailsSet(" + sObjectId + ")");
        },

        _bindView: function (sObjectPath) {
            var objectViewModel = this.getViewModel("objectViewModel");
            var that = this;

            this.getView().bindElement({
                path: sObjectPath,
                events: {
                    change: this._onBindingChange.bind(that),
                    dataRequested: function () {
                        objectViewModel.setProperty("/busy", true);
                    },
                    dataReceived: function () {
                        objectViewModel.setProperty("/busy", false);




                    }
                }
            });
        },

        _onBindingChange: function () {
            var oView = this.getView(),
                oViewModel = this.getViewModel("objectViewModel"),
                oElementBinding = oView.getElementBinding();
            // No data for the binding
            if (!oElementBinding.getBoundContext()) {
                this.getRouter().getTargets().display("notFound");
                return;
            }
        },
        handleToAllPOBreadcrumPress: function (oEvent) {
            history.go(-1);
        },


        onBeforeRebindTreeTable: function (oEvent) {
            debugger;
            var mBindingParams = oEvent.getParameter("bindingParams");
            mBindingParams.parameters["expand"] = "IssuedMaterialBOQ";
            mBindingParams.parameters["navigation"] = { "IssuedMaterialParentSet": "IssuedMaterialBOQ" };
            mBindingParams.filters.push(new sap.ui.model.Filter("SONumberId/ID", sap.ui.model.FilterOperator.EQ, this.sObjectId));
        },

        onBeforeRebindRestTable: function (oEvent) {
            var mBindingParams = oEvent.getParameter("bindingParams");
            mBindingParams.filters.push(new Filter("SONumberId/ID", sap.ui.model.FilterOperator.EQ, this.sObjectId));

        },


        onConsumedItemsTablePress: function (oEvent) {
            // The source is the list item that got pressed

            var ReservationNumber = oEvent.getSource().getBindingContext().getProperty().ReservationNumber;
            var ReservationDate = oEvent.getSource().getBindingContext().getProperty().ReservationDate;
            this._showObject(oEvent.getSource(), ReservationNumber, ReservationDate );

           
        },

        _showObject: function (oItem, ReservationNumber, ReservationDate ) {


            var that = this;
            var sObjectPath = oItem.getBindingContext().sPath;

            this.oRouter.navTo("RouteConsumptionItemsDetailPage", {
                POId: sObjectPath.slice("/ConsumptionPostingReserveSet".length),// /StockParentItemSet(123)->(123)
                SOId: this.sObjectId + ";" + ReservationNumber + ";" + ReservationDate
            },


                false
            );
        },

        
        onPressLongNewEntry: function (oItem) {
             var that = this;
             oItem.getBindingContext().requestCanonicalPath().then(function (sObjectPath) {
                 that.getRouter().navTo("RoutePackingDeatilsPage", {
                     packingListID: sObjectPath.slice("/PackingLists".length) // /PurchaseOrders(123)->(123)
                 });
             }); 
            console.log(oItem.getBindingContext().getObject().ID)

               var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
              var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                  target: {
                      semanticObject: "PackingList",
                      action: "manage"
                  },
                  params: {
                      "packingListID": oItem.getBindingContext().getObject().ID,
                      "status": "SAVED"
                  }
              })) || ""; 
              oCrossAppNavigator.toExternal({
                  target: {
                      shellHash: hash
                  }
              }); 
        }







    });
});