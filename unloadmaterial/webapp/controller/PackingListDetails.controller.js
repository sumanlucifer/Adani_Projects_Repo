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
    "jquery.sap.global",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "../utils/formatter",
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, History, ColumnListItem, Input, jquery, MessageBox, MessageToast, formatter) {
        "use strict";
        return BaseController.extend("com.agel.mmts.unloadmaterial.controller.PackingListDetails", {
            formatter: formatter,

            onInit: function () {
                jquery.sap.addUrlWhitelist("blob");
                //view model instatiation
                var oViewModel = new JSONModel({
                    busy: true,
                    delay: 0
                });
                this.setModel(oViewModel, "objectViewModel");

                var oViewHandlingModel = new JSONModel({
                    "closeButton": false,
                    "submitButton": true

                });
                this.setModel(oViewHandlingModel, "oViewHandlingModel");

                this.MainModel = this.getComponentModel();
                this.getView().setModel(this.MainModel);

                //Router Object
                this.oRouter = this.getRouter();
                this.oRouter.getRoute("RouteDetailsPage").attachPatternMatched(this._onObjectMatched, this);
            },

            // On Object Matched 
            _onObjectMatched: function (oEvent) {
                    this.RequestId = oEvent.getParameter("arguments").RequestId;
                    this._bindView("/PackingListSet(" + this.RequestId + ")");
            },

            // View Level Binding
            _bindView: function (sObjectPath) {
                var that = this;
                var objectViewModel = this.getViewModel("objectViewModel");

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

            onClose: function (oEvent) {
                this.oRouter.navTo("RouteLandingPage");
            },

            // QR Code View 
            onViewQRCodePress: function (oEvent) {
                var sParentItemPath = oEvent.getSource()._getBindingContext().getPath();
                var sDialogTitleObject = oEvent.getSource()._getBindingContext().getProperty();
                var oDetails = {};
                oDetails.controller = this;
                oDetails.view = this.getView();
                oDetails.sParentItemPath = sParentItemPath;
                oDetails.title = "QR Code";
                if (sDialogTitleObject.Name)
                    oDetails.title = sDialogTitleObject.Name;
                else if (sDialogTitleObject.PackagingType)
                    oDetails.title = sDialogTitleObject.PackagingType;
                if (!this.qrDialog) {
                    this.qrDialog = Fragment.load({
                        id: oDetails.view.getId(),
                        name: "com.agel.mmts.unloadmaterial.view.fragments.QRCodeViewer",
                        controller: oDetails.controller
                    }).then(function (oDialog) {
                        // connect dialog to the root view of this component (models, lifecycle)
                        oDetails.view.addDependent(oDialog);
                        oDialog.bindElement({
                            path: oDetails.sParentItemPath,
                        });
                        if (Device.system.desktop) {
                            oDialog.addStyleClass("sapUiSizeCompact");
                        }
                        oDialog.setTitle(oDetails.title);
                        return oDialog;
                    });
                }
                this.qrDialog.then(function (oDialog) {
                    oDetails.view.addDependent(oDialog);
                    oDialog.bindElement({
                        path: oDetails.sParentItemPath,
                    });
                    oDialog.setTitle(oDetails.title);
                    oDialog.open();
                });
            },

            onQRCodeViewerDialogClosePress: function (oEvent) {
                this.qrDialog.then(function (oDialog) {
                    oDialog.close();
                });
            },

            handleToUnloadMaterialBreadcrumPress: function() {
                this.getRouter().navTo("RouteNewConsignment");
            },

            onStartUnloading: function(oEvent) {
                this.getRouter().navTo("RouteUnloadMaterial",{
                    RequestId : this.RequestId
                });
            }

        });
    });
