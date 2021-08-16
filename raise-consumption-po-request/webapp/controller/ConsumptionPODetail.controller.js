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

    return BaseController.extend("com.agel.mmts.raiseconsumptionporequest.controller.ConsumptionPODetail", {
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
                csvFile: "file",
                sReservationNumber: null,
                sReservationDate: null

            });
            this.setModel(oViewModel, "objectViewModel");
            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RouteConsumptionItemsDetailPage").attachPatternMatched(this._onObjectMatched, this);
        },

        onBeforeShow: function (evt) {
        

           // this.getView().getContent()[0].getSections()[1].rerender();
            this.byId("smartTreeTableCounsumedItems").rebindTable();
        },
        _onObjectMatched: function (oEvent) {
                var objectViewModel = this.getViewModel("objectViewModel");
            this.sObjectId = oEvent.getParameter("arguments").POId.match(/(\d+)/);
            var sObjectSOId = oEvent.getParameter("arguments").SOId.split(";")[0];
               var sReservationNumber = oEvent.getParameter("arguments").SOId.split(";")[1];
                  var sReservationDate = oEvent.getParameter("arguments").SOId.split(";")[2];
                  objectViewModel.setProperty("/sReservationNumber", sReservationNumber);
                     objectViewModel.setProperty("/sReservationDate", sReservationDate);

            this._bindView("/SONumberDetailsSet(" + sObjectSOId + ")");
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
        onBeforeRebindConsumptionPODetailTreeTable: function (oEvent) {
            debugger;
            var mBindingParams = oEvent.getParameter("bindingParams");
            mBindingParams.parameters["expand"] = "ConsumptionPostingBOQ";
            mBindingParams.parameters["navigation"] = { "ConsumedMaterialParentSet": "ConsumptionPostingBOQ" };

            mBindingParams.filters.push(new sap.ui.model.Filter("ConsumptionPostingReserve/ID", sap.ui.model.FilterOperator.EQ, this.sObjectId[0]));
        },






        handleToAllPOBreadcrumPress: function (oEvent) {
            history.go(-1);
        }


    });
});