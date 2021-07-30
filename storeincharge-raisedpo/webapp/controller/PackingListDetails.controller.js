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
        return BaseController.extend("com.agel.mmts.storeinchargeraisedpo.controller.PackingListDetails", {
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
                this._bindView("/PackingListSet" + this.RequestId);
            },

            // View Level Binding
            _bindView: function (sObjectPath) {
                var that = this;
                var objectViewModel = this.getViewModel("objectViewModel");

                this.getView().bindElement({
                    path: sObjectPath,
                    parameter: { expand: 'GRNS' },
                    events: {
                        dataRequested: function () {
                            objectViewModel.setProperty("/busy", true);
                        },
                        dataReceived: function () {
                            objectViewModel.setProperty("/busy", false);
                            that.readGRNS(sObjectPath + "/GRNS");
                        }
                    }
                });
            },

            readGRNS: function (sPath) {
                this.MainModel.read(sPath, {
                    success: function (oData, oResponse) {
                        // debugger;
                        var filtered = oData.results.filter((item) => item.Status === "APPROVED");
                        if (filtered.length > 0)
                            this.byId("idrequestGRNButton").setVisible(false);
                        else
                            this.byId("idrequestGRNButton").setVisible(true);
                    }.bind(this),
                    error: function (oError) {
                        sap.m.MessageBox.error(JSON.stringify(oError));
                    }
                });
            },

            onClose: function (oEvent) {
                this.oRouter.navTo("RouteLandingPage");
            },


            // QR Code View 
            onViewQRCodePress: function (oEvent) {
                var sParentItemPath = oEvent.getSource().getBindingContext().getPath();
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
                        name: "com.agel.mmts.storeinchargeraisedpo.view.fragments.QRCodeViewer",
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

            // QR Code View 
            onViewQRCodePressSmart: function (oEvent) {
                var sParentItemPath = oEvent.getParameter("oSource").getBindingContext().getPath();
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
                        name: "com.agel.mmts.storeinchargeraisedpo.view.fragments.QRCodeViewer",
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

            onUDDetailsPress: function (oEvent) {
                //  debugger;
                var sParentItemPath = oEvent.getSource().getParent().getBindingContextPath();
                var sDialogTitle = "GRN - " + oEvent.getSource().getBindingContext().getObject().ID;
                var oDetails = {};
                oDetails.controller = this;
                oDetails.view = this.getView();
                oDetails.sParentItemPath = sParentItemPath;
                oDetails.title = sDialogTitle;
                if (!this.pDialog) {
                    this.pDialog = Fragment.load({
                        id: oDetails.view.getId(),
                        name: "com.agel.mmts.storeinchargeraisedpo.view.fragments.common.ViewUDDetailsDialog",
                        controller: oDetails.controller
                    }).then(function (oDialog) {
                        // connect dialog to the root view of this component (models, lifecycle)
                        oDetails.view.addDependent(oDialog);
                        if (Device.system.desktop) {
                            oDialog.addStyleClass("sapUiSizeCompact");
                        }
                        oDialog.bindElement({
                            path: oDetails.sParentItemPath,
                            parameters: {
                                "expand": 'UDDetail'
                            }
                        });
                        oDialog.setTitle(oDetails.title);
                        return oDialog;
                    });
                }
                this.pDialog.then(function (oDialog) {
                    oDetails.view.addDependent(oDialog);
                    oDialog.bindElement({
                        path: oDetails.sParentItemPath,
                        parameters: {
                            'expand': 'UDDetail'
                        }
                    });
                    oDialog.setTitle(oDetails.title);
                    oDialog.open();
                });
            },

            onViewUDDetailsDialogClose: function (oEvent) {
                this.pDialog.then(function (oDialog) {
                    oDialog.close();
                });
            },

            onCancelGRNPress: function (oEvent) {
                var that = this;
                var gID = oEvent.getSource().getBindingContext().getObject().ID;
                var oPayload = {
                    "GRNId": gID
                };
                MessageBox.confirm("Do you really want to cancel GRN ?", {
                    icon: MessageBox.Icon.INFORMATION,
                    title: "Confirm",
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.YES,
                    onClose: function (oAction) {
                        if (oAction == "YES") {
                            that.getOwnerComponent().getModel().create("/CancelGRNEdmSet", oPayload, {
                                success: function (oData, oResponse) {
                                    sap.m.MessageBox.success("This GRN is cancelled");
                                    that.getOwnerComponent().getModel().refresh();
                                }.bind(this),
                                error: function (oError) {
                                    sap.m.MessageBox.error(JSON.stringify(oError));
                                }
                            });
                        }
                    }
                });
            },

            onRequestGRNPress: function (oEvent) {
                var that = this;
                var sParentItemPath = this.getView().getBindingContext().sPath;
                var requestModel = new JSONModel({
                    quantity: null,
                    delivery: null,
                    valueState: null,
                    isConfirmButtonEnabled: false,
                    valueStateText: ""
                });
                this.getView().setModel(requestModel, "requestModel");

                if (!this._oRequestDialog) {
                    this._oRequestDialog = sap.ui.xmlfragment("com.agel.mmts.storeinchargeraisedpo.view.fragments.common.ViewRequestGRNDialog", this);
                    var oDialog = this._oRequestDialog;
                    this.getView().addDependent(oDialog);
                    if (Device.system.desktop) {
                        oDialog.addStyleClass("sapUiSizeCompact");
                    }
                    oDialog.bindElement({
                        path: sParentItemPath,
                        parameters: {
                            "expand": 'StockParentItem, PurchaseOrder, PackingListParentItems'
                        }
                    });
                    oDialog.setTitle("Request GRN");
                    // return oDialog;
                }
                this._oRequestDialog.open();
            },
            onDeliveryNoteLiveChange: function (oEvent) {
                var oPOData = this.getView().getBindingContext().getObject();
                if (oEvent.getSource().getValue().length && parseInt(oEvent.getSource().getValue()) > 0)
                    this.getViewModel("requestModel").setProperty("/isConfirmButtonEnabled", true);
                else
                    this.getViewModel("requestModel").setProperty("/isConfirmButtonEnabled", false);
            },
            onQuantityLiveChange: function (oEvent) {
                var oGRNData = this.getView().getBindingContext().getObject();
                if (oEvent.getSource().getValue().length && parseInt(oEvent.getSource().getValue()) > 0)
                    this.getViewModel("requestModel").setProperty("/isConfirmButtonEnabled", true);
                else
                    this.getViewModel("requestModel").setProperty("/isConfirmButtonEnabled", false);

                if (parseInt(oEvent.getSource().getValue()) > parseInt(oGRNData.TotalWeight)) {
                    this.getViewModel("requestModel").setProperty("/valueState", "Error");
                    this.getViewModel("requestModel").setProperty("/valueStateText", "Total Packaging Weight should not exceed Total Vendor Entered Weight.");
                    this.getViewModel("requestModel").setProperty("/isConfirmButtonEnabled", false);
                }
                else {
                    this.getViewModel("requestModel").setProperty("/valueState", null);
                    this.getViewModel("requestModel").setProperty("/valueStateText", "");
                    this.getViewModel("requestModel").setProperty("/isConfirmButtonEnabled", true);
                }
            },

            onViewChildDialogClose: function (oEvent) {
                this._oRequestDialog.close();
            },

            onRequestPress: function (oEvent) {
                this._oRequestDialog.close();
                var sDelivery = this.getViewModel("requestModel").getProperty("/delivery");
                var sQuantity = this.getViewModel("requestModel").getProperty("/quantity");
                var oModel = this.getComponentModel();
                if (parseInt(sQuantity) > 0) {
                    if (sDelivery !== null) {
                        var oPayload = {
                            "QTY": parseInt(sQuantity),
                            "DeliveryNote": sDelivery,
                            "PackingListId": this.getView().getBindingContext().getObject().ID
                        };
                    } else {
                        var oSelectedItemData = this.byId("idGRNTable").getSelectedItem().getBindingContext().getObject();

                        var oPayload = {
                            "TotalPackagingWeight": parseInt(sQuantity),
                            "DeliveryNote": sDelivery,
                            "PackingListId": parseInt(oSelectedItemData.ID)
                        };
                    }
                    if (oPayload) {
                        oModel.create("/GRNEdmSet", oPayload, {
                            success: function (oData) {
                                sap.m.MessageBox.success(oData.Message);
                                this.getComponentModel().refresh();
                            }.bind(this),
                            error: function (oError) {
                                sap.m.MessageBox.error(JSON.stringify(oError));
                            }
                        });
                    }
                } else {
                    sap.m.MessageBox.error("Please enter positive and a non zero number for Quantity")
                }

            },


        });
    });
