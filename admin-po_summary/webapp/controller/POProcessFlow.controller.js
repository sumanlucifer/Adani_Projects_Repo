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
    "sap/m/MessageBox"
], function (BaseController, JSONModel, Filter, FilterOperator, Fragment, Sorter, Device, ValueState, jquery, MessageBox) {
    "use strict";

    return BaseController.extend("com.agel.mmts.adminposummary.controller.POProcessFlow", {
    	onInit: function () {
			var sDataPath = sap.ui.require.toUrl("com/agel/mmts/adminposummary/model/ProcessFlowNodes.json");
			var oModel = new JSONModel(sDataPath);
			this.getView().setModel(oModel);

			this.oProcessFlow = this.getView().byId("processflow");
			this.oProcessFlow.updateModel();
		},

		onOnError: function( event ) {
			MessageToast.show("Exception occurred: " + event.getParameters().text);
		},

		onNodePress: function(event) {
			MessageToast.show("Node " + event.getParameters().getNodeId() + " has been clicked.");
		},

		onZoomIn: function () {
			this.oProcessFlow.zoomIn();

			MessageToast.show("Zoom level changed to: " + this.oProcessFlow.getZoomLevel());
		},

		onZoomOut: function () {
			this.oProcessFlow.zoomOut();

			MessageToast.show("Zoom level changed to: " + this.oProcessFlow.getZoomLevel());
		},

		onUpdateModel: function () {
			var aNodes = this.oProcessFlow.getNodes();
			aNodes[0].setState(SuiteLibrary.ProcessFlowNodeState.Planned);
			aNodes[1].setState(SuiteLibrary.ProcessFlowNodeState.Negative);
			aNodes[1].setStateText("Negative");
			aNodes[1].setTexts("Document State updated");
			aNodes[2].setState(SuiteLibrary.ProcessFlowNodeState.Positive);
			aNodes[2].setStateText("State Text changed");
			aNodes[2].setTitle("Invoice OK");

			this.oProcessFlow.updateNodesOnly();
			MessageToast.show("Model has been updated.");
		}
    });
});