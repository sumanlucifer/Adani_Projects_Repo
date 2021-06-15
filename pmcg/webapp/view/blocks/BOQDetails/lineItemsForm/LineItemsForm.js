sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
    "use strict";

    var LineItemsForm = BlockBase.extend("com.agel.mmts.pmcg.view.blocks.BOQDetails.lineItemsForm.LineItemsForm", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.pmcg.view.blocks.BOQDetails.lineItemsForm.LineItemsForm",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.pmcg.view.blocks.BOQDetails.lineItemsForm.LineItemsForm",
                    type: "XML"
                }
            }
        }
    });

    return LineItemsForm;
});
