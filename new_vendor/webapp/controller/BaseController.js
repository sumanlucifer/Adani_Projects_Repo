sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/core/BusyIndicator',
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, BusyIndicator, JSONModel, History, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("com.agel.mmts.newvendor.controller.BaseController", {
        /**
         * Convenience method for accessing the router.
         * @public
         * @returns {sap.ui.core.routing.Router} the router for this component
         */
        getRouter: function () {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },

        addContentDensityClass: function () {
            return this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
        },

        /**
         * Convenience method for getting the view model by name.
         * @public
         * @param {string} [sName] the model name
         * @returns {sap.ui.model.Model} the model instance
         */
        getViewModel: function (sName) {
            return this.getView().getModel(sName);
        },

        getComponentModel: function () {
            return this.getOwnerComponent().getModel();
        },

        /**
         * Convenience method for setting the view model.
         * @public
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {string} sName the model name
         */
        setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        /**
         * Getter for the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        //for controlling global busy indicator        
        presentBusyDialog: function () {
            BusyIndicator.show();
        },

        dismissBusyDialog: function () {
            BusyIndicator.hide();
        },

        initializeFilterBar: function () {
            this._addSearchFieldAssociationToFB();

            this.oFilterBar = null;
            this.oFilterBar = this.byId("idFilterbar");

            this.oFilterBar.registerFetchData(this.fFetchData);
            this.oFilterBar.registerApplyData(this.fApplyData);
            this.oFilterBar.registerGetFiltersWithValues(this.fGetFiltersWithValues);

            this.oFilterBar.fireInitialise();
        },

        _addSearchFieldAssociationToFB: function () {
            let oFilterBar = this.getView().byId("idFilterbar");
            let oSearchField = oFilterBar.getBasicSearch();
            var oBasicSearch;
            if (!oSearchField) {
                // @ts-ignore   
                oBasicSearch = new sap.m.SearchField({
                    id: "idSearch", showSearchButton: false,
                    placeholder: "Search"
                });
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


        /**
        * Adds a history entry in the FLP page history
        * @public
        * @param {object} oEntry An entry object to add to the hierachy array as expected from the ShellUIService.setHierarchy method
        * @param {boolean} bReset If true resets the history before the new entry is added
        */
        addHistoryEntry: function () {
            var aHistoryEntries = [];

            return function (oEntry, bReset) {
                if (bReset) {
                    aHistoryEntries = [];
                }

                var bInHistory = aHistoryEntries.some(function (entry) {
                    return entry.intent === oEntry.intent;
                });

                if (!bInHistory) {
                    aHistoryEntries.push(oEntry);
                    this.getOwnerComponent().getService("ShellUIService").then(function (oService) {
                        oService.setHierarchy(aHistoryEntries);
                    });
                }
            };
        },

        checkValidationEmail: function (oEvent) {
            var RegularExpression =
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,

                bValidEmailId = RegularExpression.test(oEvent.getSource().getValue());

            if (!bValidEmailId) {
                oEvent.getSource().setValueState("Error");
                oEvent.getSource().setValueStateText(this.getResourceBundle().getText("EnterValidEmailId"));
            } else {
                oEvent.getSource().setValueState("None");
            }
        },

        fnRemoveErrorState: function () {
            var oForm = this.getView().byId("idEditBasicDetailsSFM").getContent();

            oForm.forEach(function (Field) {
                if ((typeof Field.getValue === "function" && Field.getRequired())) {
                    Field.setValueState("None");
                }
            });
        },

        fnValidateFieldsAndSaveVendorData: function (bVendorCreateUpdateFlag) {
            var bRequiredFieldsError = false,
                bInValidEmail = false,
                bInValidLocMapping = false,
                oForm = this.getView().byId("idEditBasicDetailsSFM").getContent();

            oForm.forEach(function (Field) {
                if ((typeof Field.getValue === "function" && Field.getRequired())) {
                    if (!Field.getValue() || Field.getValue().length < 1) {
                        Field.setValueState("Error");
                        bRequiredFieldsError = true;

                        if (Field.getName() === "Email") {
                            var RegularExpression =
                                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                            bInValidEmail = RegularExpression.test(Field.getValue());
                        }
                    }
                    else {
                        Field.setValueState("None");
                    }
                }
            });

            if (bRequiredFieldsError) {
                MessageBox.error(this.getResourceBundle().getText("PleasefillallrequiredFields"));
                return;
            }

            if (bInValidEmail) {
                MessageBox.error(this.getResourceBundle().getText("PleaseentervalidEmailID"));
                return;
            }

            bInValidLocMapping = this.fnValidateLocationMappings(bVendorCreateUpdateFlag);
            if (bInValidLocMapping === false) {
                var oVendorObj = this.getView().getModel("VendorViewModel").getData();
                if (bVendorCreateUpdateFlag === "Create") {
                    var sCreateMsg = "VendorCreateSuccess";
                    this.fnSaveVendorDetails(oVendorObj, sCreateMsg);
                } else {
                    var sUpdateMsg = "VendorUpdateSuccess";
                    for (var i = 0; i < oVendorObj.Mappings.length; i++) {
                        //delete (oVendorObj.Mappings[i].PlantCode);
                        delete (oVendorObj.Mappings[i].CompanyCode);
                    }
                    this.fnSaveVendorDetails(oVendorObj, sUpdateMsg);
                }
            }

            this.getView().getModel().refresh(true);
        },

        fnValidateLocationMappings: function (bVendorCreateUpdateFlag) {
            var bErrorFound = false,
                aMappingData = this.getView().getModel("VendorViewModel").getProperty("/Mappings"),
                iDuplicateMappingFound = false,
                iIncompleteMappingIndex;

            if (bVendorCreateUpdateFlag === "Create") {
                iIncompleteMappingIndex = aMappingData.findIndex(function (oMapping) {
                    // return oMapping.CompanyCode === null || oMapping.CompanyCodeId === null || oMapping.PlantCode === null || oMapping.PlantId === null;
                    return oMapping.CompanyCode === null || oMapping.CompanyCodeId === null;
                });
            }
            else {
                iIncompleteMappingIndex = aMappingData.findIndex(function (oMapping) {
                    // return oMapping.CompanyPlantMappingId === null && (oMapping.CompanyCode === null || oMapping.CompanyCodeId === null || oMapping.PlantCode === null || oMapping.PlantId === null);
                    return oMapping.CompanyPlantMappingId === null && (oMapping.CompanyCode === null || oMapping.CompanyCodeId === null);
                });
            }

            if (iIncompleteMappingIndex >= 0) {
                MessageBox.error(this.getResourceBundle().getText("ErrorInvalidLocations"));
                bErrorFound = true;
            }
            else {
                for (var i = 0; i < aMappingData.length; i++) {
                    var iDuplicateMappings = aMappingData.filter(function (oMapping) {
                        // return oMapping.CompanyCode === aMappingData[i].CompanyCode && oMapping.PlantCode === aMappingData[i].PlantCode;
                        return oMapping.CompanyCode === aMappingData[i].CompanyCode;
                    });

                    iDuplicateMappingFound = iDuplicateMappings.length > 1 ? true : false;
                }

                if (iDuplicateMappingFound) {
                    MessageBox.error(this.getResourceBundle().getText("ErrorDuplicateLocations"));
                    bErrorFound = true;
                }
            }
            return bErrorFound;
        },

        onAddCompanyPlantMapping: function () {
            var oNewMapping = {
                "CompanyPlantMappingId": null,
                "CompanyCodeId": null,
                // "PlantId": null,
                "IsActive": true,
                // "PlantSuggestionList": []
            },
                aCompanyPlantMappings = this.getView().getModel("VendorViewModel").getProperty("/Mappings");

            aCompanyPlantMappings.unshift(oNewMapping);

            this.getView().getModel("VendorViewModel").setProperty("/Mappings", aCompanyPlantMappings);
            this.getView().getModel("VendorViewModel").refresh(true);
        },

        onCompanycodeSelect: function (oEvent) {
            var sItemPath = oEvent.getSource().getBindingContext("VendorViewModel").getPath();

            if (oEvent.getParameter("selectedItem")) {
                var sCompanyCode = oEvent.getParameter("selectedItem").getBindingContext().getObject().ID;
                this.getView().getModel("VendorViewModel").setProperty(sItemPath + "/CompanyCodeId", sCompanyCode);
            }
            else {
                this.getView().getModel("VendorViewModel").setProperty(sItemPath + "/CompanyCodeId", null);
                this.getView().getModel("VendorViewModel").setProperty(sItemPath + "/CompanyCode", null);
            }
        },

        onPlantCodeSelect: function (oEvent) {
            var sItemPath = oEvent.getSource().getBindingContext("VendorViewModel").getPath();
            if (oEvent.getParameter("selectedItem")) {
                var sPlantId = oEvent.getParameter("selectedItem").getBindingContext().getObject().ID;
                this.getView().getModel("VendorViewModel").setProperty(sItemPath + "/PlantId", sPlantId);
            }
            else {
                this.getView().getModel("VendorViewModel").setProperty(sItemPath + "/PlantId", null);
                this.getView().getModel("VendorViewModel").setProperty(sItemPath + "/PlantCode", null);
            }
        },

        fnGetPlantSuggestionList: function (sCompanyCode, sItemPath) {
            //Set View busy while loading data from entity
            this.getView().setBusy(true);
            var oFilter = new Filter("CompanyCode", FilterOperator.EQ, sCompanyCode);

            this.getView().getModel().read("/MasterPlantDetailSet", {
                filters: [oFilter],
                success: function (oResponse) {
                    if (oResponse.results.length) {
                        this.getView().getModel("VendorViewModel").setProperty(sItemPath + "/PlantSuggestionList", oResponse.results);
                    } else {
                        this.getView().getModel("VendorViewModel").setProperty(sItemPath + "/PlantSuggestionList", []);
                    }
                    this.getView().setBusy(false);
                }.bind(this),
                error: function (oError) {
                    MessageBox.error(this.getResourceBundle().getText("ErrorFetchingPlant"));
                    this.getView().setBusy(false);
                }.bind(this),
            });
        },

        onVendorIsActiveFlagChange: function (oEvent) {
            var bVendorIsActiveState = oEvent.getSource().getState(),
                bVendorIsActive = bVendorIsActiveState === true ? true : false;

            this.getView().getModel("VendorViewModel").setProperty("/IsActive", bVendorIsActive);
        },

        onMappingsIsActiveFlagChange: function (oEvent) {
            var bMappingIsActiveState = oEvent.getSource().getState(),
                sItemPath = oEvent.getSource().getBindingContext("VendorViewModel").getPath(),
                bMappingIsActive = bMappingIsActiveState === true ? true : false;

            this.getView().getModel("VendorViewModel").setProperty(sItemPath + "/IsActive", bMappingIsActive);
        },

        fnResetViewAndNavBack: function () {
            var sPath = jQuery.sap.getModulePath("com.agel.mmts.newvendor", "/model/VendorData.json"),
                oVendorViewModel = new JSONModel(sPath),
                oHistory = History.getInstance(),
                sPreviousHash = oHistory.getPreviousHash();

            this.getView().setModel(oVendorViewModel, "VendorViewModel")

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteVendorList", true);
                this.getView().getModel("VendorViewModel").refresh(true);
            }
        },

        fnSaveVendorDetails: function (oVendorObj, sSuccessMsg) {
            //Set View busy while loading data from entity
            this.getView().setBusy(true);

            // Save vendor details to backend and navigate to vendor List page
            this.getView().getModel().create("/AddVendorEdmSet", oVendorObj, {
                success: function (oResponse) {
                    MessageBox.success(
                        this.getResourceBundle().getText(sSuccessMsg, [oResponse.VendorCode]), {
                        onClose: function (sButton) {
                            if (sButton === MessageBox.Action.OK) {
                                this.fnResetViewAndNavBack();
                            }
                        }.bind(this),
                    });
                    this.getView().setBusy(false);
                }.bind(this),
                error: function (oError) {
                    MessageBox.error(this.getResourceBundle().getText("ErrorWhileSaving"));
                    this.getView().setBusy(false);
                }.bind(this)
            });
        }
    });
});