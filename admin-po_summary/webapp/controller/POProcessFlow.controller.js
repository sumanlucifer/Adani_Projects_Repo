sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/Device",
    'sap/ui/core/ValueState',
    "jquery.sap.global",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, ValueState, jquery, MessageBox, MessageToast) {
    "use strict";

    return BaseController.extend("com.agel.mmts.adminposummary.controller.POProcessFlow", {
        onInit: function () {
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0,
                PCListID: ""
            });
            this.setModel(oViewModel, "objectViewModel");

            this.oRouter = this.getRouter();
            this.oRouter.getRoute("POProcessFlow").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sObjectId = oEvent.getParameter("arguments").PackingListId;
            var sDataPath = sap.ui.require.toUrl("com/agel/mmts/adminposummary/model/ProcessFlowNodes.json");
            var oProcessFlowModel = new JSONModel(sDataPath);
            this.getView().setModel(oProcessFlowModel, "ProcessFlowModel");

            this.oProcessFlow = this.getView().byId("processflow");
            this.oProcessFlow.updateModel();

            this.fnGetPackingListJourneyDetails(sObjectId);
        },

        fnGetPackingListJourneyDetails: function (sObjectId) {
            this.getViewModel("objectViewModel").setProperty(
                "/busy",
                true
            );
            this.getComponentModel().read("/PackingListJourneyViewSet" + sObjectId, {
                success: function (oData) {
                    this.getViewModel("objectViewModel").setProperty(
                        "/busy",
                        false
                    );
                    if (oData)
                        this.fnSetProcessFlowNodesData(oData);
                    else
                        sap.m.MessageBox.error(oData.Message);

                }.bind(this),
                error: function (oError) {
                    this.getViewModel("objectViewModel").setProperty(
                        "/busy",
                        false
                    );
                   // sap.m.MessageBox.success(JSON.stringify(oError));

                }.bind(this)
            });
        },

        fnSetProcessFlowNodesData: function (oDataObj) {
            var oProcessFlowData = this.getView().getModel("ProcessFlowModel").getData(),
                aNodes = oProcessFlowData.nodes,
                aNodesProperties = ["PackingListCreatedAt", "SentForPrintingAssistanceOn", "PrintingApprovalActionDate", "DispatchedOn",
                    "GateEntryDate", "UnloadedOn", "PackingGRNDateListCreatedAt", "UDDate"
                ];

            this.getView().getModel("objectViewModel").setProperty("/PCListID", oDataObj.PackingListNumber);

            for (var i = 0; i < aNodesProperties.length; i++) {
                if (oDataObj.hasOwnProperty(aNodesProperties[i]) && oDataObj[aNodesProperties[i]]) {
                    aNodes[i].state = "Positive";
                    aNodes[i].texts = ["Date: " + new Date(oDataObj[aNodesProperties[i]]).toLocaleString().split(", ")[0],
                    "Time: " + new Date(oDataObj[aNodesProperties[i]]).toLocaleString().split(", ")[1]
                    ];
                } else {
                    aNodes[i].state = "Critical";
                    aNodes[i].stateText = "Pending";
                    aNodes[i].texts[0] = [];
                }
            }

            this.getView().getModel("ProcessFlowModel").setProperty("/nodes", aNodes);
            this.oProcessFlow = this.getView().byId("processflow");
            this.oProcessFlow.updateModel();
        },

        onOnError: function (event) {
            MessageToast.show("Exception occurred: " + event.getParameters().text);
        },

        onNodePress: function (event) {
            MessageToast.show("Node " + event.getParameters().getNodeId() + " has been clicked.");
        },

        onZoomIn: function () {
            this.oProcessFlow.zoomIn();
            MessageToast.show("Zoom level changed to: " + this.oProcessFlow.getZoomLevel());
        },

        onZoomOut: function () {
            this.oProcessFlow.zoomOut();
            MessageToast.show("Zoom level changed to: " + this.oProcessFlow.getZoomLevel());
        }
    });
});