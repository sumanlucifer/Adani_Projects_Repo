sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/Device",
    'sap/ui/core/ValueState',
    '../utils/formatter'
], function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, ValueState, formatter) {
    "use strict";

    return BaseController.extend("com.agel.mmts.storeinchargeraisedpo.controller.LandingPage", {
        formatter: formatter,

        onInit: function () {
            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RouteLandingPage").attachPatternMatched(this._onObjectMatched, this);

            //view model instatiation
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0
            });
            this.setModel(oViewModel, "objectViewModel");

            // Icon Tab Count Model
            var oIconTabCountModel = new JSONModel({
                openCount: null,
                confirmCount: null,
                // dispatchCount: null,
                closedCount: null
            });
            this.setModel(oIconTabCountModel, "oIconTabCountModel");

            // keeps the search state
            this._aTableSearchState = [];
            // Keeps reference to any of the created dialogs
            this._mViewSettingsDialogs = {};

            //adding searchfield association to filterbar and initialize the filter bar -> added in base controller
            this.initializeFilterBar();

            // var startupParams = this.getOwnerComponent().getComponentData().startupParameters;
            // // get Startup params from Owner Component
            // if (startupParams.Kind[0]) {
            //     this.type = startupParams.Kind[0];
            //      this.byId("idIconTabBar").setSelectedKey(this.type);
            // }
        },

        _onObjectMatched: function (oEvent) {
            this.onIconTabBarChanged();
        },

        // Raised Po Table Before Bind
        onbeforeRebindRaisedPoTable: function (oEvent) {
            var mBindingParams = oEvent.getParameter("bindingParams");
            mBindingParams.filters.push(new Filter("Status", sap.ui.model.FilterOperator.EQ, "PENDING"));
            mBindingParams.filters.push(new Filter("Status", sap.ui.model.FilterOperator.EQ, "CONFIRMED"));
        },

        // InTransit Po Table Before Bind
        onbeforeRebindInTransitPoTable: function (oEvent) {
            var mBindingParams = oEvent.getParameter("bindingParams");
            mBindingParams.filters.push(new Filter("Status", sap.ui.model.FilterOperator.EQ, "IN PROGRESS"));
        },

        // Received Po Table Before Bind
        // onbeforeRebindReceivedPoTable: function (oEvent) {
        //     var mBindingParams = oEvent.getParameter("bindingParams");
        //     mBindingParams.filters.push(new Filter("Status", sap.ui.model.FilterOperator.EQ, "CLOSED"));
        // },

        // Closed Po Table Before Bind
        onbeforeRebindClosedPoTable: function (oEvent) {
            var mBindingParams = oEvent.getParameter("bindingParams");
            mBindingParams.filters.push(new Filter("Status", sap.ui.model.FilterOperator.EQ, "CLOSED"));   
        },

        onRaisedPOTableUpdateFinished: function (oEvent) {
            this.setIconTabCount(oEvent, oEvent.getParameter("total"), "/openCount");
        },

        onInTransitPOTableUpdateFinished: function (oEvent) {                      
            this.setIconTabCount(oEvent, oEvent.getParameter("total"), "/confirmCount");
        },

        onClosedPOTableUpdateFinished: function (oEvent) {                       
            this.setIconTabCount(oEvent, oEvent.getParameter("total"), "/closedCount");
        },

        setIconTabCount: function (oEvent, total, property) {
            if (oEvent.getSource().getBinding("items").isLengthFinal()) {
                this.getView().getModel("oIconTabCountModel").setProperty(property, total);
            }
        },

        // On Icon Tab Select
        onIconTabBarChanged: function (sKey) {
             if (sKey === "RAISED") {
                 this.byId("pageTitle").setText(this.getResourceBundle().getText("raisedPO"));
             } else if (sKey === "INPROGRESS") {
                 this.byId("pageTitle").setText(this.getResourceBundle().getText("inProgressPO"));
             } else if(sKey === "CLOSED") {
                 this.byId("pageTitle").setText(this.getResourceBundle().getText("closedPO"));
             }
        },

        // On Icon Tab Select
        onIconTabSelect: function (oEvent) {
             var sKey = oEvent.getParameter("key");

             if (sKey === "RAISED") {
                 this.byId("pageTitle").setText(this.getResourceBundle().getText("raisedPO"));
             } else if (sKey === "INPROGRESS") {
                 this.byId("pageTitle").setText(this.getResourceBundle().getText("inProgressPO"));
             } else if(sKey === "CLOSED") {
                 this.byId("pageTitle").setText(this.getResourceBundle().getText("closedPO"));
             }
        },

        //triggers on press of a PO cheveron item from the Flist
        onPurchaseOrderPress: function (oEvent) {
            // The source is the list item that got pressed
            this._showObject(oEvent.getSource());
        },

        _showObject: function (oItem) {
            var that = this;
            var sObjectPath = oItem.getBindingContext().sPath;
            var sKey = this.byId("idIconTabBar").getSelectedKey();
            that.getRouter().navTo("RoutePODetailsPage", {
                    POId: sObjectPath.slice("/PurchaseOrderSet".length),
                    Type: sKey
                });
        },

        //Breadcrum pressed
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
            var CompanyCode = this.byId("idCompanyCode").getValue();
            var orFilters = [];
            var andFilters = [];

            var FreeTextSearch = this.byId("filterbar").getBasicSearchValue();
            if (FreeTextSearch) {
                orFilters.push(new Filter("PONumber", FilterOperator.Contains, FreeTextSearch));
                orFilters.push(new Filter("MasterCompanyCode/CompanyCode", FilterOperator.EQ, FreeTextSearch));
                orFilters.push(new Filter("ParentLineItems/Name", FilterOperator.Contains, FreeTextSearch));
                andFilters.push(new Filter(orFilters, false));
            }

            if (poNumber != "") {
                andFilters.push(new Filter("PONumber", FilterOperator.EQ, poNumber));
            }

            if (DateRangeValue != "") {
                var From = new Date(DateRange.getFrom());
                var To = new Date(DateRange.getTo());
                andFilters.push(new Filter("POReleaseDate", FilterOperator.BT, From.toISOString(), To.toISOString()));
            }

            if (CompanyCode != "") {
                andFilters.push(new Filter("MasterCompanyCode/CompanyCode", FilterOperator.EQ, CompanyCode));
            }

            var idRaisedPOTableBinding = this.getView().byId("idRaisedPOTable").getTable().getBinding("items");
            var idInTransitPOTableBinding = this.getView().byId("idInTransitPOTable").getTable().getBinding("items");
            var idClosedPOTableBinding = this.getView().byId("idClosedPOTable").getTable().getBinding("items");

            if (andFilters.length == 0) {
                andFilters.push(new Filter("PONumber", FilterOperator.NE, ""));
                idRaisedPOTableBinding.filter(new Filter(andFilters, true));
                idInTransitPOTableBinding.filter(new Filter(andFilters, true));
                idClosedPOTableBinding.filter(new Filter(andFilters, true));
            }

            if (andFilters.length > 0) {
                idRaisedPOTableBinding.filter(new Filter(andFilters, true));
                idInTransitPOTableBinding.filter(new Filter(andFilters, true));
                idClosedPOTableBinding.filter(new Filter(andFilters, true));
            }
            oTableBinding.filter(mFilters);
        },

        onResetFilters: function () {
            this.oFilterBar._oBasicSearchField.setValue("");
            this.byId("idNameInput").setValue("");
            this.byId("dateRangeSelectionId").setValue("");
            this.byId("idCompanyCode").setValue("");

            var idRaisedPOTableBinding = this.getView().byId("idRaisedPOTable").getTable().getBinding("items");
            var idInTransitPOTableBinding = this.getView().byId("idInTransitPOTable").getTable().getBinding("items");
            var idClosedPOTableBinding = this.getView().byId("idClosedPOTable").getTable().getBinding("items");


            idRaisedPOTableBinding.filter([]);
            idInTransitPOTableBinding.filter([]);
            idClosedPOTableBinding.filter([]);

            this.oFilterBar.fireFilterChange();
        },

        onFilterChange: function (oEvent) {
            //   if (oEvent.getSource().getValue().length){
            this.oFilterBar.fireFilterChange(oEvent);
            //  }
        },

        onViewLineItemsPress: function (oEvent) {
            var sParentItemPath = oEvent.getSource().getParent().getBindingContextPath();
            var sDialogTitle = "PO - " + oEvent.getSource().getBindingContext().getObject().PONumber;
            var oDetails = {};
            oDetails.controller = this;
            oDetails.view = this.getView();
            oDetails.sParentItemPath = sParentItemPath;
            oDetails.title = sDialogTitle;
            if (!this.pDialog) {
                this.pDialog = Fragment.load({
                    id: oDetails.view.getId(),
                    name: "com.agel.mmts.storeinchargeraisedpo.view.fragments.landingPage.ViewLineItemsDialog",
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
                            "expand": 'ParentLineItems'
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
                        'expand': 'ParentLineItems'
                    }
                });
                oDialog.setTitle(oDetails.title);
                oDialog.open();
            });
        },

        onViewChildDialogClose: function (oEvent) {
            this.pDialog.then(function (oDialog) {
                oDialog.close();
            });
        }
    });
});