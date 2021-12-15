sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    // "sap/ui/model/FilterOperator",
    // "sap/ui/core/Fragment",
    // "sap/ui/model/Sorter",
    // "sap/ui/Device",
    // 'sap/ui/core/ValueState',
    // "jquery.sap.global",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (BaseController, JSONModel, Filter, MessageBox, MessageToast) {
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
                aLanes = oProcessFlowData.lanes,
                aNodesProperties = ["PackingListCreatedAt", "SentForPrintingAssistanceOn", "PrintingApprovalActionDate", "DispatchedOn",
                    "GateEntryDate", "UnloadedOn", "GRNDate", "UDDate"
                ];
            // aNodesProperties = ["PackingListCreatedAt", "GateEntryDate", "UnloadedOn", "PackingGRNDateListCreatedAt", "UDDate"
            // ];

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

            // Remove Printing Approval Lane and Nodes associated with that Lane
            // When SentForPrintingAssistanceOn or PrintingApprovalActionDate is not available but DispatchedOn is available
            if (oDataObj.hasOwnProperty("SentForPrintingAssistanceOn") && oDataObj.hasOwnProperty("DispatchedOn")) {
                if (oDataObj.DispatchedOn && (!oDataObj.SentForPrintingAssistanceOn || !oDataObj.PrintingApprovalActionDate)) {
                    aNodes[0].children = [4];
                    aLanes.splice(1, 1);
                    aNodes.splice(1, 2);

                    for (var j = 1; j < aLanes.length; j++) {
                        aLanes[j].position = aLanes[j].position - 1;
                        aLanes[j].id = (Number(aLanes[j].id) - 1).toString();
                        aNodes[j].lane = (Number(aNodes[j].lane) - 1).toString();
                    }
                }
            }

            this.getView().getModel("ProcessFlowModel").setProperty("/lanes", aLanes);
            this.getView().getModel("ProcessFlowModel").setProperty("/nodes", aNodes);
            this.oProcessFlow = this.getView().byId("processflow");
            this.oProcessFlow.updateModel();
        },

        onOnError: function (event) {
            var sExceptionMessage = this.getResourceBundle().getText("Exceptionoccurred", [event.getParameters().text]);
            MessageToast.show(sExceptionMessage);
        },

        onNodePress: function (event) {
            var sNodePressMessage = this.getResourceBundle().getText("NodeHasClick", [event.getParameters().getNodeId()]);
            MessageToast.show(sNodePressMessage);
        },

        onZoomIn: function () {
            var sZoomLevelChangedMessage = this.getResourceBundle().getText("Zoomlevelchanged", [this.oProcessFlow.getZoomLevel()]);
            this.oProcessFlow.zoomIn();
            MessageToast.show(sZoomLevelChangedMessage);
        },

        onZoomOut: function () {
            var sZoomLevelChangedOutMessage = this.getResourceBundle().getText("Zoomlevelchanged", [this.oProcessFlow.getZoomLevel()]);
            this.oProcessFlow.zoomOut();
            MessageToast.show(sZoomLevelChangedOutMessage);
        }
    });
});