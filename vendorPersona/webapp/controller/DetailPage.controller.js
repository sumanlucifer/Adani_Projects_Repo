sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/Device",
    'sap/ui/core/ValueState',
    '../utils/formatter',
], function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, ValueState, formatter) {
    "use strict";

    return BaseController.extend("com.agel.mmts.vendorPersona.controller.DetailPage", {
        formatter: formatter,

        onInit: function () {
            //Router Object
            this.oRouter = this.getRouter();
            this.oRouter.getRoute("RouteDetailPage").attachPatternMatched(this._onObjectMatched, this);

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
                dispatchCount: null
            });
            this.setModel(oIconTabCountModel, "oIconTabCountModel");

            // keeps the search state
            this._aTableSearchState = [];
            // Keeps reference to any of the created dialogs
            this._mViewSettingsDialogs = {};

            //adding searchfield association to filterbar and initialize the filter bar -> added in base controller
            this.initializeFilterBar();
        },

        _onObjectMatched: function (oEvent) {

        },

        // Open Po Table Before Bind
        onbeforeRebindOpenPoTable: function (oEvent) {
            var mBindingParams = oEvent.getParameter("bindingParams");
            mBindingParams.filters.push(new Filter("Status", sap.ui.model.FilterOperator.EQ, "PENDING"));
            //mBindingParams.filters.push(new Filter("Vendor/Email", sap.ui.model.FilterOperator.EQ, "symantic.engineering@testemail.com"));
        },

        // Confirm Po Table Before Bind
        onbeforeRebindConfirmPoTable: function (oEvent) {
            var mBindingParams = oEvent.getParameter("bindingParams");
            mBindingParams.filters.push(new Filter("Status", sap.ui.model.FilterOperator.EQ, "CONFIRMED"));
            //mBindingParams.filters.push(new Filter("Vendor/Email", sap.ui.model.FilterOperator.EQ, "symantic.engineering@testemail.com"));
        },

        // Dispatched Po Table Before Bind
        onbeforeRebindDispatchPoTable: function (oEvent) {
            var mBindingParams = oEvent.getParameter("bindingParams");
            mBindingParams.filters.push(new Filter("Status", sap.ui.model.FilterOperator.EQ, "DISPATCHED"));
            //mBindingParams.filters.push(new Filter("Vendor/Email", sap.ui.model.FilterOperator.EQ, "symantic.engineering@testemail.com"));
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
            /*  var sKey = oEvent.getParameter("key");
             
             if (sKey === "OpenPOKey") {
                 this.byId("pageTitle").setText(this.getResourceBundle().getText("OpenPOs"));
             } else if (sKey == "ConfirmPOKey") {
                 this.byId("pageTitle").setText(this.getResourceBundle().getText("ConfirmedPOs"));
             } else {
                 this.byId("pageTitle").setText(this.getResourceBundle().getText("DispatchedPOs"));
             } */
        },

        //triggers on press of a PO cheveron item from the list
        onPurchaseOrderPress: function (oEvent) {
            // The source is the list item that got pressed
            this._showObject(oEvent.getSource());
        },

        _showObject: function (oItem) {
            var that = this;
            var sObjectPath = oItem.getBindingContext().sPath;
            that.getRouter().navTo("RoutePODetailPage", {
                POId: sObjectPath.slice("/PurchaseOrderSet".length) // /PurchaseOrders(123)->(123)
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
            var PlantCode = this.byId("idPlantCode").getValue();
          //  var CompanyCode = this.byId("idCompanyCode").getValue();
            var orFilters = [];
            var andFilters = [];

            var FreeTextSearch = this.byId("filterbar").getBasicSearchValue();
            if (FreeTextSearch) {
                orFilters.push(new Filter("PONumber", FilterOperator.Contains, FreeTextSearch));
                //   orFilters.push(new Filter("vendor/name", FilterOperator.EQ, FreeTextSearch));
              //  orFilters.push(new Filter("CompanyCode", FilterOperator.EQ, FreeTextSearch));
                orFilters.push(new Filter("PlantCode", FilterOperator.EQ, FreeTextSearch));
                //   aFilters.push(new Filter("purchase_order/parent_line_items/qty", FilterOperator.EQ, FreeTextSearch));

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

         /*   if (CompanyCode != "") {
                andFilters.push(new Filter("CompanyCode", FilterOperator.EQ, PlantCode));
            }*/

            if (PlantCode != "") {
                andFilters.push(new Filter("PlantCode", FilterOperator.EQ, PlantCode));
            }

            var idOpenPOTableBinding = this.getView().byId("idPurchaseOrdersTable").getTable().getBinding("items");
            var idConfirmPOTableBinding = this.getView().byId("idConfirmPOTable").getTable().getBinding("items");
            var idDispatchedPOTableBinding = this.getView().byId("idDispatchedPOTable").getTable().getBinding("items");
            
            if (andFilters.length == 0){
                andFilters.push(new Filter("PONumber", FilterOperator.NE, ""));
                idOpenPOTableBinding.filter(new Filter(andFilters, true));
                idConfirmPOTableBinding.filter(new Filter(andFilters, true));
                idDispatchedPOTableBinding.filter(new Filter(andFilters, true));
            }

            if (andFilters.length > 0){
                idOpenPOTableBinding.filter(new Filter(andFilters, true));
                idConfirmPOTableBinding.filter(new Filter(andFilters, true));
                idDispatchedPOTableBinding.filter(new Filter(andFilters, true));
            }
            // oTableBinding.filter(mFilters);
        },

        onResetFilters: function () {
            //this.byId("filterbar").setBasicSearch("");
            this.byId("idNameInput").setValue("");
            this.byId("idMaterialCode").setValue("");
            this.byId("dateRangeSelectionId").setValue("");
            this.byId("idPlantCode").setValue("");
           // this.byId("idVendorCode").setValue("");
            
            var idOpenPOTableBinding = this.getView().byId("idPurchaseOrdersTable").getTable().getBinding("items");
            var idConfirmPOTableBinding = this.getView().byId("idConfirmPOTable").getTable().getBinding("items");
            var idDispatchedPOTableBinding = this.getView().byId("idDispatchedPOTable").getTable().getBinding("items");
            idOpenPOTableBinding.filter([]);
            idConfirmPOTableBinding.filter([]);
            idDispatchedPOTableBinding.filter([]);
        },

        onFilterChange: function (oEvent) {
            //   if (oEvent.getSource().getValue().length){
            this.oFilterBar.fireFilterChange(oEvent);
            //  }
        },


        onViewLineItemsPress: function (oEvent) {
            var sParentItemPath = oEvent.getSource().getParent().getBindingContextPath();
            var sDialogTitle = "PO " + oEvent.getSource().getBindingContext().getObject().PONumber;
            var oDetails = {};
            oDetails.controller = this;
            oDetails.view = this.getView();
            oDetails.sParentItemPath = sParentItemPath;
            oDetails.title = sDialogTitle;
            if (!this.pDialog) {
                this.pDialog = Fragment.load({
                    id: oDetails.view.getId(),
                    name: "com.agel.mmts.vendorPersona.view.fragments.detailPage.ViewLineItemsDialog",
                    controller: oDetails.controller
                }).then(function (oDialog) {
                    // connect dialog to the root view of this component (models, lifecycle)
                    oDetails.view.addDependent(oDialog);
                    oDialog.bindElement({
                        path: oDetails.sParentItemPath,
                        parameters: {
                            "expand": 'ParentLineItems'
                        }
                    });
                    oDialog.setTitle(oDetails.title)
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
