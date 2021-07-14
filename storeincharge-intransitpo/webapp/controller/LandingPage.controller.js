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

    return BaseController.extend("com.agel.mmts.storeinchargeintransitpo.controller.LandingPage", {
        formatter: formatter,

        onInit: function () {
            //Router Object
            // this.oRouter = this.getRouter();
            // this.oRouter.getRoute("RouteLandingPage").attachPatternMatched(this._onObjectMatched, this);

            //view model instatiation
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0
            });
            this.setModel(oViewModel, "objectViewModel");

            // Icon Tab Count Model
            var oIconTabCountModel = new JSONModel({
                confirmCount: null
            });
            this.setModel(oIconTabCountModel, "oIconTabCountModel");

            // keeps the search state
            this._aTableSearchState = [];
            // Keeps reference to any of the created dialogs
            this._mViewSettingsDialogs = {};

            //adding searchfield association to filterbar and initialize the filter bar -> added in base controller
            this.initializeFilterBar();
        },

        // _onObjectMatched: function (oEvent) {
        //     var startupParams = this.getOwnerComponent().getComponentData().startupParameters;
        //     // get Startup params from Owner Component
        //     if ((startupParams.type)) {
        //         //this.type = startupParams.type;
        //         this.byId("idIconTabBar").setSelectedKey(startupParams.type);
        //         this.onIconTabBarChanged(startupParams.type);
        //     }
        // },

        // Confirm Po Table Before Bind
        onbeforeRebindConfirmPoTable: function (oEvent) {
            // var mBindingParams = oEvent.getParameter("bindingParams");
            // mBindingParams.filters.push(new Filter("POStatusAsPerPackingList", sap.ui.model.FilterOperator.EQ, 2));
            // mBindingParams.filters.push(new Filter("POStatusAsPerPackingList", sap.ui.model.FilterOperator.EQ, 3));
        },

        onInTransitPOTableUpdateFinished: function (oEvent) {
            //Setting the header context for a property binding to $count                       
            this.setIconTabCount(oEvent, oEvent.getParameter("total"), "/confirmCount");
        },

        setIconTabCount: function (oEvent, total, property) {
            if (oEvent.getSource().getBinding("items").isLengthFinal()) {
                this.getView().getModel("oIconTabCountModel").setProperty(property, total);
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
            // that.getRouter().navTo("RoutePODetailPage", {
            //     POId: sObjectPath.slice("/PurchaseOrderSet".length) 
            // });
            if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {
                var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
                var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                    target: {
                        semanticObject: "TotalDetails",
                        action: "manage"
                    },
                    params: {
                        "ID": sObjectPath.slice("/PurchaseOrderSet".length),
                        "Type": "INTRANSIT"
                    }
                })) || ""; // generate the Hash to display PO Number
                oCrossAppNavigator.toExternal({
                    target: {
                        shellHash: hash
                    } //Navigate to details page
                });
            }
            else {
                jQuery.sap.log.info("Navigating as Standalone Application");
                // var sOrigin = window.parent.location.origin;
                // var sNavPath = sOrigin + "/comagelmmtsstoreinchargetotaldetails/index.html/" ;// + sObjectPath.slice("/PurchaseOrderSet".length);
                // window.location.replace(sNavPath);
            }

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
            //  var CompanyCode = this.byId("idCompanyCode").getValue();
            var orFilters = [];
            var andFilters = [];

            var FreeTextSearch = this.byId("filterbar").getBasicSearchValue();
            if (FreeTextSearch) {
                orFilters.push(new Filter("PONumber", FilterOperator.Contains, FreeTextSearch));
                orFilters.push(new Filter("Buyer/CompanyCode", FilterOperator.EQ, FreeTextSearch));
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
                andFilters.push(new Filter("Buyer/CompanyCode", FilterOperator.EQ, CompanyCode));
            }

            var idInTransitPOTableBinding = this.getView().byId("idInTransitPOTable").getTable().getBinding("items");

            if (andFilters.length == 0) {
                andFilters.push(new Filter("PONumber", FilterOperator.NE, ""));
                idInTransitPOTableBinding.filter(new Filter(andFilters, true));
            }

            if (andFilters.length > 0) {
                idInTransitPOTableBinding.filter(new Filter(andFilters, true));
            }
            // oTableBinding.filter(mFilters);
        },

        onResetFilters: function () {
            this.oFilterBar._oBasicSearchField.setValue("");
            this.byId("idNameInput").setValue("");
            this.byId("dateRangeSelectionId").setValue("");
            this.byId("idCompanyCode").setValue("");

            var idInTransitPOTableBinding = this.getView().byId("idInTransitPOTable").getTable().getBinding("items");

            idInTransitPOTableBinding.filter([]);
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
                    name: "com.agel.mmts.storeinchargeintransitpo.view.fragments.landingPage.ViewLineItemsDialog",
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