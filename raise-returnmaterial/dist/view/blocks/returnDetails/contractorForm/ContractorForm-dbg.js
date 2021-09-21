sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
    "use strict";

    var BuyerFormBlock = BlockBase.extend("com.agel.mmts.raisereturnmaterial.view.blocks.returnDetails.contractorForm.ContractorForm", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.agel.mmts.raisereturnmaterial.view.blocks.returnDetails.contractorForm.ContractorForm",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.agel.mmts.raisereturnmaterial.view.blocks.returnDetails.contractorForm.ContractorForm",
                    type: "XML"
                }
            }
        }
    });

    return BuyerFormBlock;
});
