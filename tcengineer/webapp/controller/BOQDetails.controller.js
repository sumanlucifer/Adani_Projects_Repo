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
], function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, History, ColumnListItem, Input, deepExtend, Spreadsheet, MessageToast, MessageBox, ObjectIdentifier, Text, Button) {
    "use strict";

    return BaseController.extend("com.agel.mmts.tcengineer.controller.BOQDetails", {

        onInit: function () {
            this.getView().addEventDelegate({
                onAfterShow: this.onBeforeShow,
            }, this);
            //view model instatiation
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0,
                boqSelection: null
            });
            this.setModel(oViewModel, "objectViewModel");

            this._createBOQApprovalModel();

            // Keeps reference to any of the created sap.m.ViewSettingsDialog-s in this sample
            this._mViewSettingsDialogs = {};

            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RouteBOQDetailsPage").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sObjectId = oEvent.getParameter("arguments").BOQRequestId;
            this._bindView("/BOQApprovalRequestSet" + sObjectId);
        },

        _createBOQApprovalModel: function () {
            
            var oModel = new JSONModel({
                BOQApprovedRequestId: null,
                Status: null,
                Comment: null,
                BOQGroupId: null
            });

            this.setModel(oModel, "BOQApprovalModel");
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


        onViewChildItemPress: function (oEvent) {
            var oItem = oEvent.getSource();
            var that = this;
            var sPath = oEvent.getSource().getParent().getBindingContextPath();
            that.handleChildItemsDialogOpen(sPath);
        },

        // Child Line Items Dialog Open
        handleChildItemsDialogOpen: function (sParentItemPath) {
            // create dialog lazily
            var oDetails = {};
            oDetails.controller = this;
            oDetails.view = this.getView();
            oDetails.sParentItemPath = sParentItemPath;
            if (!this.pDialog) {
                this.pDialog = Fragment.load({
                    id: oDetails.view.getId(),
                    name: "com.agel.mmts.vendorPersona.view.fragments.PODetails.ChildItemsDialog",
                    controller: oDetails.controller
                }).then(function (oDialog) {
                    // connect dialog to the root view of this component (models, lifecycle)
                    oDetails.view.addDependent(oDialog);
                    oDialog.bindElement({
                        path: oDetails.sParentItemPath,
                        parameters: {
                            "expand": 'child_line_items'
                        }
                    });
                    return oDialog;
                });
            }
            this.pDialog.then(function (oDialog) {
                oDetails.view.addDependent(oDialog);
                oDialog.bindElement({
                    path: oDetails.sParentItemPath,
                    parameters: {
                        "expand": 'child_line_items'
                    }
                });
                oDialog.open();
            });
        },

        onViewChildDialogClose: function (oEvent) {
            this.pDialog.then(function (oDialog) {
                oDialog.close();
            });
        },

        getViewSettingsDialog: function (sDialogFragmentName) {
            var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];

            if (!pDialog) {
                pDialog = Fragment.load({
                    id: this.getView().getId(),
                    name: sDialogFragmentName,
                    controller: this
                }).then(function (oDialog) {
                    if (Device.system.desktop) {
                        oDialog.addStyleClass("sapUiSizeCompact");
                    }
                    return oDialog;
                });
                this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
            }
            return pDialog;
        },

        onBeforeShow: function (evt) {
            //this.getView().getContent()[0].getSections()[1].rerender();
            //this.getView().getContent()[0].getSections()[2].rerender();
            //this.getView().getContent()[0].getSections()[2].rerender();
        },

        onApproveBOQPress: function (oEvent) {

        },

        onRejectBOQPress: function (oEvent) {

        }

    });
});