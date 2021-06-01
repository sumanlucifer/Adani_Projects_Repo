sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    'sap/ui/core/ValueState'
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, ValueState) {
        "use strict";

		return BaseController.extend("com.agel.mmts.pmcg.controller.LandingPage", {

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

                // keeps the search state
                this._aTableSearchState = [];
                // Keeps reference to any of the created dialogs
                this._mViewSettingsDialogs = {};

                //adding searchfield association to filterbar and initialize the filter bar -> added in base controller
                this.initializeFilterBar();
            },
            
            _showObject: function (oItem) {
                var that = this;
                var sObjectPath = oItem.getBindingContext().sPath;
                that.getRouter().navTo("TCEngDetailPage", {
                    TCEngId: sObjectPath.slice("/BOQApprovalRequestSet".length) // /BOQApprovalRequestSet(123)->(123)
                });
            },
            
            onBOQRequestPress: function (oEvent) {
                // The source is the list item that got pressed
                this._showObject(oEvent.getSource());
            },
            
              // on Go Search 
          onSearch: function (oEvent) {
            var poNumber = this.byId("idNameInput").getValue();
            var boqName = this.byId("idBoqName").getValue();
            var DateRange = this.byId("dateRangeSelectionId");
            var DateRangeValue = this.byId("dateRangeSelectionId").getValue();
            var PlantCode = this.byId("idPlantCode").getValue();
            var VendorCode = this.byId("idVendorCode").getValue();
            var orFilters = [];
            var andFilters = [];

            var FreeTextSearch = this.byId("filterbar").getBasicSearchValue();
            if (FreeTextSearch) {
                orFilters.push(new Filter("ParentLineItem/PONumber", FilterOperator.Contains, FreeTextSearch));
                orFilters.push(new Filter("BOQGroupName", FilterOperator.Contains, FreeTextSearch));
              //  orFilters.push(new Filter("BOQGroupName", FilterOperator.EQ, FreeTextSearch));
                orFilters.push(new Filter("ParentLineItem/PurchaseOrder/Vendor/VendorCode", FilterOperator.EQ, FreeTextSearch));
                orFilters.push(new Filter("ParentLineItem/PurchaseOrder/PlantCode", FilterOperator.EQ, FreeTextSearch));
                //   aFilters.push(new Filter("purchase_order/parent_line_items/qty", FilterOperator.EQ, FreeTextSearch));

                andFilters.push(new Filter(orFilters, false));
            }

            // Po Number
            if (poNumber != "") {
                andFilters.push(new Filter("ParentLineItem/PONumber", FilterOperator.EQ, poNumber));
            }

             // BOQ Name
            if (boqName != "") {
                andFilters.push(new Filter("BOQGroupName", FilterOperator.EQ, boqName));
            }
            // Po Release Date
            if (DateRangeValue != "") {
                var From = new Date(DateRange.getFrom());
                var To = new Date(DateRange.getTo());
                andFilters.push(new Filter("ParentLineItem/PurchaseOrder/CreatedAt", FilterOperator.BT, From.toISOString(), To.toISOString()));
            }

            // Vendor Code
            if (VendorCode != "") {
                andFilters.push(new Filter("ParentLineItem/PurchaseOrder/Vendor/VendorCode", FilterOperator.EQ, VendorCode));
            }

            // Plant Code
            if (PlantCode != "") {
                andFilters.push(new Filter("ParentLineItem/PurchaseOrder/PlantCode", FilterOperator.EQ, PlantCode));
            }

             var idBOQRequestTableBinding = this.getView().byId("idBOQRequestTable").getTable().getBinding("items");
             if (andFilters.length == 0){
                andFilters.push(new Filter("ParentLineItem/PONumber", FilterOperator.NE, ""));
                idBOQRequestTableBinding.filter(new Filter(andFilters, true));
            }


            if (andFilters.length > 0){
                idBOQRequestTableBinding.filter(new Filter(andFilters, true));
            }
            // oTableBinding.filter(mFilters);
        },

        onResetFilters: function (oEvent) {
         //   this.byId("filterbar").setBasicSearchValue("");
            this.byId("idNameInput").setValue("");
            this.byId("idBoqName").setValue("");
            this.byId("dateRangeSelectionId").setValue("");
            this.byId("idPlantCode").setValue("");
            this.byId("idVendorCode").setValue("");
            var oTable = this.getView().byId("idBOQRequestTable").getTable();
            var oBinding = oTable.getBinding("items");
            oBinding.filter([]);
        },

            onFilterChange: function (oEvent) {
                //   if (oEvent.getSource().getValue().length){
                this.oFilterBar.fireFilterChange(oEvent);
                //  }
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

            

            onBeforeRebindBOQTable: function (oEvent) {
                var mBindingParams = oEvent.getParameter("bindingParams");
                mBindingParams.sorter.push(new sap.ui.model.Sorter("CreatedAt", true));
            }
        
		});
	});
