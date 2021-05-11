sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/Device",
    'sap/ui/core/ValueState'
], function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, ValueState) {
    "use strict";

    return BaseController.extend("com.agel.mmts.vendorPersona.controller.DetailPage", {

        onInit: function () {
            this.getView().setModel(new JSONModel({ QRCode: "" }), "ui")
            //view model instatiation
            var oViewModel = new JSONModel({
                busy: true,
                delay: 0
            });
            this.setModel(oViewModel, "objectViewModel");

            // Icon Tab Count Model
            var oIconTabCountModel = new JSONModel({
                openCount: null,
                confirmCount: null,
                dispatchCount: null
            });
            this.setModel(oIconTabCountModel, "oIconTabCountModel");

            // keeps the search state
            this._aTableSearchState = [];
            // Keeps reference to any of the created dialogs
            this._mViewSettingsDialogs = {};

            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RouteDetailPage").attachPatternMatched(this._onObjectMatched, this);

            this._initializeCreationModel();

            //adding searchfield association to filterbar                                    
            this._addSearchFieldAssociationToFB();

            this.oFilterBar = null;
            this.oFilterBar = this.byId("filterbar");

            this.oFilterBar.registerFetchData(this.fFetchData);
            this.oFilterBar.registerApplyData(this.fApplyData);
            this.oFilterBar.registerGetFiltersWithValues(this.fGetFiltersWithValues);

            this.oFilterBar.fireInitialise();
        },

        _addSearchFieldAssociationToFB: function () {
            let oFilterBar = this.getView().byId("filterbar");
            let oSearchField = oFilterBar.getBasicSearch();
            var oBasicSearch;
            if (!oSearchField) {
                // @ts-ignore   
                oBasicSearch = new sap.m.SearchField({ id: "idSearch", showSearchButton: false });
                oBasicSearch.attachLiveChange(this.onFilterChange, this);
            } else {
                oSearchField = null;
            }
            oFilterBar.setBasicSearch(oBasicSearch);
            oBasicSearch.attachBrowserEvent("keyup", function (e) {
                if (e.which === 13) {
                    this.onSearch();
                }
            }.bind(this));
        },

        _onObjectMatched: function (oEvent) {
            var sObjectId = oEvent.getParameter("arguments").vendorId;
            this._bindView();
            this.getDataForTreeTable();
        },

        _initializeCreationModel: function () {
            var oCreationModel = new JSONModel({
                "invoice_number": "",
                "po_number": "",
                "po_release_date": ""
            });
            this.getView().setModel(oCreationModel, "creationModel")
        },

        // on Bind View 
        _bindView: function () {
            var userInfo = sap.ushell.Container.getService("UserInfo");
            var userEmail = userInfo.getEmail();

            userEmail = userEmail || 'venkatesh.hulekal@extentia.com'
            // Open PO table
            this._filterItemsAndBindTable("idPurchaseOrdersTable", "PENDING", userEmail);
            this._filterItemsAndBindTable("idConfirmPOTable", "CONFIRMED", userEmail);
            this._filterItemsAndBindTable("idDispatchedPOTable", "DISPATCHED", userEmail);

            /* this.getView().byId("smartHistory").bindItems({
                path: "/PurchaseOrders",
                template: this.byId("smartTemplate").getBindingInfo("items").template,
                events: {
                    dataRequested: function () {
                       
                    },
                    dataReceived: function () {
                    
                    }
                }
            }); */
        },

        _filterItemsAndBindTable: function (sTableID, status, email) {
            var objectViewModel = this.getViewModel("objectViewModel");
            this.getView().byId(sTableID).bindItems({
                path: "/PurchaseOrders",
                template: this.byId(sTableID).getBindingInfo("items").template,
                parameters: {
                    "$expand": {
                        "vendor": {}
                    },
                    "$filter": "vendor/email eq '" + email + "' and status eq '" + status + "'",
                    "$count": true
                },
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

        onPurchaseOrderTableUpdateFinished: function (oEvent) {
            //Setting the header context for a property binding to $count
            this.setIconTabCount(oEvent, oEvent.getParameter("total"), "/openCount");
        },

        onConfirmPOTableUpdateFinished: function (oEvent) {
            //Setting the header context for a property binding to $count                       
            this.setIconTabCount(oEvent, oEvent.getParameter("total"), "/confirmCount");
        },

        onDispatchPOTableUpdateFinished: function (oEvent) {
            //Setting the header context for a property binding to $count               
            this.setIconTabCount(oEvent, oEvent.getParameter("total"), "/dispatchCount");
        },

        setIconTabCount: function (oEvent, total, property) {
            if (oEvent.getSource().getBinding("items").isLengthFinal()) {
                this.getView().getModel("oIconTabCountModel").setProperty(property, total);
            }
        },

        // On Icon Tab Select
        onIconTabSelect: function (oEvent) {
            var sKey = oEvent.getParameter("key");
            console.log(sKey);
            if (sKey === "OpenPOKey") {
                this.byId("pageTitle").setText(this.getResourceBundle().getText("OpenPOs"));
            } else if (sKey == "ConfirmPOKey") {
                this.byId("pageTitle").setText(this.getResourceBundle().getText("ConfirmedPOs"));
                //this.byId("pageTitle").setText("Confirmed PO");
            } else {
                this.byId("pageTitle").setText(this.getResourceBundle().getText("DispatchedPOs"));
            }
        },

        _getViewSettingsDialog: function (sDialogFragmentName) {
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

        handleSortButtonPressed: function () {
            this._getViewSettingsDialog("com.agel.mmts.vendorPersona.view.fragments.detailPage.SortDialog")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },

        handleFilterButtonPressed: function (oEvent) {
            this._getViewSettingsDialog("com.agel.mmts.vendorPersona.view.fragments.detailPage.FilterDialog")
                .then(
                    function (oViewSettingsDialog) {
                        oViewSettingsDialog.setModel(this.getComponentModel());
                        oViewSettingsDialog.open();
                    }.bind(this)
                );
        },

        handleSortDialogConfirm: function (oEvent) {
            var oTable = this.byId("idPurchaseOrdersTable"),
                mParams = oEvent.getParameters(),
                oBinding = oTable.getBinding("items"),
                sPath,
                bDescending,
                aSorters = [];

            sPath = mParams.sortItem.getKey();
            bDescending = mParams.sortDescending;
            aSorters.push(new Sorter(sPath, bDescending));

            // apply the selected sort and group settings
            oBinding.sort(aSorters);
        },

        handleFilterDialogConfirm: function (oEvent) {
            var oTable = this.byId("idPurchaseOrdersTable"),
                mParams = oEvent.getParameters(),
                oBinding = oTable.getBinding("items"),
                aFilters = [];

            var sPath = Object.keys(mParams.filterCompoundKeys)[0],
                sOperator = "EQ",
                sValue1 = mParams.filterKeys.CONFIRMED ? 'CONFIRMED' : 'PENDING',
                oFilter = new Filter(sPath, sOperator, sValue1);

            aFilters.push(oFilter);

            // apply filter settings
            oBinding.filter(aFilters);

            // update filter bar
            this.byId("vsdFilterBar").setVisible(aFilters.length > 0);
            this.byId("vsdFilterLabel").setText(mParams.filterString);
        },

        //triggers on press of a vendor item from the list
        onPurchaseOrderPress: function (oEvent) {
            // The source is the list item that got pressed
            this._showObject(oEvent.getSource());
        },

        _showObject: function (oItem) {
            var that = this;
            oItem.getBindingContext().requestCanonicalPath().then(function (sObjectPath) {
                that.getRouter().navTo("RoutePODetailPage", {
                    POId: sObjectPath.slice("/PurchaseOrders".length) // /PurchaseOrders(123)->(123)
                });
            });
        },

        //when the breadcrum pressed
        handleToAllVendorsBreadcrumPress: function (oEvent) {
            this.getRouter().navTo("RouteLandingPage");

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

        // on Go Search 
        onSearch: function (oEvent) {

            var poNumber = this.byId("idNameInput").getValue();
            var DateRange = this.byId("dateRangeSelectionId");
            var DateRangeValue = this.byId("dateRangeSelectionId").getValue();
            var orFilters = [];
            var andFilters = [];

            var FreeTextSearch = this.byId("filterbar").getBasicSearchValue();
            if (FreeTextSearch) {
                orFilters.push(new Filter("po_number", FilterOperator.Contains, FreeTextSearch));
                orFilters.push(new Filter("vendor/name", FilterOperator.EQ, FreeTextSearch));
                orFilters.push(new Filter("status", FilterOperator.EQ, FreeTextSearch));
                //   aFilters.push(new Filter("purchase_order/parent_line_items/qty", FilterOperator.EQ, FreeTextSearch));

                andFilters.push(new Filter(orFilters, false));
            }

            if (poNumber != "") {
                andFilters.push(new Filter("po_number", FilterOperator.EQ, poNumber));
            }

            if (DateRangeValue != "") {
                var From = new Date(DateRange.getFrom());
                var To = new Date(DateRange.getTo());
                andFilters.push(new Filter("po_release_date", FilterOperator.BT, From.toISOString(), To.toISOString()));
            }

            var idOpenPOTableBinding = this.getView().byId("idPurchaseOrdersTable").getBinding("items");
            var idConfirmPOTableBinding = this.getView().byId("idConfirmPOTable").getBinding("items");
            var idDispatchedPOTableBinding = this.getView().byId("idDispatchedPOTable").getBinding("items");
            idOpenPOTableBinding.filter(new Filter(andFilters, true));
            idConfirmPOTableBinding.filter(new Filter(andFilters, true));
            idDispatchedPOTableBinding.filter(new Filter(andFilters, true));
            // oTableBinding.filter(mFilters);
        },

        onFilterChange: function (oEvent) {
            //   if (oEvent.getSource().getValue().length){
            this.oFilterBar.fireFilterChange(oEvent);
            //  }
        },

        fFetchData: function () {
            var oJsonParam;
            var oJsonData = [];
            var sGroupName;
            var oItems = this.getAllFilterItems(true);

            for (var i = 0; i < oItems.length; i++) {
                oJsonParam = {};
                sGroupName = null;
                if (oItems[i].getGroupName) {
                    sGroupName = oItems[i].getGroupName();
                    oJsonParam.groupName = sGroupName;
                }

                oJsonParam.name = oItems[i].getName();

                var oControl = this.determineControlByFilterItem(oItems[i]);
                if (oControl) {
                    oJsonParam.value = oControl.getValue();
                    oJsonData.push(oJsonParam);
                }
            }

            return oJsonData;
        },

        fApplyData: function (oJsonData) {

            var sGroupName;

            for (var i = 0; i < oJsonData.length; i++) {

                sGroupName = null;

                if (oJsonData[i].groupName) {
                    sGroupName = oJsonData[i].groupName;
                }

                var oControl = this.determineControlByName(oJsonData[i].name, sGroupName);
                if (oControl) {
                    oControl.setValue(oJsonData[i].value);
                }
            }
        },

        fGetFiltersWithValues: function () {
            var i;
            var oControl;
            var aFilters = this.getFilterGroupItems();

            var aFiltersWithValue = [];

            for (i = 0; i < aFilters.length; i++) {
                oControl = this.determineControlByFilterItem(aFilters[i]);
                if (oControl && oControl.getValue && oControl.getValue()) {
                    aFiltersWithValue.push(aFilters[i]);
                }
            }

            return aFiltersWithValue;
        },

        onQRPress: function () {
            /* jQuery.sap.require("sap.ndc.BarcodeScanner");
			sap.ndc.BarcodeScanner.scan(
				function(mResult) {
					debugger;
				},
				function(Error) {
					debugger;
				},
            ); */
            debugger;

        },

        onBeforeRebindHistoryTable: function (oEvent) {
            var oView = this.getView();

            var oBindingParams = oEvent.getParameter("bindingParams");
            var oFilter = new Filter(
                "po_number",
                FilterOperator.Contains,
                "acb"
            );
            oBindingParams.filters.push(oFilter);
            oBindingParams.sorter.push(new Sorter("po_number", true));
        },

        onQRCodeScanned: function (event) {
            //qr code from event
            console.log(event.getParameter("value"));
            //or use binding
            sap.m.MessageToast.show("Scanned QRCode: " + this.getView().getModel("ui").getProperty("/QRCode"));
        },

        getDataForTreeTable: function () {
            var oModel = this.getView().getModel();
            oModel.read("/ParentLineItems", {
                filters: [new Filter({
                    path: "po_number",
                    operator: FilterOperator.EQ,
                    value1: "4500326716"
                })
                ],

                success: function (oData, oResponse) {
                    debugger;
                }.bind(this),
                error: function (error) {
                    sap.m.MessageBox.error(error.message);
                }
            });
        }




    });
});
