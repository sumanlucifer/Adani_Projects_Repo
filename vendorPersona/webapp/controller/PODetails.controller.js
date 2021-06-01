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

    return BaseController.extend("com.agel.mmts.vendorPersona.controller.PODetails", {
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

            this._initializeCreationModels();

            // Keeps reference to any of the created sap.m.ViewSettingsDialog-s in this sample
            this._mViewSettingsDialogs = {};

            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RoutePODetailPage").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sObjectId = oEvent.getParameter("arguments").POId;
            this._bindView("/PurchaseOrderSet" + sObjectId);
        },

        _initializeCreationModels: function () {
            var oModel = new JSONModel({
                "parent_line_item_id": null,
                "description": null,
                "po_number": null,
                "material_code": null,
                "qty": null,
                "purchase_order_ID": null
            });
            this.getView().setModel(oModel, "parentItemCreationModel")

            var oModel = new JSONModel({
                "parent_line_item_ID": null,
                "child_line_item_id": (Math.floor(Math.random() * (7777777777 - 7000000000 + 1)) + 7000000000).toString(),
                "description": null,
                "material_code": null,
                "qty": null,
                "comments": "Additional child items comments",
                "uom": null
            });
            this.getView().setModel(oModel, "childItemCreationModel")
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

        //when the breadcrum pressed
        handleToAllVendorsBreadcrumPress: function (oEvent) {
            this.getRouter().navTo("RouteLandingPage");
        },

        handleToAllPOBreadcrumPress: function (oEvent) {
            history.go(-1);
        },

        onParentItemsTableUpdateFinished: function (oEvent) {
            //  oEvent.getSource().removeSelections();
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


        onConfirmPO: function (oEvent) {
            var sPath = this.getView().getBindingContext().getPath();
            var oPayload = {
                "Status":"CONFIRMED"
            };

            this.getComponentModel().update(sPath, oPayload,{
                success: function(oData, oResponse){
                    sap.m.MessageBox.success("Purchase order has been confirmed! Please raise the inspection call through SIMS portal.");
                    this.getComponentModel().refresh();
                }.bind(this),
                error: function(oError){
                    sap.m.MessageBox.error(JSON.stringify(oError));
                }
            })
        },

        onPackingListPress: function (oEvent) {
            // The source is the list item that got pressed
            this._showPackingDetails(oEvent.getSource());
        },


        onCreateChildItemPress: function (oEvent) {
            if (!this._oCreateParentItemDialog) {
                this._oCreateDialog = sap.ui.xmlfragment("com.agel.mmts.vendorPersona.view.fragments.PODetails.CreateChildItem", this);
                this.getView().addDependent(this._oCreateDialog);
            }
            this._oCreateDialog.open();
        },

        onSaveChildLineItemPress: function (oEvent) {
            var that = this;

            var oTable = this.getView().byId("idChildItemsTable"),
                oBinding = oTable.getBinding("items"),
                aInputData = this.getViewModel("childItemCreationModel").getData(),
                aBindingContextPath = oTable.getBindingContext().getPath(),

                // Create a new entry through the table's list binding
                oContext = oBinding.create({
                    "parent_line_item_ID": aBindingContextPath.slice("/ParentLineItems(".length, aBindingContextPath.length - 1),
                    "child_line_item_id": aInputData.child_line_item_id,
                    "description": aInputData.description,
                    "material_code": aInputData.material_code,
                    "qty": parseInt(aInputData.qty),
                    "comments": aInputData.comments,
                    "uom": aInputData.uom
                });

            console.log(oContext);


            oContext.created().then(function () {
                sap.m.MessageBox.success("New entry created!");
            }.bind(oContext, that), function (error) {
                sap.m.MessageBox.success("Error Creating Entries!!");
            }.bind(oContext));
            this.closeDialog();
        },

        onChildItemsSavePress: function (oEvent) {
            // saving the entry
            var fnSuccess = function (response) {
            }.bind(this);

            var fnError = function (oError) {
                sap.m.MessageBox.alert(oError.toString());
            }.bind(this);

            this.getView().getModel().submitBatch("childLineItemGroup").then(fnSuccess, fnError);
        },

        // On Search of Parent Line Items Table 
        onSearch: function (oEvent) {
            var aFilters = [];
            var FreeTextSearch = this.getView().byId("idSearchField").getValue();
            if (FreeTextSearch) {
                aFilters.push(new Filter("material_code", FilterOperator.Contains, FreeTextSearch));
                aFilters.push(new Filter("description", FilterOperator.Contains, FreeTextSearch));
                //  aFilters.push(new Filter("qty", FilterOperator.Contains, FreeTextSearch));
                aFilters.push(new Filter("uom", FilterOperator.Contains, FreeTextSearch));
            }
            var mFilters = new Filter({
                filters: aFilters,
                and: false
            });
            var oTableBinding = this.getView().byId("idParentLineItemsTable").getBinding("items");
            oTableBinding.filter(mFilters);
        },

        // On Search of Child Line Items Table 
        onSearchChildItem: function (oEvent) {
            var aFilters = [];
            var FreeTextSearch = this.getView().byId("idSearchField").getValue();
            if (FreeTextSearch) {
                //  aFilters.push(new Filter("material_code", FilterOperator.Contains, FreeTextSearch));
                aFilters.push(new Filter("description", FilterOperator.Contains, FreeTextSearch));
                //  aFilters.push(new Filter("qty", FilterOperator.Contains, FreeTextSearch));
                aFilters.push(new Filter("uom", FilterOperator.Contains, FreeTextSearch));
            }
            var mFilters = new Filter({
                filters: aFilters,
                and: false
            });
            var oTableBinding = this.getView().byId("idChildItemsTable").getBinding("items");
            oTableBinding.filter(mFilters);
        },

        onSearchInspectionItem: function (oEvent) {
            var aFilters = [];
            var FreeTextSearch = this.getView().byId("idSearchFieldInspectionID").getValue();
            if (FreeTextSearch) {
                //  aFilters.push(new Filter("material_code", FilterOperator.Contains, FreeTextSearch));
                aFilters.push(new Filter("inspection_call_id", FilterOperator.Contains, FreeTextSearch));
                //  aFilters.push(new Filter("qty", FilterOperator.Contains, FreeTextSearch));
                //     aFilters.push(new Filter("uom", FilterOperator.Contains, FreeTextSearch));
            }
            var mFilters = new Filter({
                filters: aFilters,
                and: false
            });
            var oTableBinding = this.getView().byId("idInspectionTable").getBinding("items");
            oTableBinding.filter(mFilters);
        },


        _showPackingDetails: function (oItem) {
            var that = this;
            oItem.getBindingContext().requestCanonicalPath().then(function (sObjectPath) {
                that.getRouter().navTo("RoutePackingDeatilsPage", {
                    packingListID: sObjectPath.slice("/PackingLists".length) // /PurchaseOrders(123)->(123)
                });
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

        onManageBOQItemPress: function (oEvent) {
            var sPONumber = this.getView().getBindingContext().getObject().PONumber;
            var mBindingParams = oEvent.getParameters().getParameter("bindingParams");
            mBindingParams.parameters["expand"] = "BOQGroups";
            mBindingParams.parameters["navigation"] = { "ParentLineItemSet": "BOQGroups" };
            mBindingParams.parameters["treeAnnotationProperties"] = { "hierarchyLevelFor": 'HierarchyLevel', "hierarchyNodeFor": 'ID', "hierarchyParentNodeFor": 'ParentNodeID' };
            mBindingParams.filters.push(new sap.ui.model.Filter("PONumber", sap.ui.model.FilterOperator.EQ, sPONumber));
        },

        onBeforeShow: function (evt) {
            this.getView().getContent()[0].getSections()[1].rerender();
            this.getView().getContent()[0].getSections()[2].rerender();
            this.getView().getContent()[0].getSections()[3].rerender();
            this.getView().getContent()[0].getSections()[4].rerender();
        },

        onSendForApprovalPress: function (oEvent) {
            var oBOQGroupSelected = oEvent.mParameters.getSource().getBindingContext().getObject();
            var sPurchaseOrderId = this.getView().getBindingContext().getObject().ID;
            var oModel = new JSONModel({
                oBOQGroupSelected: oBOQGroupSelected,
                sPurchaseOrderId: sPurchaseOrderId
            });
            this.getView().setModel(oModel, "sendForApprovalModel");
            this._openConfirmationDialog();
        },

        _openConfirmationDialog: function () {
            //if (!this.oApproveDialog) {
            this.oApproveDialog = new Dialog({
                type: sap.m.DialogType.Message,
                title: "Confirm",
                content: new Text({ text: "Do you want to send the " + this.getViewModel("sendForApprovalModel").getProperty("/oBOQGroupSelected").Name + " group for TC approval?" }),
                beginButton: new Button({
                    type: sap.m.ButtonType.Emphasized,
                    text: "Send",
                    press: function () {
                        this.sendForApproval();
                        this.oApproveDialog.close();
                    }.bind(this)
                }),
                endButton: new Button({
                    text: "Cancel",
                    press: function () {
                        this.oApproveDialog.close();
                    }.bind(this)
                })
            });
            //}

            this.oApproveDialog.open();
        },

        sendForApproval: function (oEvent) {
            this.oApproveDialog.close();
            var sendForApprovalModel = this.getViewModel("sendForApprovalModel");
            var oPayload = {
                "PurchaseOrderId": sendForApprovalModel.getProperty("/sPurchaseOrderId"),
                "BOQGroupId": sendForApprovalModel.getProperty("/oBOQGroupSelected").ID
            };
            this.getComponentModel().create("/ParentLineItemTCApprovalListSet", oPayload, {
                success: function (oData, oEvent) {
                    if (oData.Success)
                        sap.m.MessageBox.success(oData.Message);
                    else
                        sap.m.MessageBox.error(oData.Message);
                     this.getView().getContent()[0].getSections()[2].rerender();
                }.bind(this),
                error: function (oError) {
                    sap.m.MessageBox.success(JSON.stringify(oError));
                }
            });
        },

        onViewBOQItemPress: function (oEvent) {
            var sBOQItemPath = oEvent.mParameters.getSource().getBindingContext().getPath();
            var sDialogTitle = oEvent.mParameters.getSource().getBindingContext().getObject().Name + " Items";
            var oDetails = {};
            oDetails.controller = this;
            oDetails.view = this.getView();
            oDetails.sBOQItemPath = sBOQItemPath;
            oDetails.title = sDialogTitle;
            if (!this.boqDialog) {
                this.boqDialog = Fragment.load({
                    id: oDetails.view.getId(),
                    name: "com.agel.mmts.vendorPersona.view.fragments.PODetails.ViewBOQItems",
                    controller: oDetails.controller
                }).then(function (oDialog) {
                    // connect dialog to the root view of this component (models, lifecycle)
                    oDetails.view.addDependent(oDialog);
                    oDialog.bindElement({
                        path: oDetails.sBOQItemPath
                    });
                    oDialog.setTitle(oDetails.title)
                    if (Device.system.desktop) {
						oDialog.addStyleClass("sapUiSizeCompact");
					}
                    return oDialog;
                });
            }
            this.boqDialog.then(function (oDialog) {
                oDetails.view.addDependent(oDialog);
                oDialog.bindElement({
                    path: oDetails.sBOQItemPath,
                });
                oDialog.open();
            });
        },

         onViewBOQItemDialogClose: function (oEvent) {
            this.boqDialog.then(function (oDialog) {
                oDialog.close();
            });
        }

    });
});